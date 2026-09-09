import React, { useState } from 'react';
import { X, BookOpen, Terminal, CheckCircle, ShieldCheck, Code, Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../utils/exportUtils';

interface PromptDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromptDocsModal: React.FC<PromptDocsModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (text: string, section: string) => {
    await copyToClipboard(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const systemPromptText = `You are a Senior Principal QA Automation & Manual Test Architect with 15+ years of experience in enterprise software quality engineering.
Your task is to thoroughly analyze natural language User Stories and software requirements and generate complete, highly structured, actionable, and rigorous test cases.

Key responsibilities:
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
   - If the user story is ambiguous or missing key specifications, explicitly call out these assumptions and missing requirements in the analysis section.
4. ACTIONABLE & RIGOROUS TEST SPECIFICATIONS:
   - Every step MUST be executable and specific (e.g., "1. Navigate to /login. 2. Enter email 'test@company.com'...").
   - Expected results MUST describe exact system feedback, state changes, and UI/API behavior.
   - Test data must be realistic and concrete.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">QA Prompt Engineering & System Architecture</h3>
              <p className="text-xs text-slate-400">Enterprise AI Quality Assurance Specification Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300 leading-relaxed">
          
          {/* Solution Alignment Card */}
          <div className="bg-indigo-950/40 border border-indigo-800/60 rounded-xl p-4">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm mb-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              IT Quality Assurance Problem Statement Alignment
            </div>
            <p className="text-indigo-200 mb-2">
              Automates the conversion of unstructured user stories into actionable test scenarios with &gt;80% target relevance and coverage scores. Evaluates happy path, negative, boundary/edge, security, and performance dimensions with explicit assumption tracking.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-medium text-indigo-300 pt-2 border-t border-indigo-900/60">
              <div>✓ 80%+ Relevance Score</div>
              <div>✓ Actionable Steps</div>
              <div>✓ Stated Assumptions</div>
              <div>✓ Python & TypeScript Engines</div>
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white text-sm flex items-center gap-1.5">
                <Code className="w-4 h-4 text-indigo-400" /> Senior QA System Prompt Template
              </span>
              <button
                onClick={() => handleCopy(systemPromptText, 'prompt')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
              >
                {copiedSection === 'prompt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'prompt' ? 'Copied' : 'Copy Prompt'}
              </button>
            </div>
            <div className="bg-slate-950 border border-slate-800 text-slate-300 p-4 rounded-xl font-mono text-[11px] leading-normal overflow-x-auto whitespace-pre-wrap max-h-56">
              {systemPromptText}
            </div>
          </div>

          {/* Local Ollama & Python Setup */}
          <div>
            <span className="font-bold text-white text-sm flex items-center gap-1.5 mb-2">
              <Terminal className="w-4 h-4 text-emerald-400" /> Local Execution with Python & Ollama
            </span>
            <div className="bg-slate-950 border border-slate-800 text-slate-300 p-4 rounded-xl font-mono text-[11px] space-y-2">
              <div className="text-slate-500"># 1. Run the standalone Python Dark Mode server (Zero external dependencies):</div>
              <div className="text-emerald-400">python3 backend/app.py --port 8000</div>
              <div className="text-slate-500"># 2. Run test case generation directly in Python terminal CLI:</div>
              <div className="text-emerald-400">python3 backend/cli.py --story "As a user I want to reset password" --count 5 --export tests.csv</div>
              <div className="text-slate-500"># 3. Pull local model with Ollama (optional):</div>
              <div className="text-indigo-400">ollama pull llama3</div>
              <div className="text-slate-500"># 4. Standard full-stack hybrid dev server:</div>
              <div className="text-emerald-400">npm run dev</div>
            </div>
          </div>

          {/* Output Schema */}
          <div>
            <span className="font-bold text-white text-sm block mb-2">Standardized Test Case Schema</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="font-bold text-slate-200 block">ID & Title</span>
                <span className="text-[11px] text-slate-400">Unique identifier (TC001) & clear intent</span>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="font-bold text-slate-200 block">Preconditions</span>
                <span className="text-[11px] text-slate-400">Required state, accounts, and session data</span>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="font-bold text-slate-200 block">Execution Steps</span>
                <span className="text-[11px] text-slate-400">Numbered, actionable clicks & inputs</span>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="font-bold text-slate-200 block">Expected Result</span>
                <span className="text-[11px] text-slate-400">Precise feedback & DB/UI state</span>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="font-bold text-slate-200 block">Priority & Type</span>
                <span className="text-[11px] text-slate-400">P1-P3, Functional, Negative, Edge, Security</span>
              </div>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                <span className="font-bold text-slate-200 block">Category & Status</span>
                <span className="text-[11px] text-slate-400">Positive vs Negative; Draft/Ready/Passed</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Close Documentation
          </button>
        </div>

      </div>
    </div>
  );
};
