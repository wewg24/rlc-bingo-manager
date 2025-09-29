@echo off
echo 🚀 Starting Claude Code Resume Session...
echo.

cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File ".\scripts\claude-resume-advanced.ps1" -Mode auto

pause
