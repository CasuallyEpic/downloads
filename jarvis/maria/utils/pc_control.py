import os
import subprocess
import webbrowser
import pyautogui

def execute_command(text: str) -> str:
    """Parses text commands to execute local PC actions."""
    text = text.lower()
    
    if "open notepad" in text:
        subprocess.Popen(["notepad.exe"])
        return "Opening Notepad."
        
    elif "open calculator" in text:
        subprocess.Popen(["calc.exe"])
        return "Opening Calculator."
        
    elif "open browser" in text or "open google" in text:
        webbrowser.open("https://www.google.com")
        return "Opening your web browser to Google."
        
    elif "open youtube" in text:
        webbrowser.open("https://www.youtube.com")
        return "Opening YouTube."
        
    elif "search for" in text:
        # e.g., "search for python tutorials"
        idx = text.find("search for")
        query = text[idx + len("search for"):].strip()
        webbrowser.open(f"https://www.google.com/search?q={query}")
        return f"Searching the web for {query}."
        
    elif "take screenshot" in text or "take a screenshot" in text:
        screenshot = pyautogui.screenshot()
        filename = "screenshot.png"
        screenshot.save(filename)
        return f"I have taken a screenshot and saved it as {filename}"
        
    # We can add many more actions here mapping phrase to OS commands.
    # Return None if no hardcoded action was matched, so the LLM can try.
    return None
