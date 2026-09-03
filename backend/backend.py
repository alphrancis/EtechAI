from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Literal, Optional
from dotenv import load_dotenv
from google import genai
from PIL import Image

import os
import base64
import io

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise RuntimeError(
        "GOOGLE_API_KEY is missing. "
        "Please add it to your .env file."
    )

client = genai.Client(
    api_key=GOOGLE_API_KEY
)
app = FastAPI(
    title="Google AI Demo Backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:8443",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Pydantic Models ──
class ModelInfo(BaseModel):
    id: str
    name: str
    badge: str
    color: str
    description: str


class Message(BaseModel):
    role: Literal["user", "ai", "system"]
    text: str


class Config(BaseModel):
    temperature: float
    maxTokens: int
    topP: float
    topK: int
    systemPrompt: str
    safetyLevel: Literal["none", "low", "medium", "high"]


class ChatRequest(BaseModel):
    model: str
    messages: List[Message]
    config: Config


class ChatResponse(BaseModel):
    text: str
    model: str
    tokensUsed: Optional[dict] = None


class EmbeddingRequest(BaseModel):
    textA: str
    textB: str
    model: str


class EmbeddingResult(BaseModel):
    vecA: List[float]
    vecB: List[float]
    sim: float


class VisionRequest(BaseModel):
    image: str  # base64 data URL
    prompt: str
    model: str


class CodeRequest(BaseModel):
    code: str
    model: str


# ── Model Filtering ──
EXCLUDED_PATTERNS = [
    "tts",
    "embedding",
    "aqa",
    "vision",
    "imagen",
    "preview",
    "exp",
    "001",
    "002",
    "2.5",      
]

ALLOWED_MODELS = {
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.7-flash",
    "gemini-3.1-flash-image",
    "gemma-4-31b-it",
    "gemma-4-26b-a4b-it"
}

# ── Endpoints ──

@app.get("/")
def health_check():
    return {
        "status": "online",
        "message": "Backend is running"
    }


@app.get("/api/models", response_model=List[ModelInfo])
def get_models():
    try:
        available_models = []

        for model in client.models.list():
            model_id = model.name.replace("models/", "")
            supported_actions = getattr(model, "supported_actions", [])

            if model_id not in ALLOWED_MODELS:
                continue
            if "generateContent" not in supported_actions:
                continue

            model_lower = model_id.lower()

            if "flash" in model_lower:
                badge, color = "Fast", "#f0c84a"
            elif "flash-lite" in model_lower:
                badge, color = "Advanced", "#6bcf8e"
            else:
                badge, color = "Available", "#7c9ef8"

            available_models.append(ModelInfo(
                id=model_id,
                name=model.display_name or model_id,
                badge=badge,
                color=color,
                description=model.description or "Gemini AI model"
            ))

        return available_models

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve models: {str(e)}")


@app.get("/api/debug/models")
def debug_models():
    try:
        result = []

        for model in client.models.list():
            result.append({
                "name": model.name,
                "display_name": getattr(model, "display_name", None),
                "supported_actions": getattr(model, "supported_actions", [])
            })

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        if not req.messages:
            raise HTTPException(
                status_code=400,
                detail="Messages cannot be empty"
            )

        contents = []

        for message in req.messages:
            if message.role == "system":
                continue

            role = "model" if message.role == "ai" else "user"

            contents.append({
                "role": role,
                "parts": [{"text": message.text}]
            })

        response = client.models.generate_content(
            model=req.model,
            contents=contents,
            config={
                "temperature": req.config.temperature,
                "max_output_tokens": req.config.maxTokens,
                "top_p": req.config.topP,
                "top_k": req.config.topK,
                "system_instruction": req.config.systemPrompt
            }
        )

        usage = getattr(response, "usage_metadata", None)

        return ChatResponse(
            text=response.text,
            model=req.model,
            tokensUsed={
                "input": getattr(usage, "prompt_token_count", 0) if usage else 0,
                "output": getattr(usage, "candidates_token_count", 0) if usage else 0
            }
        )

    except HTTPException:
        raise

    except Exception as e:
        err = str(e)
        if "429" in err or "RESOURCE_EXHAUSTED" in err:
            raise HTTPException(
                status_code=429,
                detail="Model is rate-limited on your plan. Try a Flash model."
            )
        if "404" in err or "NOT_FOUND" in err:
            raise HTTPException(
                status_code=404,
                detail="This model is no longer available. Please select another."
            )
        raise HTTPException(status_code=500, detail=err)


@app.post("/api/embeddings", response_model=EmbeddingResult)
def embeddings(req: EmbeddingRequest):
    try:
        import math

        response_a = client.models.embed_content(
            model=req.model,
            contents=req.textA
        )

        response_b = client.models.embed_content(
            model=req.model,
            contents=req.textB
        )

        vecA = response_a.embeddings[0].values
        vecB = response_b.embeddings[0].values

        dot = sum(a * b for a, b in zip(vecA, vecB))
        magA = math.sqrt(sum(a * a for a in vecA))
        magB = math.sqrt(sum(b * b for b in vecB))
        sim = dot / (magA * magB) if magA and magB else 0

        return EmbeddingResult(
            vecA=vecA,
            vecB=vecB,
            sim=round(sim, 4)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/vision")
def vision(req: VisionRequest):
    try:
        if "," in req.image:
            image_data = req.image.split(",", 1)[1]
        else:
            image_data = req.image

        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))

        response = client.models.generate_content(
            model=req.model,
            contents=[req.prompt, image]
        )

        return {
            "text": response.text,
            "model": req.model
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/code")
def code(req: CodeRequest):
    try:
        response = client.models.generate_content(
            model=req.model,
            contents=f"Explain this code:\n\n```python\n{req.code}\n```"
        )
        return {"text": response.text, "model": req.model}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)