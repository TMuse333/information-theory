/**
 * GitHub API Types and Interfaces
 */

export interface GitHubDeployResult {
  success: boolean;
  message: string;
  details?: {
    commitSha?: string;
    commitUrl?: string;
    tagName?: string;
    tagUrl?: string;
    version?: number;
    filesDeployed?: number;
    componentFiles?: number;
    pageFiles?: number;
  };
  error?: string;
}
