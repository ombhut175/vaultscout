@echo off
REM ============================================================================
REM Database Backup Script for VaultScout (Windows)
REM
REM This script creates a backup of the PostgreSQL database
REM
REM Usage:
REM   backup-database.bat
REM
REM Environment Variables:
REM   DATABASE_URL        PostgreSQL connection string (required)
REM
REM ============================================================================

setlocal enabledelayedexpansion

REM Configuration
set BACKUP_DIR=backups
set RETENTION_DAYS=30

REM Load environment variables from .env.local
if exist .env.local (
    echo Loading environment variables from .env.local...
    for /f "usebackq tokens=1,* delims==" %%a in (".env.local") do (
        set "%%a=%%b"
    )
)

REM Check if DATABASE_URL is set
if "%DATABASE_URL%"=="" (
    echo [ERROR] DATABASE_URL environment variable is not set
    echo Please set DATABASE_URL or create a .env.local file
    exit /b 1
)

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" (
    echo Creating backup directory: %BACKUP_DIR%
    mkdir "%BACKUP_DIR%"
)

REM Generate backup filename with timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,8%_%datetime:~8,6%
set BACKUP_FILE=%BACKUP_DIR%\vaultscout_%TIMESTAMP%.sql

echo Starting database backup...
echo Backup file: %BACKUP_FILE%

REM Create backup using pg_dump
pg_dump "%DATABASE_URL%" > "%BACKUP_FILE%" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Backup created successfully: %BACKUP_FILE%
) else (
    echo [ERROR] Failed to create backup
    if exist "%BACKUP_FILE%" del "%BACKUP_FILE%"
    exit /b 1
)

REM Remove old backups based on retention policy
echo Cleaning up old backups (retention: %RETENTION_DAYS% days)...

forfiles /P "%BACKUP_DIR%" /M vaultscout_*.sql /D -%RETENTION_DAYS% /C "cmd /c del @path" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Old backups cleaned up
) else (
    echo No old backups to delete
)

REM Count current backups
set BACKUP_COUNT=0
for %%f in (%BACKUP_DIR%\vaultscout_*.sql) do set /a BACKUP_COUNT+=1

echo.
echo Backup completed successfully!
echo.
echo Backup Summary:
echo   File: %BACKUP_FILE%
echo   Total backups: %BACKUP_COUNT%
echo   Retention: %RETENTION_DAYS% days
echo.

exit /b 0
