#!/bin/bash

# Test script for save/load functionality
# This script will:
# 1. Get the current websiteData from GitHub
# 2. Modify the hero title
# 3. Save it back to GitHub
# 4. Load it again to verify

BASE_URL="http://localhost:3002"
NEW_TITLE="information theory is cool!"

echo "=========================================="
echo "Testing Save/Load Flow"
echo "=========================================="

# Step 1: Get current data
echo ""
echo "Step 1: Fetching current data from GitHub..."
CURRENT_DATA=$(curl -s "${BASE_URL}/api/versions/get-latest?branch=development")

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to fetch current data"
    exit 1
fi

# Check if we got valid data
echo "$CURRENT_DATA" | head -c 200
echo "..."
echo ""

# Step 2: Extract and modify the data
echo ""
echo "Step 2: Modifying hero title to: '$NEW_TITLE'"

# Use node to modify the JSON (safer than sed for JSON)
MODIFIED_DATA=$(node -e "
const data = $CURRENT_DATA;
const websiteData = data.websiteData;

// Find and modify the hero component title
if (websiteData && websiteData.pages) {
    const pages = Array.isArray(websiteData.pages) ? websiteData.pages : Object.values(websiteData.pages);

    for (const page of pages) {
        if (page.components) {
            for (const comp of page.components) {
                if (comp.type && comp.type.toLowerCase().includes('hero') && comp.props) {
                    console.error('Found hero component:', comp.id, 'Current title:', comp.props.title);
                    comp.props.title = '$NEW_TITLE';
                    console.error('Changed to:', comp.props.title);
                }
            }
        }
    }

    // Convert back to array format for saving
    websiteData.pages = pages;
}

console.log(JSON.stringify(websiteData, null, 2));
" 2>&1)

# Check for errors
if echo "$MODIFIED_DATA" | grep -q "^Found hero"; then
    echo "$MODIFIED_DATA" | grep "^Found hero\|^Changed to"
    MODIFIED_DATA=$(echo "$MODIFIED_DATA" | grep -v "^Found hero\|^Changed to")
fi

# Step 3: Save to GitHub
echo ""
echo "Step 3: Saving modified data to GitHub..."

# Determine the file path (monorepo uses frontend/ prefix)
FILE_PATH="frontend/src/data/websiteData.json"

SAVE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/versions/create-github" \
    -H "Content-Type: application/json" \
    -d "{
        \"commitMessage\": \"Test: Changed hero title to '$NEW_TITLE'\",
        \"branch\": \"development\",
        \"files\": [{
            \"path\": \"$FILE_PATH\",
            \"content\": $(echo "$MODIFIED_DATA" | jq -Rs .),
            \"encoding\": \"utf-8\"
        }]
    }")

echo "Save response:"
echo "$SAVE_RESPONSE" | jq .

# Extract version number
VERSION_NUMBER=$(echo "$SAVE_RESPONSE" | jq -r '.versionNumber')
echo ""
echo "Saved as version: $VERSION_NUMBER"

# Step 4: Wait a moment for GitHub to process
echo ""
echo "Step 4: Waiting 2 seconds for GitHub to process..."
sleep 2

# Step 5: Load the version back
echo ""
echo "Step 5: Loading version $VERSION_NUMBER back from GitHub..."

LOADED_DATA=$(curl -s -X POST "${BASE_URL}/api/versions/switch-github" \
    -H "Content-Type: application/json" \
    -d "{\"versionNumber\": $VERSION_NUMBER}")

# Extract the title from loaded data
LOADED_TITLE=$(echo "$LOADED_DATA" | node -e "
const chunks = [];
process.stdin.on('data', chunk => chunks.push(chunk));
process.stdin.on('end', () => {
    const data = JSON.parse(chunks.join(''));
    const pages = data.websiteData?.pages || [];
    const pagesArr = Array.isArray(pages) ? pages : Object.values(pages);

    for (const page of pagesArr) {
        if (page.components) {
            for (const comp of page.components) {
                if (comp.type && comp.type.toLowerCase().includes('hero') && comp.props?.title) {
                    console.log(comp.props.title);
                    process.exit(0);
                }
            }
        }
    }
    console.log('NOT FOUND');
});
")

echo ""
echo "=========================================="
echo "RESULTS"
echo "=========================================="
echo "Expected title: $NEW_TITLE"
echo "Loaded title:   $LOADED_TITLE"
echo ""

if [ "$LOADED_TITLE" = "$NEW_TITLE" ]; then
    echo "✅ SUCCESS! Title was saved and loaded correctly!"
else
    echo "❌ FAILURE! Title mismatch!"
    echo ""
    echo "Debug: Full loaded hero component:"
    echo "$LOADED_DATA" | node -e "
const chunks = [];
process.stdin.on('data', chunk => chunks.push(chunk));
process.stdin.on('end', () => {
    const data = JSON.parse(chunks.join(''));
    const pages = data.websiteData?.pages || [];
    const pagesArr = Array.isArray(pages) ? pages : Object.values(pages);

    for (const page of pagesArr) {
        if (page.components) {
            for (const comp of page.components) {
                if (comp.type && comp.type.toLowerCase().includes('hero')) {
                    console.log(JSON.stringify(comp, null, 2));
                    process.exit(0);
                }
            }
        }
    }
});
"
fi
