import os
import json
from typing import List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Username Suggestion Service",
    description="A FastAPI service that uses Groq AI to generate creative usernames based on user interests.",
    version="1.0.0"
)

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY environment variable is not set")

client = Groq(api_key=api_key)

class InterestRequest(BaseModel):
    interests: List[str] = Field(
        ..., 
        min_items=1, 
        max_items=10,
        description="A list of 1 to 10 user interests (e.g., ['gaming', 'python']).",
        examples=[["gaming", "space", "music"]]
    )

class SuggestionResponse(BaseModel):
    suggestions: List[str] = Field(
        ..., 
        description="A list of 3 unique, creative usernames.",
        examples=[["AstroGamer", "PySpaceJam", "MelodyCode"]]
    )

@app.post("/api/suggest-username", response_model=SuggestionResponse)
async def suggest_username(request: InterestRequest):
    interests_str = ", ".join(request.interests)
    system_instruction = (
        "You are an expert branding assistant. Your task is to generate 3 unique, catchy, and short usernames "
        "based on the user's provided interests. "
        "Constraints: "
        "1. No special characters except underscores. "
        "2. Max 15 characters per name. "
        "3. Return ONLY a valid JSON array of strings. "
        "Example: [\"UserOne\", \"UserTwo\", \"UserThree\"]"
    )
    
    user_prompt = f"Create usernames for these interests: {interests_str}"

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=100,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty response from AI")

        data = json.loads(content)
        
        if isinstance(data, dict):
            suggestions = list(data.values())[0]
        else:
            suggestions = data

        if not isinstance(suggestions, list):
            raise ValueError("AI did not return a list")

        return {"suggestions": [str(s) for s in suggestions][:3]}

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse AI response as JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq API Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)   