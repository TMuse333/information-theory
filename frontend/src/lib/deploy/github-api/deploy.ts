/**
 * GitHub API Deployment
 *
 * Main deployment function using GitHub API
 *
 * Benefits over git CLI:
 * - No file system changes (all happens in memory)
 * - No server restarts (Next.js file watcher not triggered)
 * - Works in browser/production context (no git commands needed)
 * - Proper timeouts (network requests have built-in timeout handling)
 */

import { Octokit } from '@octokit/rest';
import type { ComponentFileContent } from '../copyComponents';
import { filterFilesForProduction, logFilterResults } from '../production-filter';
import { GITHUB_OWNER, GITHUB_REPO, PRODUCTION_BRANCH } from './config';
import { collectRequiredUtilityFiles, collectCriticalConfigFiles } from './file-collectors';
import { getNextVersion } from './utils';
import type { GitHubDeployResult } from './types';

/**
 * Deploy to production using GitHub API
 *
 * This approach:
 * 1. Gets current production branch SHA
 * 2. Creates blobs for each file in memory
 * 3. Creates a new tree with the blobs
 * 4. Creates a new commit
 * 5. Updates the production branch reference
 * 6. Creates a tag
 *
 * No file system changes, no server restarts!
 *
 * @param componentFiles - Component files to deploy
 * @param pageFiles - Page files to deploy
 * @param commitMessage - Commit message
 * @param dryRun - If true, only simulate the deployment
 * @returns GitHubDeployResult with details
 */
export async function deployToProductionViaAPI(
  componentFiles: ComponentFileContent[],
  pageFiles: ComponentFileContent[],
  commitMessage: string,
  dryRun: boolean = false
): Promise<GitHubDeployResult> {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🔍 FILE COLLECTION & FILTERING');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📥 Input files received:');
  console.log(`   Component files: ${componentFiles.length}`);
  if (componentFiles.length > 0) {
    console.log(`   Sample component paths:`);
    componentFiles.slice(0, 3).forEach(f => {
      console.log(`      - ${f.path}`);
    });
  }
  console.log(`   Page files: ${pageFiles.length}`);
  if (pageFiles.length > 0) {
    console.log(`   Sample page paths:`);
    pageFiles.slice(0, 3).forEach(f => {
      console.log(`      - ${f.path}`);
    });
  }
  console.log('');

  // Collect required utility files (hooks, colorUtils, etc.)
  console.log('📦 Collecting utility files (hooks, colorUtils, types)...');
  const utilityFiles = collectRequiredUtilityFiles();
  console.log(`   ✅ Collected ${utilityFiles.length} utility files\n`);

  // Collect critical config files (next.config.ts, package.json, etc.)
  console.log('📦 Collecting critical config files...');
  const configFiles = collectCriticalConfigFiles();
  console.log(`   ✅ Collected ${configFiles.length} config files\n`);

  // Combine all files (components + pages + utilities + config)
  const allInputFiles = [...componentFiles, ...pageFiles, ...utilityFiles, ...configFiles];

  console.log(`📊 Total input files: ${allInputFiles.length}`);
  console.log(`   - Components: ${componentFiles.length}`);
  console.log(`   - Pages: ${pageFiles.length}`);
  console.log(`   - Utilities: ${utilityFiles.length}`);
  console.log(`   - Config files: ${configFiles.length}\n`);

  // Apply comprehensive production filter to exclude editor/admin/build-breaking routes
  console.log('🔍 Applying production filter...');
  const filterResult = filterFilesForProduction(allInputFiles);
  const allFiles = filterResult.included;

  // Log filtering results
  logFilterResults(filterResult.stats);

  // Show sample of excluded files for verification
  if (filterResult.excluded.length > 0) {
    console.log('\n📋 Sample of EXCLUDED files (editorial-only):');
    const sampleExcluded = filterResult.excluded.slice(0, 10);
    sampleExcluded.forEach(f => {
      console.log(`   ⊗ ${f.path}`);
    });
    if (filterResult.excluded.length > 10) {
      console.log(`   ... and ${filterResult.excluded.length - 10} more excluded files`);
    }
    console.log('');
  }

  // Detailed breakdown of what's being deployed
  console.log(`\n📦 Files to deploy: ${allFiles.length}`);
  const frontendCount = allFiles.filter(f => f.path.startsWith('frontend/')).length;
  const srcCount = allFiles.filter(f => f.path.startsWith('src/')).length;
  const otherCount = allFiles.length - frontendCount - srcCount;
  console.log(`   - frontend/: ${frontendCount} files`);
  console.log(`   - src/: ${srcCount} files`);
  console.log(`   - other: ${otherCount} files`);

  if (frontendCount === 0 && allFiles.length > 0) {
    console.log(`\n   ⚠️  WARNING: No files with 'frontend/' prefix!`);
    console.log(`   ⚠️  This might be why the frontend folder isn't updating!`);
    console.log(`   ⚠️  Sample paths:`);
    allFiles.slice(0, 5).forEach(f => {
      console.log(`      - ${f.path}`);
    });
  }
  console.log('');

  // Verify environment variable
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    return {
      success: false,
      message: 'GITHUB_TOKEN environment variable not set',
      error: 'Missing GITHUB_TOKEN - see setup instructions in GITHUB_API_EXAMPLE.md',
    };
  }

  const octokit = new Octokit({ auth: githubToken });

  if (dryRun) {
    console.log('\n🧪 DRY RUN MODE - GitHub API Deployment Simulation\n');
    console.log(`  Branch: ${PRODUCTION_BRANCH}`);
    console.log(`  Files: ${allFiles.length} (after filtering)`);
    console.log(`  Frontend files: ${allFiles.filter(f => f.path.startsWith('frontend/')).length}`);
    console.log(`  Excluded: ${filterResult.excluded.length} editor/admin/build-breaking routes`);
    console.log('\nNo API calls made in dry run mode.\n');

    return {
      success: true,
      message: 'Dry run successful - production-safe code only',
      details: {
        filesDeployed: allFiles.length,
        componentFiles: filterResult.stats.included,
        pageFiles: 0,
        version: 0,
      },
    };
  }

  try {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🚀 GITHUB API DEPLOYMENT - STEP BY STEP');
    console.log('═══════════════════════════════════════════════════════════\n');

    // STEP 0: Log what we're deploying
    console.log('📋 STEP 0: Files to deploy');
    console.log(`   Total files: ${allFiles.length}`);
    console.log(`   Components: ${componentFiles.length}`);
    console.log(`   Pages: ${pageFiles.length}`);
    console.log(`   Utilities: ${utilityFiles.length}`);

    // Show file path breakdown
    const pathBreakdown: Record<string, number> = {};
    allFiles.forEach(f => {
      const prefix = f.path.split('/')[0];
      pathBreakdown[prefix] = (pathBreakdown[prefix] || 0) + 1;
    });
    console.log(`   Path breakdown:`);
    Object.entries(pathBreakdown).forEach(([prefix, count]) => {
      console.log(`      ${prefix}/: ${count} files`);
    });

    // Show sample frontend files
    const frontendFiles = allFiles.filter(f => f.path.startsWith('frontend/'));
    console.log(`\n   Frontend files (${frontendFiles.length}):`);
    frontendFiles.slice(0, 10).forEach(f => {
      console.log(`      ✓ ${f.path}`);
    });
    if (frontendFiles.length > 10) {
      console.log(`      ... and ${frontendFiles.length - 10} more`);
    }
    console.log('');

    // 1. Get current production branch reference
    console.log('📌 STEP 1: Get current branch reference');
    console.log(`   Branch: ${PRODUCTION_BRANCH}`);
    console.log(`   Owner: ${GITHUB_OWNER}`);
    console.log(`   Repo: ${GITHUB_REPO}`);
    const { data: ref } = await octokit.git.getRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: `heads/${PRODUCTION_BRANCH}`,
    });
    const currentSha = ref.object.sha;
    console.log(`   ✅ Current SHA: ${currentSha.substring(0, 7)} (${currentSha})`);
    console.log(`   ✅ Ref URL: ${ref.url}\n`);

    // 2. Get current commit to get base tree
    console.log('📌 STEP 2: Get base tree from current commit');
    const { data: currentCommit } = await octokit.git.getCommit({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      commit_sha: currentSha,
    });
    const baseTreeSha = currentCommit.tree.sha;
    console.log(`   ✅ Base tree SHA: ${baseTreeSha.substring(0, 7)} (${baseTreeSha})`);
    console.log(`   ✅ Commit message: ${currentCommit.message.split('\n')[0]}\n`);

    // 3. Create blobs for each file
    console.log(`📌 STEP 3: Create blobs for ${allFiles.length} files`);
    const tree: Array<{ path: string; mode: '100644'; type: 'blob'; sha: string }> = [];

    for (let index = 0; index < allFiles.length; index++) {
      const file = allFiles[index];

      // Log every frontend file (critical for debugging)
      if (file.path.startsWith('frontend/')) {
        console.log(`   📄 [${index + 1}/${allFiles.length}] ${file.path} (${(file.content.length / 1024).toFixed(1)}KB)`);
      }

      const { data: blob } = await octokit.git.createBlob({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        content: Buffer.from(file.content).toString('base64'),
        encoding: 'base64',
      });

      const relativePath = file.path;
      tree.push({
        path: relativePath,
        mode: '100644' as const,
        type: 'blob' as const,
        sha: blob.sha,
      });
    }

    console.log(`   ✅ Created ${tree.length} blobs`);
    console.log(`   ✅ Frontend blobs: ${tree.filter(t => t.path.startsWith('frontend/')).length}`);
    console.log('');

    // 4. Create new tree
    console.log('📌 STEP 4: Create new tree with base_tree + new files');
    console.log(`   Base tree: ${baseTreeSha.substring(0, 7)}`);
    console.log(`   New files: ${tree.length}`);
    console.log(`   Tree entries (first 10):`);
    tree.slice(0, 10).forEach(t => {
      console.log(`      ${t.path} → ${t.sha.substring(0, 7)}`);
    });
    if (tree.length > 10) {
      console.log(`      ... and ${tree.length - 10} more`);
    }

    const { data: newTree } = await octokit.git.createTree({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      base_tree: baseTreeSha,
      tree,
    });
    console.log(`   ✅ New tree SHA: ${newTree.sha.substring(0, 7)} (${newTree.sha})`);
    console.log(`   ✅ Tree URL: ${newTree.url}\n`);

    // 5. Get version number
    console.log('📌 STEP 5: Get next version number');
    const version = await getNextVersion(octokit);
    console.log(`   ✅ Version: v${version}\n`);

    // 6. Create new commit
    console.log('📌 STEP 6: Create new commit');
    const fullCommitMessage = `${commitMessage}\n\nVersion: production-v${version}\nDeployed via GitHub API`;
    console.log(`   Message: ${fullCommitMessage.split('\n')[0]}`);
    console.log(`   Tree: ${newTree.sha.substring(0, 7)}`);
    console.log(`   Parent: ${currentSha.substring(0, 7)}`);

    const { data: newCommit } = await octokit.git.createCommit({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      message: fullCommitMessage,
      tree: newTree.sha,
      parents: [currentSha],
    });
    console.log(`   ✅ Commit SHA: ${newCommit.sha.substring(0, 7)} (${newCommit.sha})`);
    const commitUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/commit/${newCommit.sha}`;
    console.log(`   ✅ URL: ${commitUrl}\n`);

    // 7. Update production branch reference
    console.log('📌 STEP 7: Update branch reference');
    console.log(`   Branch: ${PRODUCTION_BRANCH}`);
    console.log(`   Old SHA: ${currentSha.substring(0, 7)}`);
    console.log(`   New SHA: ${newCommit.sha.substring(0, 7)}`);

    await octokit.git.updateRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: `heads/${PRODUCTION_BRANCH}`,
      sha: newCommit.sha,
      force: false,
    });
    console.log(`   ✅ Branch ${PRODUCTION_BRANCH} updated successfully!`);
    console.log(`   ✅ View at: https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/tree/${PRODUCTION_BRANCH}\n`);

    // 8. Create tag
    const tagName = `production-v${version}`;

    // Check if tag already exists
    try {
      await octokit.git.getRef({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        ref: `tags/${tagName}`,
      });
    } catch (error: any) {
      if (error.status === 404) {
        // Tag doesn't exist, create it
        const { data: newTag } = await octokit.git.createTag({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          tag: tagName,
          message: `Production release v${version}`,
          object: newCommit.sha,
          type: 'commit',
        });

        // Create reference for the tag
        await octokit.git.createRef({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          ref: `refs/tags/${tagName}`,
          sha: newTag.sha,
        });
      } else {
        throw error;
      }
    }

    console.log('\n✅ Deployment successful via GitHub API!\n');

    return {
      success: true,
      message: 'Deployed successfully via GitHub API',
      details: {
        commitSha: newCommit.sha,
        commitUrl,
        tagName,
        tagUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tag/${tagName}`,
        version,
        filesDeployed: allFiles.length,
        componentFiles: componentFiles.length,
        pageFiles: pageFiles.length,
      },
    };
  } catch (error: any) {
    console.error('❌ GitHub API deployment failed:', error);

    // Provide helpful error messages
    let errorMessage = error.message || 'Unknown error';
    if (error.status === 401) {
      errorMessage = 'GitHub authentication failed - check GITHUB_TOKEN';
    } else if (error.status === 403) {
      errorMessage = 'GitHub API rate limit exceeded or insufficient permissions';
    } else if (error.status === 404) {
      errorMessage = `Repository or branch not found: ${GITHUB_OWNER}/${GITHUB_REPO}/${PRODUCTION_BRANCH}`;
    }

    return {
      success: false,
      message: 'Deployment failed',
      error: errorMessage,
    };
  }
}
