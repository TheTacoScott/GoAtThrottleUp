@echo off
cls
echo --------------------------------------------
echo   Doing Post Build Foo ON: %COMPUTERNAME%
echo --------------------------------------------
cd
set kerbalplug=E:\Steam\SteamApps\common\Kerbal Space Program\GameData\GoAtThrottleUp\
set ziploc=c:\Program Files\7-Zip\7z.exe

if "%COMPUTERNAME%" == "SCOTT-PC2" set kerbalplug=C:\Program Files (x86)\Steam\steamapps\common\Kerbal Space Program\GameData\GoAtThrottleUp\
if "%COMPUTERNAME%" == "SCOTT-PC2" set ziploc=c:\Program Files\7-Zip\7z.exe

echo.
echo           Cleaning Up Enviroment
echo --------------------------------------------
rmdir /s /q "%kerbalplug%"
mkdir "%kerbalplug%"
mkdir "%kerbalplug%\Plugin"
mkdir "%kerbalplug%\Parts"

echo.
echo        Copying Plugin into folder 
echo --------------------------------------------

xcopy /y .\bin\Release\GoAtThrottleUp.dll "%kerbalplug%\Plugin\"

echo.
echo --------------------------------------------
echo         Copying Parts into folder 
echo --------------------------------------------
xcopy /s /y ..\Parts\* "%kerbalplug%\Parts\"

echo.
echo --------------------------------------------
echo         Building Releases
echo --------------------------------------------
del /S ..\ServerRelay\*.pyc
del .\bin\Release\GATU*.zip

"%ziploc%" a -tzip .\bin\Release\GATU-ServerRelay.zip ..\ServerRelay\*
"%ziploc%" a -tzip .\bin\Release\GATU-KSP-Plugin.zip "%kerbalplug%\..\GoAt*"

timeout /t 5