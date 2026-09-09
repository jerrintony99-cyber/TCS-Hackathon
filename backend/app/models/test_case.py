from typing import List, Optional
from pydantic import BaseModel, Field

class TestCaseModel(BaseModel):
    id: str = Field(..., description="Unique Test Case ID, e.g. TC001")
    title: str = Field(..., description="Descriptive title of the test scenario")
    user_story_ref: Optional[str] = Field("REQ-01", description="Traceability reference to requirement")
    preconditions: List[str] = Field(default_factory=list, description="List of prerequisite conditions")
    test_data: List[str] = Field(default_factory=list, description="Concrete test data values")
    steps: List[str] = Field(..., description="Actionable, numbered execution steps")
    expected_result: str = Field(..., description="Specific verification result and system state")
    priority: str = Field(..., description="High, Medium, or Low")
    test_type: str = Field(..., description="Functional, Negative, Edge Case, Security, or Performance")
    category: str = Field(..., description="Positive or Negative")
    status: str = Field("Ready", description="Draft, Ready, Passed, Failed, Blocked")

class AnalysisModel(BaseModel):
    summary: str
    actors: Optional[List[str]] = Field(default_factory=list)
    acceptance_criteria: Optional[List[str]] = Field(default_factory=list)
    assumptions: List[str] = Field(default_factory=list)
    missing_information: List[str] = Field(default_factory=list)

class CoverageModel(BaseModel):
    total: int
    positive: int
    negative: int
    edge_cases: int
    security: int
    performance: int
    high_priority: int
    medium_priority: int
    low_priority: int
    overall_score: int

class GenerateRequest(BaseModel):
    user_story: str
    test_case_count: int = 8
    test_types: List[str] = ["Functional", "Negative", "Edge Case", "Security", "Performance"]
    priority_filter: Optional[str] = "All"
    provider: Optional[str] = "gemini"
    model: Optional[str] = "gemini-3.8-flash"

class RegenerateRequest(BaseModel):
    user_story: str
    existing_test_case: TestCaseModel
    instruction: Optional[str] = None
