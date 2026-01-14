/**
 * GitHub API File Collectors
 *
 * Functions for collecting required files for production deployment
 */

import type { ComponentFileContent } from '../copyComponents';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Collect required utility files that components depend on
 * These files must be included in production deployment
 *
 * NOTE: This function uses Node.js fs/path APIs which are safe here because:
 * - This file is only imported in Next.js API routes (server-side only)
 * - API routes run in Node.js environment, not in the browser
 * - No "use client" directive means this is server-side code
 */
export function collectRequiredUtilityFiles(): ComponentFileContent[] {
  // Runtime check: ensure we're in a Node.js environment
  if (typeof window !== 'undefined') {
    console.error('❌ [ERROR] collectRequiredUtilityFiles() called in browser context!');
    console.error('   This function requires Node.js fs/path APIs and should only run server-side.');
    return [];
  }

  const utilityFiles: ComponentFileContent[] = [];
  const projectRoot = process.cwd();

  // Required utility directories that production components depend on
  // Only include essential files for production components
  const requiredDirs = [
    'frontend/src/lib/hooks',      // If running from project root
    'frontend/src/lib/colorUtils',
    'frontend/src/types',           // CRITICAL: Components import from @/types
    'src/lib/hooks',                // If running from frontend/ directory
    'src/lib/colorUtils',
    'src/types',
  ];

  // Files to exclude from deployment
  const excludedFiles = [
    'hooks.ts',                     // Only need isMobile.ts
    'llmOutputs.ts',                // Not needed for production
    'templateTypes.ts',             // Not needed for production
    'usage.ts',                     // Not needed for production
    'user.ts',                      // Not needed for production
    'website.ts',                   // Not needed for production
    'helperBot.ts',                 // Not needed for production
    'mainRegistry.ts',              // Registry file not needed for production
    'websiteDataTypes.ts',          // Editorial-only, not needed for production
  ];

  // Track which directories we've already processed (avoid duplicates)
  const processedDirs = new Set<string>();

  for (const dir of requiredDirs) {
    const fullDirPath = path.join(projectRoot, dir);
    const normalizedPath = path.normalize(fullDirPath);

    // Skip if we've already processed this directory
    if (processedDirs.has(normalizedPath)) {
      continue;
    }

    if (!fs.existsSync(fullDirPath)) {
      // Only warn if it's a frontend/ path (expected), not src/ (might not exist)
      if (dir.startsWith('frontend/')) {
        // Try the alternative path silently
        continue;
      }
      continue;
    }

    processedDirs.add(normalizedPath);

    // Read all files in the directory recursively
    function readDirRecursive(dirPath: string) {
      try {
        const files = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const file of files) {
          const fullPath = path.join(dirPath, file.name);

          if (file.isDirectory()) {
            // Recursively read subdirectories (e.g., types/registry/)
            readDirRecursive(fullPath);
          } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.js'))) {
            // Skip excluded files
            if (excludedFiles.includes(file.name)) {
              continue;
            }

            // For hooks directory, only include isMobile.ts
            if (dirPath.includes('/lib/hooks/') && file.name !== 'isMobile.ts') {
              continue;
            }

            // Exclude registry folder files (not needed for production)
            if (dirPath.includes('/types/registry/') || file.name === 'mainRegistry.ts') {
              continue;
            }

            let relativePath = path.relative(projectRoot, fullPath);

            // ENSURE path starts with 'frontend/' prefix
            // Repository structure: frontend/src/..., scripts/, etc.
            // Files must be at frontend/src/... to be in the correct location
            // Vercel root directory is set to 'frontend' in project settings
            if (!relativePath.startsWith('frontend/')) {
              relativePath = `frontend/${relativePath}`;
            }

            // Skip if already added (avoid duplicates)
            if (utilityFiles.some(f => f.path === relativePath)) {
              continue;
            }

            try {
              const content = fs.readFileSync(fullPath, 'utf-8');
              utilityFiles.push({
                path: relativePath,
                content,
              });
            } catch (error: any) {
              console.warn(`  ⚠️  Failed to read ${relativePath}: ${error.message}`);
            }
          }
        }
      } catch (error: any) {
        console.warn(`  ⚠️  Failed to read directory ${dirPath}: ${error.message}`);
      }
    }

    readDirRecursive(fullDirPath);
  }

  return utilityFiles;
}

/**
 * Collect critical configuration files for production
 * These files must be included with their current content
 */
export function collectCriticalConfigFiles(): ComponentFileContent[] {
  const configFiles: ComponentFileContent[] = [];
  const projectRoot = process.cwd();

  // Critical config files - process each type separately to avoid duplicates
  const processedTypes = new Set<string>();

  // List of config files to check (in priority order)
  const criticalFiles = [
    { path: 'frontend/next.config.ts', type: 'nextconfig' },
    { path: 'next.config.ts', type: 'nextconfig' },
    { path: 'frontend/package.json', type: 'package' },
    { path: 'package.json', type: 'package' },
    { path: 'frontend/tsconfig.json', type: 'tsconfig' },
    { path: 'tsconfig.json', type: 'tsconfig' },
    { path: 'frontend/.nvmrc', type: 'nvmrc' },
    { path: '.nvmrc', type: 'nvmrc' },
  ];

  for (const { path: filePath, type } of criticalFiles) {
    // Skip if we already processed this type
    if (processedTypes.has(type)) continue;

    const fullPath = path.join(projectRoot, filePath);

    if (fs.existsSync(fullPath)) {
      try {
        let content = fs.readFileSync(fullPath, 'utf-8');

        // For next.config.ts, create production-safe version
        if (type === 'nextconfig') {
          // Remove invalid 'eslint' property (not supported in Next.js 16)
          // Create clean production config
          const productionConfig = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
`;
          content = productionConfig;
          console.log('  ✓ Generated production-safe next.config.ts (removed invalid eslint property)');
        }

        // Ensure path has frontend/ prefix
        const relativePath = path.relative(projectRoot, fullPath);
        const normalizedPath = relativePath.startsWith('frontend/')
          ? relativePath
          : `frontend/${relativePath}`;

        configFiles.push({
          path: normalizedPath,
          content,
        });

        // Mark this type as processed
        processedTypes.add(type);
        console.log(`  ✓ Added ${type}: ${normalizedPath}`);
      } catch (error: any) {
        console.warn(`  ⚠️  Failed to read ${filePath}: ${error.message}`);
      }
    }
  }

  // Create production-safe types/index.ts
  const typesIndexPath = path.join(projectRoot, 'frontend/src/types/index.ts');
  if (fs.existsSync(typesIndexPath)) {
    try {
      // Create production-safe version that only exports from included files
      const productionTypesIndex = `// Production-safe types index
// Only exports from files that exist in production deployment

export * from './colors';
export * from './componentTypes';
export * from './forms';
export * from './navbar';

// Note: Excluded from production:
// - websiteDataTypes.ts (editorial-only)
// - templateTypes.ts (editorial-only)
// - llmOutputs.ts (editorial-only)
// - user.ts (editorial-only)
// - website.ts (editorial-only)
// - helperBot.ts (editorial-only)
// - usage.ts (editorial-only)
`;

      configFiles.push({
        path: 'frontend/src/types/index.ts',
        content: productionTypesIndex,
      });
    } catch (error: any) {
      console.warn(`  ⚠️  Failed to create production types/index.ts: ${error.message}`);
    }
  }

  return configFiles;
}
