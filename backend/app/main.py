from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from app.models.test_case import GenerateRequest, RegenerateRequest
from app.services.llm_service import LLMService

app = FastAPI(
    title="TestGen AI Backend API",
    description="Enterprise QA Test Case Generation Agent",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

history_db = []

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "TestGen AI",
        "has_gemini_key": bool(os.getenv("GEMINI_API_KEY"))
    }

@app.post("/api/generate-test-cases")
async def generate_test_cases(request: GenerateRequest):
    try:
        service = LLMService(provider=request.provider or "gemini", model=request.model or "gemini-3.8-flash")
        result = await service.generate_test_cases(
            user_story=request.user_story,
            count=request.test_case_count,
            test_types=request.test_types
        )
        history_db.append(result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
def get_history():
    return history_db

@app.delete("/api/history/{item_id}")
def delete_history_item(item_id: str):
    global history_db
    history_db = [h for h in history_db if h.get("id") != item_id]
    return {"status": "deleted"}
