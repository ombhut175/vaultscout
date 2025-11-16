@echo off
REM ============================================================================
REM Backend Build Test Script (Windows)
REM
REM This script tests the production build process for the backend
REM
REM Usage:
REM   test-build.bat
REM
REM ============================================================================

setlocal enabledelayedexpansion

echo ========================================
echo VaultScout Backend Build Test
echo ========================================
echo.

REM Step 1: Clean previous build
echo [1/6] Cleaning previous build...
if exist dist (
    rmdir /s /q dist
    echo [OK] Cleaned dist directory
) else (
    echo [OK] No previous build found
)
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

REM Step 3: Install dependencies
echo [3/6] Installing production dependencies...
call npm ci --only=production
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo [OK] Dependencies installed successfully
echo.

REM Step 4: Run TypeScript type check
echo [4/6] Running TypeScript type check...
call npm run type-check
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Type check failed
    exit /b 1
)
echo [OK] Type check passed
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

if not exist dist (
    echo [ERROR] dist directory not found
    exit /b 1
)

if not exist dist\src\main.js (
    echo [ERROR] main.js not found in dist\src\
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
echo   1. Test the build: npm run start:prod
echo   2. Verify API endpoints work
echo   3. Check logs for errors
echo.

exit /b 0
