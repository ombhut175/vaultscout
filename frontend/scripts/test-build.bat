@echo off
REM ============================================================================
REM Frontend Build Test Script (Windows)
REM
REM This script tests the production build process for the frontend
REM
REM Usage:
REM   test-build.bat
REM
REM ============================================================================

setlocal enabledelayedexpansion

echo ========================================
echo VaultScout Frontend Build Test
echo ========================================
echo.

REM Step 1: Clean previous build
echo [1/6] Cleaning previous build...
if exist .next (
    rmdir /s /q .next
    echo [OK] Cleaned .next directory
)
if exist out (
    rmdir /s /q out
    echo [OK] Cleaned out directory
)
echo [OK] Build directories cleaned
echo.

REM Step 2: Check Node version
echo [2/6] Checking Node.js version...
node -v
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found
    exit /b 1
)
echo [OK] Node.js version checked
echo.

REM Step 3: Check environment variables
echo [3/6] Checking environment variables...
if exist .env.production (
    echo [OK] .env.production found
) else (
    echo [WARNING] .env.production not found (using defaults)
)
echo.

REM Step 4: Install dependencies
echo [4/6] Installing production dependencies...
call npm ci --only=production
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo [OK] Dependencies installed successfully
echo.

REM Step 5: Build the application
echo [5/6] Building application...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed
    exit /b 1
)
echo [OK] Build completed successfully
echo.

REM Step 6: Verify build output
echo [6/6] Verifying build output...

if not exist .next (
    echo [ERROR] .next directory not found
    exit /b 1
)

if not exist .next\BUILD_ID (
    echo [ERROR] BUILD_ID not found
    exit /b 1
)

echo [OK] Build output verified
echo.

REM Summary
echo ========================================
echo [SUCCESS] Build test completed successfully!
echo ========================================
echo.
echo Next steps:
echo   1. Test the build: npm run start
echo   2. Open http://localhost:3000
echo   3. Verify all pages load correctly
echo   4. Test API integration
echo.

exit /b 0
