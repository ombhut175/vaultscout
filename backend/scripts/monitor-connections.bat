@echo off
echo ====================================
echo Redis Connection Monitor
echo ====================================
echo.
echo Press Ctrl+C to stop monitoring
echo.

:loop
cls
echo [%date% %time%] Checking Redis connections...
echo.
call npm run redis:cleanup
echo.
echo ====================================
echo Refreshing in 5 seconds...
echo Press Ctrl+C to stop
echo ====================================
timeout /t 5 /nobreak > nul
goto loop
