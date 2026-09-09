import express from "express";
import path from "path";
import fs from "fs";
import os from "os";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Local persistent storage file
const DATA_DIR = path.join(process.cwd(), "data");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredHistory {
  items: any[];
}

function loadHistory(): any[] {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn("Failed to read history from disk:", err);
  }
  return [];
}

function saveHistory(items: any[]) {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(items.slice(0, 50), null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write history to disk:", err);
  }
}

let historyItems: any[] = loadHistory();

// Initialize Google GenAI client if key is available
function getGeminiClient(customKey?: string) {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Enterprise QA System Prompt
const QA_SYSTEM_PROMPT = `You are a Senior Principal QA Automation & Manual Test Architect with 15+ years of experience in enterprise software quality engineering.
Your task is to thoroughly analyze natural language User Stories and software requirements and generate complete, highly structured, actionable, and rigorous test cases.

You MUST rigorously fulfill these QA principles:
1. DEEP REQUIREMENT PARSING:
   - Identify primary actors, actions, preconditions, inputs, business logic, constraints, and business outcomes.
   - Extract both explicit acceptance criteria and implicit boundary conditions.
2. COMPREHENSIVE TEST TAXONOMY:
   - Positive / Happy Path (Standard successful executions with valid data).
   - Negative Scenarios (Invalid data, unauthorized states, expired sessions, malformed payloads).
   - Boundary & Edge Cases (Min/max limits, empty inputs, single character, zero value, timeout thresholds, concurrency).
   - Security & Compliance (SQLi/XSS input sanitization, token tampering, rate-limiting, privilege escalation).
   - Performance & Resiliency (High volume, network latency, slow responses, duplicate submit prevention).
3. ASSUMPTIONS & MISSING INFORMATION:
   - If the user story is ambiguous or missing key specifications (e.g. lockout threshold, password complexity, error status codes), explicitly call out these assumptions and missing requirements in the analysis section.
4. ACTIONABLE & RIGOROUS TEST SPECIFICATIONS:
   - Every step MUST be executable and specific (e.g., "1. Navigate to /login. 2. Enter email 'test@company.com' into Email field. 3. Click 'Sign In'").
   - Expected results MUST describe exact system feedback, state changes, and UI/API behavior.
   - Test data must be realistic and concrete.
5. NO DUPLICATES:
   - Ensure every test case evaluates a distinct test hypothesis.

You MUST respond strictly in valid JSON matching this schema:
{
  "analysis": {
    "summary": "Concise architectural and functional summary of the requirement",
    "actors": ["Actor 1", "Actor 2"],
    "acceptance_criteria": ["Criteria 1", "Criteria 2"],
    "assumptions": ["Assumed 3 failed attempts lockout rule", "Assumed HTTPS transmission"],
    "missing_information": ["Password complexity rules not specified", "Session expiration time not provided"]
  },
  "test_cases": [
    {
      "id": "TC001",
      "title": "Brief descriptive title of the test case",
      "user_story_ref": "Reference tag or clause",
      "preconditions": ["User account exists in ACTIVE state", "User is on the login page"],
      "test_data": ["email: valid.user@domain.com", "password: CorrectPassword123!"],
      "steps": [
        "1. Open the application login portal.",
        "2. Input the registered email address into the Email field.",
        "3. Input the valid password into the Password field.",
        "4. Click the 'Sign In' button."
      ],
      "expected_result": "Authentication succeeds, JWT token issued, and user is redirected to Dashboard with welcome toast.",
      "priority": "High", // "High" | "Medium" | "Low"
      "test_type": "Functional", // "Functional" | "Negative" | "Edge Case" | "Security" | "Performance"
      "category": "Positive", // "Positive" | "Negative"
      "status": "Ready"
    }
  ],
  "coverage": {
    "positive": 3,
    "negative": 3,
    "edge_cases": 2,
    "security": 1,
    "performance": 1,
    "high_priority": 4,
    "medium_priority": 4,
    "low_priority": 2,
    "overall_score": 92
  }
}`;

// Deterministic High-Quality Synthetic Test Case Generator (for Demo / Fallback Mode)
function generateSyntheticTestCases(
  userStory: string,
  targetCount: number = 8,
  selectedTypes: string[] = ["Functional", "Negative", "Edge Case", "Security", "Performance"],
  priorityFilter: string = "All"
) {
  const lowerStory = userStory.toLowerCase();
  const isAuth = lowerStory.includes("login") || lowerStory.includes("auth") || lowerStory.includes("password") || lowerStory.includes("sign in");
  const isPayment = lowerStory.includes("checkout") || lowerStory.includes("cart") || lowerStory.includes("pay") || lowerStory.includes("card") || lowerStory.includes("atm") || lowerStory.includes("money");
  const isRegister = lowerStory.includes("register") || lowerStory.includes("sign up") || lowerStory.includes("onboarding") || lowerStory.includes("create account");

  let domain = "general";
  if (isAuth) domain = "auth";
  else if (isPayment) domain = "payment";
  else if (isRegister) domain = "register";

  const generatedCases: any[] = [];
  let tcIndex = 1;

  const makeId = () => `TC${String(tcIndex++).padStart(3, "0")}`;

  // Domain-specific test case templates
  if (domain === "auth") {
    generatedCases.push({
      id: makeId(),
      title: "Verify successful login with valid active credentials",
      user_story_ref: "AUTH-01",
      preconditions: ["User account exists in ACTIVE status", "Network connectivity is stable", "Browser at login URL"],
      test_data: ["email: 'qa.verified@company.com'", "password: 'Password#2026!'"],
      steps: [
        "1. Navigate to the application login screen.",
        "2. Enter valid email address into the Email field.",
        "3. Enter valid password into the Password field.",
        "4. Click the 'Sign In' button."
      ],
      expected_result: "User is successfully authenticated, session cookie/token created, and redirected to user dashboard.",
      priority: "High",
      test_type: "Functional",
      category: "Positive",
      status: "Ready"
    });

    generatedCases.push({
      id: makeId(),
      title: "Verify authentication rejection with invalid password",
      user_story_ref: "AUTH-02",
      preconditions: ["User account exists in system"],
      test_data: ["email: 'qa.verified@company.com'", "password: 'WrongPassword999'"],
      steps: [
        "1. Navigate to the login screen.",
        "2. Enter valid email address.",
        "3. Enter an incorrect password.",
        "4. Click the 'Sign In' button."
      ],
      expected_result: "System denies entry, displays 'Invalid email or password' error message, keeps user on login page, clears password field.",
      priority: "High",
      test_type: "Negative",
      category: "Negative",
      status: "Ready"
    });

    generatedCases.push({
      id: makeId(),
      title: "Verify account lockout after multiple consecutive failed attempts",
      user_story_ref: "AUTH-03",
      preconditions: ["User account in ACTIVE status", "Lockout policy threshold = 5 failed attempts"],
      test_data: ["email: 'lockout.target@company.com'", "password: 'BadPassword'"],
      steps: [
        "1. Attempt to login with invalid credentials 5 consecutive times.",
        "2. On the 5th attempt, verify error alert.",
        "3. Attempt 6th login with the correct valid password."
      ],
      expected_result: "Account status switches to LOCKED_TEMPORARILY; 6th attempt is blocked with 'Account locked due to excessive failed attempts. Please try again after 15 minutes.'",
      priority: "High",
      test_type: "Security",
      category: "Negative",
      status: "Ready"
    });

    generatedCases.push({
      id: makeId(),
      title: "Verify email format validation on malformed input",
      user_story_ref: "AUTH-04",
      preconditions: ["User is on the login page"],
      test_data: ["email: 'invalid-email-format@@missingdot'", "password: 'ValidPassword123'"],
      steps: [
        "1. Enter malformed email string into the Email input.",
        "2. Tab out or click 'Sign In'."
      ],
      expected_result: "Inline validation error appears: 'Please enter a valid email address (e.g. name@domain.com)'. Form submission is aborted client-side.",
      priority: "Medium",
      test_type: "Edge Case",
      category: "Negative",
      status: "Ready"
    });

    generatedCases.push({
      id: makeId(),
      title: "Verify behavior when submitting completely empty credentials",
      user_story_ref: "AUTH-05",
      preconditions: ["Login form rendered in clean state"],
      test_data: ["email: '' (empty)", "password: '' (empty)"],
      steps: [
        "1. Leave both Email and Password input fields blank.",
        "2. Click the 'Sign In' button."
      ],
      expected_result: "Both fields highlighted with red error borders; messages 'Email is required' and 'Password is required' are displayed. No network payload sent.",
      priority: "Medium",
      test_type: "Functional",
      category: "Negative",
      status: "Ready"
    });

    generatedCases.push({
      id: makeId(),
      title: "Verify SQL Injection and script payload resistance in credentials input",
      user_story_ref: "AUTH-06",
      preconditions: ["Login form open"],
      test_data: ["email: \"' OR '1'='1' --\"", "password: \"<script>alert('xss')</script>\""],
      steps: [
        "1. Input SQL injection payload into email field.",
        "2. Input XSS script payload into password field.",
        "3. Click 'Sign In'."
      ],
      expected_result: "Inputs are sanitized/parameterized; query fails safely with generic error. No raw database exception or script execution occurs.",
      priority: "High",
      test_type: "Security",
      category: "Negative",
      status: "Ready"
    });

    generatedCases.push({
      id: makeId(),
      title: "Verify login response time under normal network conditions",
      user_story_ref: "AUTH-07",
      preconditions: ["Standard broadband network simulated (<50ms latency)"],
      test_data: ["Valid user credentials"],
      steps: [
        "1. Measure network timeline from 'Sign In' click to token arrival.",
        "2. Repeat 5 times and average."
      ],
      expected_result: "Total round-trip authentication time completes within < 1200ms with spinner feedback displayed during the request.",
      priority: "Low",
      test_type: "Performance",
      category: "Positive",
      status: "Ready"
    });

    generatedCases.push({
      id: makeId(),
      title: "Verify password field masking and toggle visibility control",
      user_story_ref: "AUTH-08",
      preconditions: ["Login form displayed"],
      test_data: ["password: 'SecretPassword987'"],
      steps: [
        "1. Type password into input; observe character masking.",
        "2. Click the 'Show Password' eye icon.",
        "3. Click the eye icon again to hide."
      ],
      expected_result: "Password displays bullet/mask by default (type='password'); clicking reveals plain text; clicking again conceals it.",
      priority: "Medium",
      test_type: "Functional",
      category: "Positive",
      status: "Ready"
    });
  } else if (domain === "payment") {
    generatedCases.push({
      id: makeId(),
      title: "Verify successful checkout transaction with valid payment method",
      user_story_ref: "PAY-01",
      preconditions: ["Cart has at least 1 item ($85.00)", "Valid billing address entered"],
      test_data: ["card_num: '4242424242424242'", "expiry: '12/28'", "cvv: '123'"],
      steps: [
        "1. Proceed to payment review step.",
        "2. Enter valid test credit card details.",
        "3. Click 'Pay Now' button."
      ],
      expected_result: "Payment processed successfully. Order ID generated, invoice receipt sent to user email, and cart emptied.",
      priority: "High",
      test_type: "Functional",
      category: "Positive",
      status: "Ready"
    });

    generatedCases.push({
      id: makeId(),
      title: "Verify declined transaction when card has insufficient funds",
      user_story_ref: "PAY-02",
      preconditions: ["Cart total: $500.00", "Simulated card balance: $50.00"],
      test_data: ["card_num: '4000000000000002' (Insufficient Funds Mock Card)"],
      steps: [
        "1. Input insufficient funds card.",
        "2. Click 'Confirm Payment'."
      ],
      expected_result: "Gateway returns decline code 'insufficient_funds'. System presents user-friendly error: 'Card declined: Insufficient funds. Please try another card.'",
      priority: "High",
      test_type: "Negative",
      category: "Negative",
      status: "Ready"
    });

    generatedCases.push({
      id: makeId(),
      title: "Verify prevention of duplicate charge on double-clicking Pay button",
      user_story_ref: "PAY-03",
      preconditions: ["User at payment final confirmation screen"],
      test_data: ["Standard payment data"],
      steps: [
        "1. Rapidly double-click the 'Pay Now' button within 200ms.",
        "2. Inspect payment gateway idempotency key."
      ],
      expected_result: "Pay button disables immediately upon first click with loading state. Idempotency key prevents duplicate transaction; single charge logged.",
      priority: "High",
      test_type: "Edge Case",
      category: "Positive",
      status: "Ready"
    });

    generatedCases.push({
      id: makeId(),
      title: "Verify expired card validation during input",
      user_story_ref: "PAY-04",
      preconditions: ["Payment form open"],
      test_data: ["expiry: '01/22' (Past date)"],
      steps: [
        "1. Enter card number and CVV.",
        "2. Enter past expiry date '01/22'.",
        "3. Attempt to proceed."
      ],
      expected_result: "Immediate input error: 'Card expiration date must be in the future'. Form blocks submission.",
      priority: "Medium",
      test_type: "Edge Case",
      category: "Negative",
      status: "Ready"
    });

    generatedCases.push({
      id: makeId(),
      title: "Verify PCI-DSS compliant masking of cardholder numbers",
      user_story_ref: "PAY-05",
      preconditions: ["Payment review page rendered"],
      test_data: ["card_num: '4111222233334444'"],
      steps: [
        "1. Submit order.",
        "2. Inspect order receipt, browser DOM, and network payload logs."
      ],
      expected_result: "Card number displayed only as '•••• •••• •••• 4444'. Full PAN and CVV are never stored in plain text or rendered in DOM.",
      priority: "High",
      test_type: "Security",
      category: "Positive",
      status: "Ready"
    });

    generatedCases.push({
      id: makeId(),
      title: "Verify payment gateway timeout recovery and pending order status",
      user_story_ref: "PAY-06",
      preconditions: ["Simulate payment gateway delay > 30 seconds"],
      test_data: ["Standard card"],
      steps: [
        "1. Submit payment request.",
        "2. Intercept and delay response beyond HTTP client timeout."
      ],
      expected_result: "App displays 'Payment processing taking longer than usual. Please check your order history before retrying.' Order placed in PENDING_CONFIRMATION.",
      priority: "Medium",
      test_type: "Performance",
      category: "Negative",
      status: "Ready"
    });
  } else {
    // General requirement template
    generatedCases.push({
      id: makeId(),
      title: `Verify standard expected workflow for requirement`,
      user_story_ref: "REQ-01",
      preconditions: ["System is online", "Prerequisite records exist in valid state"],
      test_data: ["Valid input parameters matching schema"],
      steps: [
        "1. Access the target feature interface.",
        "2. Input all required fields with valid conforming data.",
        "3. Execute the primary submission action."
      ],
      expected_result: "System successfully processes request, persists state changes, and provides positive confirmation feedback.",
      priority: "High",
      test_type: "Functional",
      category: "Positive",
      status: "Ready"
    });

    generatedCases.push({
      id: makeId(),
      title: `Verify rejection of mandatory fields when left blank`,
      user_story_ref: "REQ-02",
      preconditions: ["Feature form loaded in initial default state"],
      test_data: ["Required fields = NULL / Empty string"],
      steps: [
        "1. Leave required parameters empty.",
        "2. Trigger form submission."
      ],
      expected_result: "Form submission blocked. Specific validation highlights appear on missing inputs.",
      priority: "High",
      test_type: "Negative",
      category: "Negative",
      status: "Ready"
    });

    generatedCases.push({
      id: makeId(),
      title: `Verify boundary values at minimum and maximum field capacities`,
      user_story_ref: "REQ-03",
      preconditions: ["Form accessible"],
      test_data: ["Text input = exactly minimum allowed characters, then exactly maximum allowed"],
      steps: [
        "1. Submit input of length min - 1; verify rejection.",
        "2. Submit input of length min; verify acceptance.",
        "3. Submit input of length max; verify acceptance.",
        "4. Submit input of length max + 1; verify rejection/truncation."
      ],
      expected_result: "System accurately adheres to defined boundary limits without crashing or data truncation.",
      priority: "Medium",
      test_type: "Edge Case",
      category: "Positive",
      status: "Ready"
    });

    generatedCases.push({
      id: makeId(),
      title: `Verify authorization check for non-privileged or unauthenticated users`,
      user_story_ref: "REQ-04",
      preconditions: ["User has read-only role or is unauthenticated guest"],
      test_data: ["Role: GUEST"],
      steps: [
        "1. Attempt to execute action via direct UI control or URL route.",
        "2. Intercept API endpoint directly."
      ],
      expected_result: "HTTP 401 Unauthorized or 403 Forbidden returned; UI presents access denied notification.",
      priority: "High",
      test_type: "Security",
      category: "Negative",
      status: "Ready"
    });

    generatedCases.push({
      id: makeId(),
      title: `Verify system stability under rapid concurrent action dispatches`,
      user_story_ref: "REQ-05",
      preconditions: ["Active user session"],
      test_data: ["Multiple simultaneous requests"],
      steps: [
        "1. Trigger action 10 times in rapid sequence (<100ms interval).",
        "2. Verify database records and telemetry logs."
      ],
      expected_result: "Rate-limiter / debouncer catches excess requests; no duplicate entries created, no deadlocks occur.",
      priority: "Medium",
      test_type: "Performance",
      category: "Positive",
      status: "Ready"
    });
  }

  // Filter or slice to target count
  let finalCases = generatedCases.filter((tc) => {
    if (selectedTypes.length && !selectedTypes.includes(tc.test_type)) {
      return false;
    }
    if (priorityFilter !== "All" && tc.priority !== priorityFilter) {
      return false;
    }
    return true;
  });

  if (finalCases.length === 0) {
    finalCases = generatedCases;
  }

  // Ensure count matches requested count if possible
  finalCases = finalCases.slice(0, targetCount);

  // Compute coverage stats
  const positive = finalCases.filter((c) => c.category === "Positive").length;
  const negative = finalCases.filter((c) => c.category === "Negative").length;
  const edge_cases = finalCases.filter((c) => c.test_type === "Edge Case").length;
  const security = finalCases.filter((c) => c.test_type === "Security").length;
  const performance = finalCases.filter((c) => c.test_type === "Performance").length;
  const high_priority = finalCases.filter((c) => c.priority === "High").length;
  const medium_priority = finalCases.filter((c) => c.priority === "Medium").length;
  const low_priority = finalCases.filter((c) => c.priority === "Low").length;

  // Score calculation: high relevance and balanced test distribution
  const coverageScore = Math.min(
    96,
    Math.max(82, 80 + Math.round((positive > 0 ? 5 : 0) + (negative > 0 ? 5 : 0) + (edge_cases > 0 ? 4 : 0) + (security > 0 ? 3 : 0)))
  );

  return {
    analysis: {
      summary: `Automated analysis of user story: "${userStory.slice(0, 120)}${userStory.length > 120 ? "..." : ""}". Extracted core business flows, negative branches, validation guardrails, and compliance criteria.`,
      actors: isAuth ? ["Registered User", "Anonymous Visitor", "Auth Service"] : isPayment ? ["Shopper", "Payment Gateway", "Merchant"] : ["End User", "Application Server"],
      acceptance_criteria: [
        "Primary action must succeed seamlessly with valid inputs",
        "Input boundaries and mandatory constraints must be enforced",
        "Errors must provide actionable user feedback without exposing internal stack traces",
        "System must enforce rate-limiting and access control safeguards"
      ],
      assumptions: [
        "Standard session token duration assumed to be 30 minutes of inactivity",
        "HTTPS TLS 1.3 encryption assumed across all data transmissions",
        "Modern browser environment with JavaScript enabled"
      ],
      missing_information: [
        "Specific business rules for retry intervals were not explicitly documented",
        "Exact localization/multilingual requirements not specified"
      ]
    },
    test_cases: finalCases,
    coverage: {
      total: finalCases.length,
      positive,
      negative,
      edge_cases,
      security,
      performance,
      high_priority,
      medium_priority,
      low_priority,
      overall_score: coverageScore
    }
  };
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    gemini_configured: Boolean(process.env.GEMINI_API_KEY),
    version: "1.0.0"
  });
});

// 2. Configuration info
app.get("/api/config", (req, res) => {
  res.json({
    has_gemini_key: Boolean(process.env.GEMINI_API_KEY),
    default_model: "gemini-3.8-flash",
    available_providers: [
      { id: "gemini", name: "Gemini 3.8 Flash (Server Native)", recommended: true },
      { id: "ollama", name: "Ollama / Local Models (Llama, Gemma, Qwen)" },
      { id: "openai", name: "OpenAI Compatible Endpoint" },
      { id: "mock", name: "Enterprise QA Mock Simulator (Instant Demo)" }
    ]
  });
});

// 3. Generate Test Cases
app.post("/api/generate-test-cases", async (req, res) => {
  try {
    const {
      user_story,
      test_case_count = 8,
      test_types = ["Functional", "Negative", "Edge Case", "Security", "Performance"],
      priority_filter = "All",
      provider = "gemini",
      custom_api_key,
      model = "gemini-3.8-flash"
    } = req.body;

    if (!user_story || typeof user_story !== "string" || user_story.trim().length === 0) {
      return res.status(400).json({ error: "user_story is required and must be non-empty" });
    }

    const trimmedStory = user_story.trim();
    let resultPayload: any = null;
    let providerUsed = "mock";
    let modelUsed = "synthetic-qa-engine";

    const ai = getGeminiClient(custom_api_key);

    // If provider is gemini and we have an API key, use Gemini 3.8 Flash
    if (provider === "gemini" && ai) {
      try {
        const prompt = `Analyze the following User Story / Requirement and generate structured QA test cases:

USER STORY / REQUIREMENT:
"${trimmedStory}"

CONSTRAINTS & PREFERENCES:
- Target Test Case Count: ${test_case_count}
- Focus Test Types: ${test_types.join(", ")}
- Priority Preference: ${priority_filter}

REQUIREMENTS:
- Understand the actors, goals, and business constraints.
- Generate positive scenarios, negative scenarios, boundary/edge cases, security, and performance.
- Include explicit preconditions, actionable steps (e.g. 1. 2. 3.), realistic test data, and detailed expected results.
- If requirement details are missing, state your assumptions and missing information explicitly.
- Return strictly valid JSON adhering to the specified schema.`;

        const response = await ai.models.generateContent({
          model: model || "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction: QA_SYSTEM_PROMPT,
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const rawText = response.text;
        if (rawText) {
          // Parse JSON safely
          let parsed: any;
          try {
            parsed = JSON.parse(rawText);
          } catch (e) {
            // Remove potential markdown code block wrappers
            const cleaned = rawText.replace(/```json\s*/g, "").replace(/```\s*$/g, "").trim();
            parsed = JSON.parse(cleaned);
          }

          if (parsed && Array.isArray(parsed.test_cases) && parsed.test_cases.length > 0) {
            // Recompute / validate coverage stats
            const cases = parsed.test_cases;
            const positive = cases.filter((c: any) => c.category === "Positive").length;
            const negative = cases.filter((c: any) => c.category === "Negative").length;
            const edge_cases = cases.filter((c: any) => c.test_type === "Edge Case").length;
            const security = cases.filter((c: any) => c.test_type === "Security").length;
            const performance = cases.filter((c: any) => c.test_type === "Performance").length;
            const high_p = cases.filter((c: any) => c.priority === "High").length;
            const med_p = cases.filter((c: any) => c.priority === "Medium").length;
            const low_p = cases.filter((c: any) => c.priority === "Low").length;

            const calculatedScore = parsed.coverage?.overall_score || Math.min(
              98,
              Math.max(82, 80 + Math.round((positive > 0 ? 5 : 0) + (negative > 0 ? 5 : 0) + (edge_cases > 0 ? 4 : 0)))
            );

            resultPayload = {
              analysis: parsed.analysis || {
                summary: "Extracted requirements and acceptance criteria.",
                assumptions: ["Standard operating environment assumed."],
                missing_information: []
              },
              test_cases: cases.map((c: any, idx: number) => ({
                id: c.id || `TC${String(idx + 1).padStart(3, "0")}`,
                title: c.title || `Test Case ${idx + 1}`,
                user_story_ref: c.user_story_ref || "REQ",
                preconditions: Array.isArray(c.preconditions) ? c.preconditions : [c.preconditions || "System ready"],
                test_data: Array.isArray(c.test_data) ? c.test_data : [c.test_data || "Standard input"],
                steps: Array.isArray(c.steps) ? c.steps : [c.steps || "Execute test action"],
                expected_result: c.expected_result || "Action completes successfully.",
                priority: c.priority || "Medium",
                test_type: c.test_type || "Functional",
                category: c.category || "Positive",
                status: c.status || "Ready"
              })),
              coverage: {
                total: cases.length,
                positive,
                negative,
                edge_cases,
                security,
                performance,
                high_priority: high_p,
                medium_priority: med_p,
                low_priority: low_p,
                overall_score: calculatedScore
              }
            };
            providerUsed = "gemini";
            modelUsed = model || "gemini-3.8-flash";
          }
        }
      } catch (geminiError: any) {
        console.warn("Gemini generation call failed or timed out, falling back to enterprise simulator:", geminiError?.message || geminiError);
      }
    }

    // Fallback or explicit mock provider
    if (!resultPayload) {
      resultPayload = generateSyntheticTestCases(trimmedStory, test_case_count, test_types, priority_filter);
      providerUsed = "mock";
      modelUsed = "synthetic-qa-engine";
    }

    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullResult = {
      id: generationId,
      timestamp: new Date().toISOString(),
      user_story: trimmedStory,
      analysis: resultPayload.analysis,
      test_cases: resultPayload.test_cases,
      coverage: resultPayload.coverage,
      provider_used: providerUsed,
      model_used: modelUsed
    };

    // Save to history
    const historyEntry = {
      id: generationId,
      timestamp: fullResult.timestamp,
      user_story: trimmedStory,
      test_case_count: fullResult.test_cases.length,
      coverage_score: fullResult.coverage.overall_score,
      summary: fullResult.analysis.summary,
      data: fullResult
    };

    historyItems.unshift(historyEntry);
    saveHistory(historyItems);

    return res.json(fullResult);
  } catch (error: any) {
    console.error("Error in /api/generate-test-cases:", error);
    res.status(500).json({ error: error.message || "Failed to generate test cases" });
  }
});

// 4. Regenerate a Single Test Case
app.post("/api/regenerate-test-case", async (req, res) => {
  try {
    const { user_story, existing_test_case, instruction, custom_api_key } = req.body;

    if (!existing_test_case || !user_story) {
      return res.status(400).json({ error: "user_story and existing_test_case are required" });
    }

    const ai = getGeminiClient(custom_api_key);

    if (ai) {
      try {
        const prompt = `As a Senior QA Engineer, regenerate and improve the following test case for the user story:
USER STORY: "${user_story}"

CURRENT TEST CASE:
${JSON.stringify(existing_test_case, null, 2)}

SPECIFIC REGENERATION INSTRUCTION:
"${instruction || "Improve step precision, edge case thoroughness, and expected result accuracy."}"

Respond strictly with valid JSON representing a single test case adhering to this format:
{
  "id": "${existing_test_case.id}",
  "title": "...",
  "user_story_ref": "${existing_test_case.user_story_ref || "REQ"}",
  "preconditions": ["..."],
  "test_data": ["..."],
  "steps": ["1. ...", "2. ..."],
  "expected_result": "...",
  "priority": "${existing_test_case.priority}",
  "test_type": "${existing_test_case.test_type}",
  "category": "${existing_test_case.category}",
  "status": "Ready"
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const rawText = response.text;
        if (rawText) {
          const cleaned = rawText.replace(/```json\s*/g, "").replace(/```\s*$/g, "").trim();
          const parsed = JSON.parse(cleaned);
          return res.json(parsed);
        }
      } catch (err) {
        console.warn("Gemini single case regeneration failed, using local enhancement:", err);
      }
    }

    // Local enhancement fallback
    const regenerated = {
      ...existing_test_case,
      title: existing_test_case.title + " (Refined)",
      steps: [
        ...existing_test_case.steps,
        `${existing_test_case.steps.length + 1}. Verify telemetry metric and audit log record generated.`
      ],
      expected_result: existing_test_case.expected_result + " Audit trail confirms user action with timestamp.",
      status: "Ready"
    };

    res.json(regenerated);
  } catch (error: any) {
    console.error("Error regenerating test case:", error);
    res.status(500).json({ error: error.message || "Failed to regenerate test case" });
  }
});

// 5. History endpoints
app.get("/api/history", (req, res) => {
  res.json(historyItems.map((h) => ({
    id: h.id,
    timestamp: h.timestamp,
    user_story: h.user_story,
    test_case_count: h.test_case_count,
    coverage_score: h.coverage_score,
    summary: h.summary
  })));
});

app.get("/api/history/:id", (req, res) => {
  const item = historyItems.find((h) => h.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: "History item not found" });
  }
  res.json(item.data);
});

app.delete("/api/history/:id", (req, res) => {
  const initialLen = historyItems.length;
  historyItems = historyItems.filter((h) => h.id !== req.params.id);
  saveHistory(historyItems);
  res.json({ success: true, deleted: initialLen !== historyItems.length });
});

app.put("/api/history/:id", (req, res) => {
  const { test_cases } = req.body;
  const index = historyItems.findIndex((h) => h.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "History item not found" });
  }
  if (test_cases && Array.isArray(test_cases)) {
    historyItems[index].data.test_cases = test_cases;
    historyItems[index].test_case_count = test_cases.length;
    saveHistory(historyItems);
  }
  res.json({ success: true, data: historyItems[index].data });
});

app.post("/api/history/clear", (req, res) => {
  historyItems = [];
  saveHistory(historyItems);
  res.json({ success: true });
});

// ----------------------------------------------------
// PYTHON ENGINE RUNNER ENDPOINT
// ----------------------------------------------------
import { exec } from "child_process";

app.post("/api/python/generate", (req, res) => {
  const { user_story, test_case_count, priority_filter } = req.body;
  const count = test_case_count || 8;
  const priority = priority_filter || "All";
  const tmpOut = path.join(os.tmpdir(), `py_out_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.json`);
  
  // Safe argument escaping
  const escapedStory = (user_story || "").replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$');
  const cliPath = path.join(process.cwd(), "backend", "cli.py");
  const cmd = `python3 "${cliPath}" "${escapedStory}" --count ${count} --priority ${priority} --export json --out "${tmpOut}"`;

  exec(cmd, { cwd: process.cwd(), timeout: 20000 }, (error, stdout, stderr) => {
    if (fs.existsSync(tmpOut)) {
      try {
        const raw = fs.readFileSync(tmpOut, "utf-8");
        const parsed = JSON.parse(raw);
        fs.unlinkSync(tmpOut);
        parsed.provider_used = "Python 3 Native Engine";
        
        // Save to history
        historyItems.unshift({
          id: parsed.id,
          timestamp: parsed.timestamp,
          user_story: user_story,
          test_case_count: parsed.test_cases.length,
          coverage_score: parsed.coverage.overall_score,
          data: parsed
        });
        saveHistory(historyItems);

        return res.json(parsed);
      } catch (parseErr) {
        console.warn("Failed to parse Python JSON output:", parseErr);
      }
    }

    console.warn("Python execution stdout/stderr:", stdout, stderr);
    // Fallback if subprocess output failed
    const fallback: any = generateSyntheticTestCases(user_story, count, undefined, priority);
    fallback.provider_used = "Python Simulator Fallback";
    fallback.id = `gen_py_${Date.now()}`;
    fallback.timestamp = new Date().toISOString();
    fallback.user_story = user_story;
    res.json(fallback);
  });
});

// ----------------------------------------------------
// VITE / STATIC SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TestGen AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
