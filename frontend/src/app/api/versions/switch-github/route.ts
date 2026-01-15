import { NextRequest, NextResponse } from "next/server";
import { GITHUB_CONFIG } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const { REPO_OWNER, REPO_NAME, CURRENT_BRANCH, GITHUB_TOKEN } = GITHUB_CONFIG;

    console.log("🟢 [switch-github API] Request received - CODE VERSION: 2026-01-15-v2-raw-url");
    const body = await req.json();
    console.log("🟢 [switch-github API] Request body:", body);
    const { commitSha, versionNumber } = body;

    if (!commitSha && !versionNumber) {
      return NextResponse.json(
        { error: "Either commitSha or versionNumber is required" },
        { status: 400 }
      );
    }

    let targetCommitSha = commitSha;

    // If versionNumber is provided, fetch the commit list to get the SHA
    if (!targetCommitSha && versionNumber) {
      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
        "Cache-Control": "no-cache",
        "If-None-Match": "", // Bypass ETag caching
      };

      if (GITHUB_TOKEN) {
        headers.Authorization = `token ${GITHUB_TOKEN}`;
      }

      // Add timestamp to bypass caching
      const timestamp = Date.now();
      const commitsResponse = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?sha=${CURRENT_BRANCH}&per_page=100&_t=${timestamp}`,
        { headers, cache: 'no-store' }
      );

      if (!commitsResponse.ok) {
        const errorData = await commitsResponse.json().catch(() => ({}));
        return NextResponse.json(
          { error: `Failed to fetch commits: ${errorData.message || commitsResponse.statusText}` },
          { status: commitsResponse.status }
        );
      }

      const commits = await commitsResponse.json();
      // GitHub returns commits newest-first, but versions are oldest-first
      // So version 1 = oldest commit = commits[length-1]
      // And version N = commits[length-N]
      const targetCommit = commits[commits.length - versionNumber];

      console.log(`🔍 [switch-github] Looking for version ${versionNumber}: commit index ${commits.length - versionNumber} of ${commits.length} total`);

      if (!targetCommit) {
        return NextResponse.json(
          { error: `Version ${versionNumber} not found (total versions: ${commits.length})` },
          { status: 404 }
        );
      }

      targetCommitSha = targetCommit.sha;
    }

    // Get the commit details
    const commitHeaders: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "Cache-Control": "no-cache",
      "If-None-Match": "",
    };

    if (GITHUB_TOKEN) {
      commitHeaders.Authorization = `token ${GITHUB_TOKEN}`;
    }

    const commitResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/commits/${targetCommitSha}?_t=${Date.now()}`,
      { headers: commitHeaders, cache: 'no-store' }
    );

    if (!commitResponse.ok) {
      const errorData = await commitResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: `Failed to get commit: ${errorData.message || commitResponse.statusText}` },
        { status: commitResponse.status }
      );
    }

    const commitData = await commitResponse.json();

    // Get the tree SHA from the commit
    const treeSha = commitData.tree.sha;

    // Get the tree to find websiteData.json
    const treeHeaders: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "Cache-Control": "no-cache",
      "If-None-Match": "",
    };

    if (GITHUB_TOKEN) {
      treeHeaders.Authorization = `token ${GITHUB_TOKEN}`;
    }

    const treeResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${treeSha}?recursive=1&_t=${Date.now()}`,
      { headers: treeHeaders, cache: 'no-store' }
    );

    if (!treeResponse.ok) {
      const errorData = await treeResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: `Failed to get tree: ${errorData.message || treeResponse.statusText}` },
        { status: treeResponse.status }
      );
    }

    const treeData = await treeResponse.json();

    // Find websiteData.json in the tree (prioritize frontend path for monorepo)
    const websiteDataFile = treeData.tree.find(
      (file: any) => file.path === "frontend/src/data/websiteData.json" || file.path === "src/data/websiteData.json"
    );

    if (!websiteDataFile) {
      return NextResponse.json(
        { error: "websiteData.json not found in this commit" },
        { status: 404 }
      );
    }

    // DEBUG: Log what blob SHA we're about to fetch
    console.log("🔍 [switch-github API] Tree SHA:", treeSha);
    console.log("🔍 [switch-github API] websiteData.json blob SHA:", websiteDataFile.sha);
    console.log("🔍 [switch-github API] Commit SHA being processed:", targetCommitSha);

    // Use raw.githubusercontent.com to bypass GitHub API caching
    // This fetches the file directly from the commit
    const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${targetCommitSha}/${websiteDataFile.path}`;
    console.log("🔍 [switch-github API] Fetching from raw URL:", rawUrl);

    const fileResponse = await fetch(rawUrl, {
      headers: {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
      cache: 'no-store',
    });

    if (!fileResponse.ok) {
      return NextResponse.json(
        { error: `Failed to get file from raw URL: ${fileResponse.statusText}` },
        { status: fileResponse.status }
      );
    }

    const content = await fileResponse.text();

    // Decode the content
    let websiteData;
    try {

      // Log first 500 chars of raw JSON to see what GitHub actually returned
      console.log("📄 [switch-github API] RAW JSON from GitHub (first 500 chars):", content.substring(0, 500));

      websiteData = JSON.parse(content) as any;

      // Extract title for debugging
      const firstPageTitle = Array.isArray(websiteData.pages)
        ? websiteData.pages[0]?.components?.[0]?.props?.title
        : (Object.values(websiteData.pages || {}) as any)[0]?.components?.[0]?.props?.title;

      console.log("📥 [switch-github API] Pages structure for version", versionNumber, ":", {
        isArray: Array.isArray(websiteData.pages),
        count: Array.isArray(websiteData.pages) ? websiteData.pages.length : Object.keys(websiteData.pages || {}).length,
        hasComponents: Array.isArray(websiteData.pages)
          ? websiteData.pages[0]?.components?.length || 0
          : (Object.values(websiteData.pages || {}) as any)[0]?.components?.length || 0,
        firstPageInRaw: websiteData.pages && (Array.isArray(websiteData.pages) ? websiteData.pages[0]?.slug : Object.keys(websiteData.pages)[0]),
        firstComponentTitle: firstPageTitle,
      });

    } catch (parseError) {
      return NextResponse.json(
        { error: "Failed to parse websiteData.json" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      websiteData,
      commitSha: targetCommitSha,
      commitMessage: commitData.message,
      commitDate: commitData.author.date,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error("Error switching to GitHub version:", error);
    return NextResponse.json(
      { error: error.message || "Failed to switch version" },
      { status: 500 }
    );
  }
}

