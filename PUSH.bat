@echo off
cd /d "%~dp0"
echo === Gefuehle-Memory Push ===
"C:\Program Files\Git\cmd\git.exe" add -A
"C:\Program Files\Git\cmd\git.exe" commit -m "update"
"C:\Program Files\Git\cmd\git.exe" push
echo === Done! ===
pause
