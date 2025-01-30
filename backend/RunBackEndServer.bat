@echo off

call C:\FileServer\Masada\P\setEnvironments.bat

timeout 5


C:
cd C:\Users\ATH_O\Documents\OmerK\WebSocket\Cockpit-Control\backend\bin\x64\Debug\net7.0
REM set ASPNETCORE_ENVIRONMENT=Development
REM set ASPNETCORE_URLS=https://192.168.18.208:7195
start Backend.exe

