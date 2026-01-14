#!/bin/bash

# Test script for version save/load
# This automates testing the version save/load cycle

set -e  # Exit on error

BASE_URL="http://localhost:3001"
BRANCH="development"

echo "🧪 Starting version save/load test..."
echo ""

# Step 1: Get latest version to use as base
echo "📥 Step 1: Getting latest version..."
LATEST_RESPONSE=$(curl -s "${BASE_URL}/api/versions/get-latest?branch=${BRANCH}")

# Debug: Show raw response if it fails to parse
if ! echo "$LATEST_RESPONSE" | jq empty 2>/dev/null; then
  echo "❌ ERROR: API returned invalid JSON:"
  echo "$LATEST_RESPONSE"
  exit 1
fi

LOAD_RESPONSE="$LATEST_RESPONSE"

# Debug: Show raw response if it fails to parse
if ! echo "$LOAD_RESPONSE" | jq empty 2>/dev/null; then
  echo "❌ ERROR: API returned invalid JSON:"
  echo "$LOAD_RESPONSE"
  exit 1
fi

# Check if pages is array in latest version
PAGES_TYPE=$(echo "$LOAD_RESPONSE" | jq -r '.websiteData.pages | type')
echo "   Latest version pages type: $PAGES_TYPE"

if [ "$PAGES_TYPE" != "array" ]; then
  echo "❌ ERROR: Latest version should have pages as array but got: $PAGES_TYPE"
  echo "   This means the transformation fix isn't working yet."
  echo "   Try saving a new version from the UI first, then run this test again."
  exit 1
fi

PAGE_COUNT=$(echo "$LOAD_RESPONSE" | jq -r '.websiteData.pages | length')
echo "   Latest version has $PAGE_COUNT pages ✅"
echo ""

# Step 2: Prepare data for save (modify the title slightly)
echo "📝 Step 2: Preparing modified data..."

# Get original title
ORIGINAL_TITLE=$(echo "$LOAD_RESPONSE" | jq -r '.websiteData.pages[0].components[0].props.title')
echo "   Original title: $ORIGINAL_TITLE"

# Modify the title with timestamp
TIMESTAMP=$(date +%s)
MODIFIED_DATA=$(echo "$LOAD_RESPONSE" | jq -r --arg ts "$TIMESTAMP" \
  '.websiteData | .pages[0].components[0].props.title = "Test Save " + $ts')

NEW_TITLE=$(echo "$MODIFIED_DATA" | jq -r '.pages[0].components[0].props.title')
echo "   New title: $NEW_TITLE"
echo ""

# Step 3: Save as new version
echo "💾 Step 3: Saving new version..."

# Debug: Show what we're about to send
echo "   Debug: First 200 chars of content being sent:"
echo "$MODIFIED_DATA" | jq -c . | head -c 200
echo "..."
echo ""

# Determine correct file path (check if monorepo)
if [ -f "../src/data/websiteData.json" ]; then
  FILE_PATH="frontend/src/data/websiteData.json"
  echo "   Detected monorepo structure, using path: $FILE_PATH"
else
  FILE_PATH="src/data/websiteData.json"
  echo "   Using path: $FILE_PATH"
fi

SAVE_RESPONSE=$(curl -s "${BASE_URL}/api/versions/create-github" \
  -H "Content-Type: application/json" \
  -d "{
    \"commitMessage\": \"Automated test save\",
    \"branch\": \"$BRANCH\",
    \"files\": [{
      \"path\": \"$FILE_PATH\",
      \"content\": $(echo "$MODIFIED_DATA" | jq -c . | jq -R .),
      \"encoding\": \"utf-8\"
    }]
  }")

NEW_VERSION=$(echo "$SAVE_RESPONSE" | jq -r '.versionNumber')
COMMIT_SHA=$(echo "$SAVE_RESPONSE" | jq -r '.commitSha')

echo "   Created version: $NEW_VERSION"
echo "   Commit SHA: $COMMIT_SHA"
echo ""

# Step 4: Load the newly created version
echo "📥 Step 4: Loading newly created version $NEW_VERSION..."
sleep 2  # Give GitHub a moment to process

NEW_VERSION_RESPONSE=$(curl -s "${BASE_URL}/api/versions/switch-github" \
  -H "Content-Type: application/json" \
  -d "{\"versionNumber\": $NEW_VERSION}")

# Step 5: Verify the data
echo "🔍 Step 5: Verifying loaded data..."

NEW_PAGES_TYPE=$(echo "$NEW_VERSION_RESPONSE" | jq -r '.websiteData.pages | type')
echo "   New version pages type: $NEW_PAGES_TYPE"

if [ "$NEW_PAGES_TYPE" != "array" ]; then
  echo "❌ FAIL: New version has pages as $NEW_PAGES_TYPE (should be array)"
  echo ""
  echo "📄 First 500 chars of response:"
  echo "$NEW_VERSION_RESPONSE" | jq -r '.websiteData' | head -c 500
  echo ""
  exit 1
fi

NEW_PAGE_COUNT=$(echo "$NEW_VERSION_RESPONSE" | jq -r '.websiteData.pages | length')
echo "   New version has $NEW_PAGE_COUNT pages"

if [ "$NEW_PAGE_COUNT" != "$PAGE_COUNT" ]; then
  echo "❌ FAIL: Page count changed from $PAGE_COUNT to $NEW_PAGE_COUNT"
  exit 1
fi

COMPONENT_COUNT=$(echo "$NEW_VERSION_RESPONSE" | jq -r '.websiteData.pages[0].components | length')
echo "   First page has $COMPONENT_COUNT components"

if [ "$COMPONENT_COUNT" -eq 0 ]; then
  echo "❌ FAIL: Components are missing!"
  exit 1
fi

# Check if the title was preserved
LOADED_TITLE=$(echo "$NEW_VERSION_RESPONSE" | jq -r '.websiteData.pages[0].components[0].props.title')
echo "   Loaded title: $LOADED_TITLE"

if [ "$LOADED_TITLE" != "$NEW_TITLE" ]; then
  echo "❌ FAIL: Title not preserved!"
  echo "   Expected: $NEW_TITLE"
  echo "   Got: $LOADED_TITLE"
  exit 1
fi

echo ""
echo "✅ SUCCESS! Version save/load working correctly!"
echo "   - Pages saved as array ✅"
echo "   - Pages loaded as array ✅"
echo "   - Page count preserved: $PAGE_COUNT ✅"
echo "   - Components preserved: $COMPONENT_COUNT ✅"
echo "   - Content preserved (title matches) ✅"
echo ""
echo "🎉 Test passed! Version $NEW_VERSION is working correctly."
