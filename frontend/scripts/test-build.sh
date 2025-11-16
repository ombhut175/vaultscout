#!/bin/bash

###############################################################################
# Frontend Build Test Script
#
# This script tests the production build process for the frontend
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
echo -e "${BLUE}VaultScout Frontend Build Test${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Clean previous build
echo -e "${YELLOW}[1/6]${NC} Cleaning previous build..."
if [ -d ".next" ]; then
  rm -rf .next
  echo -e "${GREEN}✓${NC} Cleaned .next directory"
fi
if [ -d "out" ]; then
  rm -rf out
  echo -e "${GREEN}✓${NC} Cleaned out directory"
fi
echo -e "${GREEN}✓${NC} Build directories cleaned"
echo ""

# Step 2: Check Node version
echo -e "${YELLOW}[2/6]${NC} Checking Node.js version..."
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓${NC} Node.js version: $NODE_VERSION"
echo ""

# Step 3: Check environment variables
echo -e "${YELLOW}[3/6]${NC} Checking environment variables..."
if [ -f ".env.production" ]; then
  echo -e "${GREEN}✓${NC} .env.production found"
  
  # Check required variables
  source .env.production
  
  if [ -z "$NEXT_PUBLIC_API_URL" ]; then
    echo -e "${RED}✗${NC} NEXT_PUBLIC_API_URL not set in .env.production"
    exit 1
  fi
  
  echo -e "${GREEN}✓${NC} Required environment variables set"
  echo "  - NEXT_PUBLIC_API_URL: $NEXT_PUBLIC_API_URL"
else
  echo -e "${YELLOW}⚠${NC} .env.production not found (using defaults)"
fi
echo ""

# Step 4: Install dependencies
echo -e "${YELLOW}[4/6]${NC} Installing production dependencies..."
if npm ci --only=production; then
  echo -e "${GREEN}✓${NC} Dependencies installed successfully"
else
  echo -e "${RED}✗${NC} Failed to install dependencies"
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

if [ ! -d ".next" ]; then
  echo -e "${RED}✗${NC} .next directory not found"
  exit 1
fi

if [ ! -f ".next/BUILD_ID" ]; then
  echo -e "${RED}✗${NC} BUILD_ID not found"
  exit 1
fi

BUILD_ID=$(cat .next/BUILD_ID)
NEXT_SIZE=$(du -sh .next | cut -f1)

echo -e "${GREEN}✓${NC} Build output verified"
echo "  - Build ID: $BUILD_ID"
echo "  - Size: $NEXT_SIZE"
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Build test completed successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Test the build: npm run start"
echo "  2. Open http://localhost:3000"
echo "  3. Verify all pages load correctly"
echo "  4. Test API integration"
echo ""

exit 0
