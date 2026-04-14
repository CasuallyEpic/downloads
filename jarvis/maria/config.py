import os
from dotenv import load_dotenv

# Load env variables
load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "")
AGENT_NAME = "Maria"

# Default Model parameters
# You can use "mistral-small-latest" or "open-mistral-7b" or "open-mistral-nemo" on the free tier
MISTRAL_MODEL = "mistral-small-latest"
