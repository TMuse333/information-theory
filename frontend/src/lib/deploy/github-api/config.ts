/**
 * GitHub API Configuration
 *
 * Uses dynamic configuration from environment variables (set by parent repo via Vercel)
 */

import { GITHUB_CONFIG } from '@/lib/config';

// Non-null assertions (!) are safe here because:
// - These values are validated at runtime in verifyGitHubAccess()
// - Deployment will fail gracefully if they're missing
// - TypeScript needs to know they're strings, not string | undefined
export const GITHUB_OWNER = GITHUB_CONFIG.REPO_OWNER!;
export const GITHUB_REPO = GITHUB_CONFIG.REPO_NAME!;
export const PRODUCTION_BRANCH = GITHUB_CONFIG.PRODUCTION_BRANCH!;
