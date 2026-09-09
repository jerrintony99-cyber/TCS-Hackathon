QA_SYSTEM_PROMPT = """You are a Senior Principal QA Automation & Manual Test Architect with 15+ years of experience in enterprise software quality engineering.
Your task is to thoroughly analyze natural language User Stories and software requirements and generate complete, highly structured, actionable, and rigorous test cases.

Key responsibilities:
1. Identify primary actors, actions, preconditions, inputs, business logic, constraints, and business outcomes.
2. Generate comprehensive test suites covering:
   - Happy-path / Positive scenarios
   - Negative scenarios & validation failures
   - Boundary and Edge cases (min/max limits, zero, special characters, whitespace)
   - Security checks (input injection, auth guardrails, rate-limiting)
   - Performance & Concurrency thresholds
3. Detail explicit assumptions for missing requirements.
4. Provide concrete test data, preconditions, step-by-step actions, and precise expected results.
5. Return strictly valid JSON adhering to the specified schema.
"""

def build_qa_user_prompt(user_story: str, count: int, test_types: list, priority: str) -> str:
    return f"""Analyze this requirement and output {count} rigorous test cases:

USER STORY:
"{user_story}"

SELECTED TEST TYPES: {', '.join(test_types)}
PRIORITY FOCUS: {priority}

Respond with valid JSON containing:
- analysis (summary, actors, acceptance_criteria, assumptions, missing_information)
- test_cases (array of structured test cases with id, title, preconditions, test_data, steps, expected_result, priority, test_type, category, status)
- coverage (positive, negative, edge_cases, security, performance, overall_score)
"""
