@echo off
cls
echo --------------------------------------------
echo   Doing Post Build Foo ON: %COMPUTERNAME%
echo --------------------------------------------

if "%COMPUTERNAME%" == "SCOTT-PC2" set kerbalplug=C:\Program Files (x86)\Steam\steamapps\common\Kerbal Space Program\GameData\GoAtThrottleUp\Plugin
if "%COMPUTERNAME%" == "SCOTT-PC2" set kerbalpart=C:\Program Files (x86)\Steam\steamapps\common\Kerbal Space Program\GameData\GoAtThrottleUp\Parts

echo.
echo --------------------------------------------
echo           Cleaning Up Enviroment
echo --------------------------------------------
rmdir /s /q "%kerbalpart%"
rmdir /s /q "%kerbalplug%"
mkdir "%kerbalpart%"
mkdir "%kerbalplug%"

echo.
echo --------------------------------------------
echo        Copying Plugin into folder 
echo --------------------------------------------

xcopy /y .\bin\Release\GoAtThrottleUp.dll "%kerbalplug%"

echo.
echo --------------------------------------------
echo         Copying Parts into folder 
echo --------------------------------------------
xcopy /s /y ..\Parts\* "%kerbalpart%"

timeout /t 5