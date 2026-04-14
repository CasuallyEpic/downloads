@echo off
echo Installing dependencies for Maria AI...

pip install asgiref certifi charset-normalizer colorama distlib filelock httpx idna mistralai orjson pyttsx3 PySocks pydantic pydantic_core python-dotenv requests six sniffio typing_extensions urllib3 wheel pyautogui SpeechRecognition

REM PyAudio on Windows can sometimes require pipwin depending on python version
pip install pyaudio
if %errorlevel% neq 0 (
    echo [WARNING] Default PyAudio failed. Attempting with pipwin...
    pip install pipwin
    pipwin install pyaudio
)

echo.
echo Dependencies installed successfully.
echo.
echo Please do not forget to add your Mistral API Key to the .env file!
echo Setup your virtual environment or run: python main.py
pause
