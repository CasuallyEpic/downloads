import pyttsx3
import speech_recognition as sr

# Initialize Text-to-Speech Engine
engine = pyttsx3.init()

def configure_voice():
    voices = engine.getProperty('voices')
    # Use a female voice for Maria if available
    for voice in voices:
        if "zira" in voice.name.lower() or "female" in voice.name.lower():
            engine.setProperty('voice', voice.id)
            break
            
    # Set speech rate (150-170 is a good natural pace)
    engine.setProperty('rate', 165)

configure_voice()

def speak(text: str):
    """Speaks the provided text using pyttsx3."""
    print(f"\nMaria: {text}")
    engine.say(text)
    engine.runAndWait()

def listen() -> str:
    """Listens to the microphone and returns recognized speech as text."""
    recognizer = sr.Recognizer()
    
    with sr.Microphone() as source:
        print("\nAdjusting for ambient noise... Please wait.")
        recognizer.adjust_for_ambient_noise(source, duration=1)
        
        print("\Listening...")
        try:
            # We set a short timeout and phrase limit to make responses quicker
            audio = recognizer.listen(source, timeout=10, phrase_time_limit=15)
            
            print("Recognizing audio...")
            # We use Google's free SR API included in SpeechRecognition
            text = recognizer.recognize_google(audio)
            print(f"You: {text}")
            return text
            
        except sr.WaitTimeoutError:
            print("Listening timed out.")
            return ""
        except sr.UnknownValueError:
            print("Sorry, I could not understand the audio.")
            return ""
        except sr.RequestError as e:
            print(f"Could not request results from the speech recognition service; {e}")
            return ""
        except Exception as e:
            print(f"Error during listening: {e}")
            return ""
