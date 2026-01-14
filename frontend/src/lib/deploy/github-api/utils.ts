/**
 * GitHub API Utilities
 *
 * Helper functions for GitHub operations
 */

import { Octokit } from '@octokit/rest';
import { GITHUB_OWNER, GITHUB_REPO, PRODUCTION_BRANCH } from './config';
import type { GitHubDeployResult } from './types';

/**
 * Get next version number by checking existing production tags
 */
export async function getNextVersion(octokit: Octokit): Promise<number> {
  try {
    const { data: tags } = await octokit.repos.listTags({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      per_page: 100,
    });

    // Filter production tags and extract version numbers
    const versionNumbers = tags
      .filter((tag) => tag.name.startsWith('production-v'))
      .map((tag) => {
        const match = tag.name.match(/production-v(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((v) => v > 0);

    // Return next version number
    return versionNumbers.length > 0 ? Math.max(...versionNumbers) + 1 : 1;
  } catch (error: any) {
    return 1;
  }
}

/**
 * Verify GitHub token and repository access
 * Useful for testing setup before actual deployment
 */
export async function verifyGitHubAccess(): Promise<GitHubDeployResult> {
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
    // Check repository access
    const { data: repo } = await octokit.repos.get({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
    });

    // Check production branch exists
    const { data: ref } = await octokit.git.getRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: `heads/${PRODUCTION_BRANCH}`,
    });

    return {
      success: true,
      message: 'GitHub access verified',
      details: {
        commitSha: ref.object.sha,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'GitHub access verification failed',
      error: error.message,
    };
  }
}
