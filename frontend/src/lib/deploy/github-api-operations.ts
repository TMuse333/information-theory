/**
 * GitHub API Deployment Operations
 *
 * DEPRECATED: This file is kept for backwards compatibility only.
 * New code should import from '@/lib/deploy/github-api' instead.
 *
 * The module has been split into multiple files for better organization:
 * - types.ts: TypeScript interfaces
 * - config.ts: Configuration constants
 * - file-collectors.ts: File collection utilities
 * - deploy.ts: Main deployment logic
 * - snapshots.ts: Snapshot operations
 * - utils.ts: Utility functions
 * - index.ts: Module exports
 */

// Re-export everything from the new modular structure
export * from './github-api';
