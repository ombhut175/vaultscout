#!/bin/bash

###############################################################################
# Backend Build Test Script
#
# This script tests the production build process for the backend
#
# Usage:
#   ./scripts/test-build.sh
#
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}VaultScout Backend Build Test${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Clean previous build
echo -e "${YELLOW}[1/6]${NC} Cleaning previous build..."
if [ -d "dist" ]; then
  rm -rf dist
  echo -e "${GREEN}✓${NC} Cleaned dist directory"
else
  echo -e "${GREEN}✓${NC} No previous build found"
fi
echo ""

# Step 2: Check Node version
echo -e "${YELLOW}[2/6]${NC} Checking Node.js version..."
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓${NC} Node.js version: $NODE_VERSION"
echo ""

# Step 3: Install dependencies
echo -e "${YELLOW}[3/6]${NC} Installing production dependencies..."
if npm ci --only=production; then
  echo -e "${GREEN}✓${NC} Dependencies installed successfully"
else
  echo -e "${RED}✗${NC} Failed to install dependencies"
  exit 1
fi
echo ""

# Step 4: Run TypeScript type check
echo -e "${YELLOW}[4/6]${NC} Running TypeScript type check..."
if npm run type-check; then
  echo -e "${GREEN}✓${NC} Type check passed"
else
  echo -e "${RED}✗${NC} Type check failed"
  exit 1
fi
echo ""

# Step 5: Build the application
echo -e "${YELLOW}[5/6]${NC} Building application..."
if npm run build; then
  echo -e "${GREEN}✓${NC} Build completed successfully"
else
  echo -e "${RED}✗${NC} Build failed"
  exit 1
fi
echo ""

# Step 6: Verify build output
echo -e "${YELLOW}[6/6]${NC} Verifying build output..."

if [ ! -d "dist" ]; then
  echo -e "${RED}✗${NC} dist directory not found"
  exit 1
fi

if [ ! -f "dist/src/main.js" ]; then
  echo -e "${RED}✗${NC} main.js not found in dist/src/"
  exit 1
fi

DIST_SIZE=$(du -sh dist | cut -f1)
FILE_COUNT=$(find dist -type f | wc -l)

echo -e "${GREEN}✓${NC} Build output verified"
echo "  - Size: $DIST_SIZE"
echo "  - Files: $FILE_COUNT"
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Build test completed successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Test the build: npm run start:prod"
echo "  2. Verify API endpoints work"
echo "  3. Check logs for errors"
echo ""

exit 0
