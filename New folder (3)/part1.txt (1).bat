@echo off

:: Remove full Screen Recordings folder
rd /s /q "%USERPROFILE%\Videos\Screen Recordings"
mkdir "%USERPROFILE%\Videos\Screen Recordings"

:: Delete all screenshots
del /f /q "%USERPROFILE%\Pictures\Screenshots\*.*"

echo Screen recordings wiped and screenshots deleted.
pause