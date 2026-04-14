import os
from mistralai import Mistral

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import MISTRAL_API_KEY, MISTRAL_MODEL, AGENT_NAME

def get_mistral_response(prompt: str, context: list = None) -> str:
    if not MISTRAL_API_KEY or MISTRAL_API_KEY == "your_mistral_api_key_here":
        return "I'm sorry, my API key is not configured. Please add your free Mistral API key to the .env file."
        
    client = Mistral(api_key=MISTRAL_API_KEY)
    
    messages = [
        {"role": "system", "content": f"You are an AI personal assistant named {AGENT_NAME}. You manage PC tasks and help the user. Keep your responses concise, helpful, and friendly. Do not use markdown format in your output because your text is going to be spoken using Text-To-Speech."}
    ]
    
    if context:
        messages.extend(context)
        
    messages.append({"role": "user", "content": prompt})
    
    try:
        response = client.chat.complete(
            model=MISTRAL_MODEL,
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"I encountered an error connecting to Mistral. {str(e)}"
