:: Runs this script to package the game for standalone distribution

@echo off

echo Removing old bin folder to ensure a rebuild...
rd /S /Q bin

echo Packaging the game into the .\bin folder...
:: Known to work only on Node v9.2.1 in order to get around the "primordials not defined" error
call grunt dist

set defaultgamename=electron.exe
set rcedit=rcedit-x64.exe

:: To change the desktop icon of the game, use rcedit.exe - an Electron open source tool used to edit basic file settings
if not exist %rcedit% (
    echo Downloading %rcedit% to perform post-packaging activities...
    powershell -Command "Invoke-WebRequest -Uri https://github.com/electron/rcedit/releases/download/v1.1.1/rcedit-x64.exe -OutFile rcedit-x64.exe"
)

:: Change the icon
echo Changing the game icon...
call %rcedit% bin\%defaultgamename% --set-icon favicon.ico

echo Setting various miscellaneous properties...
call %rcedit% bin\%defaultgamename% --set-version-string "FileDescription" "A hil-hair-ious adventure with your good pal, Merio"
call %rcedit% bin\%defaultgamename% --set-version-string "ProductName" "MERIO Rejuvenation"
call %rcedit% bin\%defaultgamename% --set-version-string "OriginalFilename" "MERIO Rejuvenation.exe"
call %rcedit% bin\%defaultgamename% --set-version-string "LegalCopyright" "Remember kids, stealing is bad."
call %rcedit% bin\%defaultgamename% --set-version-string "CompanyName" "Team Plectrum"
call %rcedit% bin\%defaultgamename% --set-file-version "1.0.0.0"
call %rcedit% bin\%defaultgamename% --set-product-version "1.0.0"

:: Change the executable name after packaging, as it is not known where the default name is set
echo Changing the game name...
ren bin\%defaultgamename% "MERIO Rejuvenation.exe"

echo Preserving license info from Electron...
mkdir bin\electron_license
move bin\LICENSE* bin\electron_license

:: Remove rcedit.exe, although it is helpful to have around when doing incremental packaging
:: del rcedit-x64.exe

echo Packaging completed! 
echo Note that the icon may appear to use the default Electron icon in certain File Explorer views.
echo You can verify that the correct icon is being loaded by viewing the executable properties.

@echo on
