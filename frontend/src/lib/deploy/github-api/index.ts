/**
 * GitHub API Operations Module
 *
 * Modular GitHub API deployment system for Next.js applications
 *
 * This module uses the GitHub API to deploy files to the production branch.
 * Benefits over git CLI:
 * - No file system changes (all happens in memory)
 * - No server restarts (Next.js file watcher not triggered)
 * - Works in browser/production context (no git commands needed)
 * - Proper timeouts (network requests have built-in timeout handling)
 */

// Types
export type { GitHubDeployResult } from './types';

// Configuration
export { GITHUB_OWNER, GITHUB_REPO, PRODUCTION_BRANCH } from './config';

// File Collectors
export { collectRequiredUtilityFiles, collectCriticalConfigFiles } from './file-collectors';

// Deployment
export { deployToProductionViaAPI } from './deploy';

// Snapshots
export { saveProductionSnapshot, regenerateDataFilesFromSnapshot } from './snapshots';

// Utils
export { getNextVersion, verifyGitHubAccess } from './utils';
