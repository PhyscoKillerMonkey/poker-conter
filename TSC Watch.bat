Title TSC Watch Server
@ECHO off

if not "%minimized%"=="" goto :minimized
set minimized=true
start /min cmd /C "%~dpnx0"
goto :EOF
:minimized

start "TSC Watch Client" /min tsc -w -p src/client
tsc -w -p src/server