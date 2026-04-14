import time
import sys
import os

# Add root folder to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.speech import speak, listen
from utils.llm import get_mistral_response
from utils.pc_control import execute_command
from config import AGENT_NAME

def main():
    speak(f"Hello! I am {AGENT_NAME}, your personal AI assistant. I am ready to manage your PC tasks.")
    
    chat_context = []
    
    while True:
        try:
            # 1. Listen for user voice commands
            user_input = listen()
            
            # If nothing was heard, continue listening loop (24/7)
            if not user_input:
                # Add a sleep so we don't hog CPU if it fails out of loop too fast
                time.sleep(1)
                continue
                
            text_lower = user_input.lower()
            
            # 2. Check for shutdown commands
            if "goodbye" in text_lower or "exit" in text_lower or "stop maria" in text_lower or "sleep" in text_lower:
                speak("Goodbye! Have a great day ahead.")
                break
                
            # 3. Check for specific hardcoded OS/PC tasks first
            action_response = execute_command(user_input)
            
            # 4. If action matched, inform the user
            if action_response:
                speak(action_response)
                # We can store this action in context so the LLM remembers what it just did
                chat_context.append({"role": "user", "content": user_input})
                chat_context.append({"role": "assistant", "content": action_response})
                
            # 5. Otherwise, pass the conversational phrase to the Mistral LLM
            else:
                response = get_mistral_response(user_input, chat_context)
                speak(response)
                
                # Update short-term memory (keep last 5 interactions to save tokens)
                chat_context.append({"role": "user", "content": user_input})
                chat_context.append({"role": "assistant", "content": response})
                
                if len(chat_context) > 10:
                    chat_context = chat_context[-10:] # Keep the queue at fixed length
                    
        except KeyboardInterrupt:
            print("\n")
            speak("Shutting down via keyboard interrupt. Goodbye!")
            break
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            speak("I encountered an error. Let's try that again.")
            time.sleep(2)

if __name__ == "__main__":
    main()
