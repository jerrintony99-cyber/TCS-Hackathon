import os
import json
import httpx
from typing import Dict, Any

class LLMService:
    """Modular LLM service supporting Gemini, Ollama, OpenAI, and Mock fallback."""

    def __init__(self, provider: str = "gemini", model: str = "gemini-3.8-flash"):
        self.provider = provider
        self.model = model

    async def generate_test_cases(self, user_story: str, count: int = 8, test_types = None) -> Dict[str, Any]:
        types_list = test_types or ["Functional", "Negative", "Edge Case", "Security", "Performance"]
        
        # Check Gemini API Key
        gemini_key = os.getenv("GEMINI_API_KEY")
        if self.provider == "gemini" and gemini_key:
            try:
                from google import genai
                client = genai.Client(api_key=gemini_key)
                response = client.models.generate_content(
                    model=self.model,
                    contents=f"Generate {count} QA test cases for: {user_story}",
                    config={"response_mime_type": "application/json"}
                )
                return json.loads(response.text)
            except Exception as e:
                print(f"Gemini API call failed, falling back to mock: {e}")

        # Check Ollama local endpoint
        if self.provider == "ollama":
            ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    resp = await client.post(
                        f"{ollama_url}/api/generate",
                        json={
                            "model": self.model or "llama3",
                            "prompt": f"Generate QA test cases in JSON format for: {user_story}",
                            "format": "json",
                            "stream": False
                        }
                    )
                    if resp.status_code == 200:
                        return json.loads(resp.json().get("response", "{}"))
            except Exception as e:
                print(f"Ollama connection error: {e}")

        # Fallback synthetic QA response
        return self._generate_synthetic_response(user_story, count)

    def _generate_synthetic_response(self, user_story: str, count: int) -> Dict[str, Any]:
        return {
            "analysis": {
                "summary": f"Automated QA breakdown for requirement: {user_story[:100]}...",
                "actors": ["End User", "System"],
                "acceptance_criteria": ["Happy path execution succeeds", "Validation guardrails enforced"],
                "assumptions": ["Network is stable", "Secure HTTPS session"],
                "missing_information": ["Rate-limiting threshold unspecified"]
            },
            "test_cases": [
                {
                    "id": f"TC00{i+1}",
                    "title": f"Verify scenario {i+1} for user story",
                    "user_story_ref": "REQ-01",
                    "preconditions": ["User is on target screen"],
                    "test_data": ["Standard valid input"],
                    "steps": ["1. Open screen.", "2. Input details.", "3. Click submit."],
                    "expected_result": "System executes action as expected.",
                    "priority": "High" if i < 2 else "Medium",
                    "test_type": "Functional" if i % 2 == 0 else "Negative",
                    "category": "Positive" if i % 2 == 0 else "Negative",
                    "status": "Ready"
                }
                for i in range(count)
            ],
            "coverage": {
                "total": count,
                "positive": count // 2 + count % 2,
                "negative": count // 2,
                "edge_cases": 2,
                "security": 1,
                "performance": 1,
                "high_priority": min(count, 3),
                "medium_priority": max(0, count - 3),
                "low_priority": 0,
                "overall_score": 90
            }
        }
