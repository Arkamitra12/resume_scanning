
import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Read Foundry configuration
endpoint = os.getenv("FOUNDRY_ENDPOINT")
api_key = os.getenv("FOUNDRY_API_KEY")
model = os.getenv("FOUNDRY_MODEL")

# Check configuration
if not endpoint or not api_key or not model:
    raise ValueError("Missing Microsoft Foundry configuration in .env")

# Create OpenAI-compatible client
client = OpenAI(
    base_url=endpoint.replace("/responses", ""),
    api_key=api_key
)

# Send a test request
response = client.responses.create(
    model=model,
    input="Say hello and confirm that you are responding from Microsoft Foundry."
)

# Display response
print("\nMicrosoft Foundry Connection Successful!")
print("Model:", response.model)
print("Response:", response.output_text)
