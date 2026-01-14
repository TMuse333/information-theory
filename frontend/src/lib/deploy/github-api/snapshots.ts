/**
 * GitHub API Snapshot Operations
 *
 * Functions for saving and regenerating production snapshots
 */

import { Octokit } from '@octokit/rest';
import { GITHUB_OWNER, GITHUB_REPO, PRODUCTION_BRANCH } from './config';
import { generateAllPageFiles } from '../generators/generatePageFiles';

/**
 * Save production snapshot to GitHub
 * Stores websiteData.json snapshot in production-snapshots/ folder
 *
 * @param websiteData - The website data to snapshot
 * @param version - Version number for the snapshot
 * @param commitSha - The production deployment commit SHA
 * @returns Success/failure result
 */
export async function saveProductionSnapshot(
  websiteData: any,
  version: number,
  commitSha: string
): Promise<{ success: boolean; message: string; error?: string }> {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    return {
      success: false,
      message: 'GITHUB_TOKEN not set',
      error: 'Missing GITHUB_TOKEN environment variable',
    };
  }

  const octokit = new Octokit({ auth: githubToken });

  try {
    // 1. Get current production branch reference
    const { data: ref } = await octokit.git.getRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: `heads/${PRODUCTION_BRANCH}`,
    });
    const currentSha = ref.object.sha;

    // 2. Get current commit to get base tree
    const { data: currentCommit } = await octokit.git.getCommit({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      commit_sha: currentSha,
    });
    const baseTreeSha = currentCommit.tree.sha;

    // 3. Create snapshot metadata
    const snapshotMetadata = {
      version,
      timestamp: new Date().toISOString(),
      commitSha,
      websiteData,
    };

    // 4. Create blob for snapshot file
    // Path WITH 'frontend/' prefix to match repository structure
    const snapshotPath = `frontend/production-snapshots/v${version}.json`;
    const snapshotContent = JSON.stringify(snapshotMetadata, null, 2);

    const { data: blob } = await octokit.git.createBlob({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      content: Buffer.from(snapshotContent).toString('base64'),
      encoding: 'base64',
    });

    // 5. Create new tree with snapshot file
    const { data: newTree } = await octokit.git.createTree({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      base_tree: baseTreeSha,
      tree: [
        {
          path: snapshotPath,
          mode: '100644',
          type: 'blob',
          sha: blob.sha,
        },
      ],
    });

    // 6. Create commit for snapshot
    // IMPORTANT: [vercel skip] tells Vercel to ignore this commit and not trigger a deployment
    // This prevents double deployments (one for the actual code, one for the snapshot)
    const snapshotCommitMessage = `Save production snapshot v${version} [vercel skip]\n\nSnapshot of websiteData.json for production-v${version}`;
    const { data: newCommit } = await octokit.git.createCommit({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      message: snapshotCommitMessage,
      tree: newTree.sha,
      parents: [currentSha],
    });

    // 7. Update production branch with snapshot commit
    await octokit.git.updateRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: `heads/${PRODUCTION_BRANCH}`,
      sha: newCommit.sha,
      force: false,
    });

    return {
      success: true,
      message: `Snapshot v${version} saved to ${snapshotPath}`,
    };
  } catch (error: any) {
    // Don't fail deployment if snapshot fails
    return {
      success: false,
      message: 'Snapshot save failed (non-critical)',
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Regenerate .data.ts files from a production snapshot
 *
 * This function:
 * 1. Fetches the specified snapshot from the production branch
 * 2. Regenerates all .data.ts files from the snapshot's websiteData
 * 3. Commits the regenerated files back to main branch
 *
 * This ensures .data.ts files are always in sync with the production snapshot.
 */
export async function regenerateDataFilesFromSnapshot(
  version: number
): Promise<{ success: boolean; message: string; error?: string; commitSha?: string }> {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    return {
      success: false,
      message: 'GITHUB_TOKEN not set',
      error: 'Missing GITHUB_TOKEN environment variable',
    };
  }

  const octokit = new Octokit({ auth: githubToken });

  try {
    console.log(`🔄 [REGENERATE] Fetching snapshot v${version} to regenerate .data.ts files...`);

    // 1. Fetch the snapshot from production branch
    const snapshotPath = `frontend/production-snapshots/v${version}.json`;
    const { data: snapshotFile } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: snapshotPath,
      ref: PRODUCTION_BRANCH,
    });

    if (!('content' in snapshotFile) || !snapshotFile.content) {
      throw new Error('Snapshot file content not found');
    }

    // 2. Decode and parse snapshot
    const snapshotContent = Buffer.from(snapshotFile.content, 'base64').toString('utf-8');
    const snapshot = JSON.parse(snapshotContent);
    const websiteData = snapshot.websiteData;

    if (!websiteData) {
      throw new Error('websiteData not found in snapshot');
    }

    console.log(`   ✓ Retrieved snapshot v${version} with ${Object.keys(websiteData.pages || {}).length} pages`);

    // 3. Regenerate .data.ts files from snapshot's websiteData
    const seoMetadata: Record<string, any> = {};
    const allGeneratedFiles = generateAllPageFiles(websiteData, seoMetadata);

    // Filter to only include .data.ts files
    const dataFiles = allGeneratedFiles.filter(file => file.path.endsWith('.data.ts'));

    console.log(`   ✓ Regenerated ${dataFiles.length} .data.ts files from snapshot`);

    // 4. Get current main branch reference
    const { data: ref } = await octokit.git.getRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: `heads/${PRODUCTION_BRANCH}`,
    });
    const currentSha = ref.object.sha;

    // 5. Get current commit to get base tree
    const { data: currentCommit } = await octokit.git.getCommit({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      commit_sha: currentSha,
    });
    const baseTreeSha = currentCommit.tree.sha;

    // 6. Create blobs for all .data.ts files
    const blobPromises = dataFiles.map(async (file) => {
      const { data: blob } = await octokit.git.createBlob({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        content: Buffer.from(file.content).toString('base64'),
        encoding: 'base64',
      });
      return { path: file.path, sha: blob.sha };
    });

    const blobs = await Promise.all(blobPromises);
    console.log(`   ✓ Created ${blobs.length} blobs for .data.ts files`);

    // 7. Create new tree with all .data.ts files
    const { data: newTree } = await octokit.git.createTree({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      base_tree: baseTreeSha,
      tree: blobs.map(blob => ({
        path: blob.path,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blob.sha,
      })),
    });

    console.log(`   ✓ Created tree with ${dataFiles.length} .data.ts files`);

    // 8. Create commit for regenerated files
    const commitMessage = `Sync .data.ts files with production snapshot v${version} [vercel skip]\n\nRegenerated ${dataFiles.length} .data.ts files from production-snapshots/v${version}.json to ensure data consistency.`;
    const { data: newCommit } = await octokit.git.createCommit({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      message: commitMessage,
      tree: newTree.sha,
      parents: [currentSha],
    });

    console.log(`   ✓ Created commit: ${newCommit.sha.substring(0, 7)}`);

    // 9. Update main branch with new commit
    await octokit.git.updateRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: `heads/${PRODUCTION_BRANCH}`,
      sha: newCommit.sha,
      force: false,
    });

    console.log(`✅ [REGENERATE] Successfully synced ${dataFiles.length} .data.ts files with snapshot v${version}`);

    return {
      success: true,
      message: `Regenerated ${dataFiles.length} .data.ts files from snapshot v${version}`,
      commitSha: newCommit.sha,
    };
  } catch (error: any) {
    console.error(`❌ [REGENERATE] Failed to regenerate .data.ts files from snapshot v${version}:`, error);

    return {
      success: false,
      message: 'Failed to regenerate .data.ts files from snapshot',
      error: error.message || 'Unknown error',
    };
  }
}
