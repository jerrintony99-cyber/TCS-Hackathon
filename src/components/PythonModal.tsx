import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  Code, 
  FileCode, 
  Server, 
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { copyToClipboard } from '../utils/exportUtils';

interface PythonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunInApp: (userStory: string) => void;
}

export const PythonModal: React.FC<PythonModalProps> = ({ isOpen, onClose, onRunInApp }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'server' | 'cli'>('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isRunningPython, setIsRunningPython] = useState(false);
  const [pythonOutput, setPythonOutput] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (text: string, id: string) => {
    await copyToClipboard(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const runPythonTest = async () => {
    setIsRunningPython(true);
    setPythonOutput(null);
    try {
      const res = await fetch('/api/python/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_story: "As a banking customer, I want to transfer money between accounts so that I can manage my funds.",
          test_case_count: 5,
          priority_filter: "All"
        })
      });
      const data = await res.json();
      setPythonOutput(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setPythonOutput(`Execution Error: ${err.message}`);
    } finally {
      setIsRunningPython(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-mono font-bold">
              🐍
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">TestGen AI • Python Edition</h3>
                <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded font-mono border border-indigo-500/30">
                  Zero Pip Dependencies
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded font-medium border border-emerald-500/30">
                  Dark Mode
                </span>
              </div>
              <p className="text-xs text-slate-400">Pure Python 3 Standard Library Web Server & CLI Architecture</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 bg-slate-950/50 flex space-x-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Architecture & CLI Commands</span>
          </button>
          <button
            onClick={() => setActiveTab('server')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'server'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Standalone Web Server (backend/app.py)</span>
          </button>
          <button
            onClick={() => setActiveTab('cli')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'cli'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Dark CLI Script (backend/cli.py)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          
          {activeTab === 'overview' && (
            <div className="space-y-5">
              
              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                    <span className="text-base">🚀</span> Zero Pip Dependencies
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Built strictly on Python standard library modules (<code className="text-indigo-400">http.server</code>, <code className="text-indigo-400">urllib.request</code>, <code className="text-indigo-400">json</code>, <code className="text-indigo-400">csv</code>). Runs out of the box on Python 3.7+.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                    <span className="text-base">🌙</span> Native Dark Mode UI
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Serves a self-contained responsive Dark Mode web dashboard on port 8000 with interactive test execution tables, cards, and instant export.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                    <span className="text-base">🧠</span> Gemini 3.8 Flash + Synthesizer
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Connects directly to Gemini models using <code className="text-indigo-400">GEMINI_API_KEY</code> with a built-in enterprise test synthesizer ensuring &gt;80% coverage.
                  </p>
                </div>
              </div>

              {/* Commands Box */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    How to Run in Terminal or VS Code
                  </span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] space-y-2 text-slate-300">
                  <div className="text-slate-500"># 1. Run the Standalone Dark Mode Web Server (port 8000):</div>
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>python3 backend/app.py</span>
                    <button
                      onClick={() => handleCopy("python3 backend/app.py", "c1")}
                      className="text-slate-500 hover:text-white"
                    >
                      {copiedCode === "c1" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-slate-500 pt-2"># 2. Run the Dark Terminal CLI with interactive output:</div>
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>python3 backend/cli.py --demo</span>
                    <button
                      onClick={() => handleCopy("python3 backend/cli.py --demo", "c2")}
                      className="text-slate-500 hover:text-white"
                    >
                      {copiedCode === "c2" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-slate-500 pt-2"># 3. Generate test cases for your own custom user story & export to CSV:</div>
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>python3 backend/cli.py "As a user, I want..." --count 10 --export csv --out tests.csv</span>
                    <button
                      onClick={() => handleCopy('python3 backend/cli.py "As a user, I want..." --count 10 --export csv --out tests.csv', "c3")}
                      className="text-slate-500 hover:text-white"
                    >
                      {copiedCode === "c3" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Subprocess Runner */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-xs block">Live Python Subprocess Test</span>
                    <span className="text-[11px] text-slate-400">Executes backend/cli.py directly in the background container to generate test cases.</span>
                  </div>
                  <button
                    onClick={runPythonTest}
                    disabled={isRunningPython}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    {isRunningPython ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Running Python...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Execute Python Subprocess</span>
                      </>
                    )}
                  </button>
                </div>

                {pythonOutput && (
                  <div className="mt-3">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Python Output Received:</span>
                    <pre className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-[10px] text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                      {pythonOutput}
                    </pre>
                  </div>
                )}
              </div>

            </div>
          )}

          {activeTab === 'server' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">File: backend/app.py (Standalone Web Server)</span>
                <button
                  onClick={() => handleCopy("python3 backend/app.py", "srv")}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Execution Command
                </button>
              </div>
              <p className="text-slate-400 text-[11px]">
                Features embedded Dark Mode HTML dashboard at root URL, REST endpoints (<code className="text-indigo-400">/api/generate-test-cases</code>, <code className="text-indigo-400">/api/health</code>), and standard library HTTP server.
              </p>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-slate-300 max-h-80 overflow-y-auto">
                <pre>{`# Key components in backend/app.py:
- http.server.BaseHTTPRequestHandler implementation
- Endpoints:
  GET  /                     -> Serves Dark Mode Web Dashboard
  GET  /api/health           -> Server status & Gemini key check
  POST /api/generate-test-cases -> Runs QA synthesis with >80% coverage
  POST /api/regenerate-test-case -> Refines individual test case
  GET  /api/history          -> Retrieves previous generation runs
- Zero external package installation required`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'cli' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">File: backend/cli.py (Dark Mode Terminal CLI)</span>
                <button
                  onClick={() => handleCopy("python3 backend/cli.py --demo", "cli")}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Demo Command
                </button>
              </div>
              <p className="text-slate-400 text-[11px]">
                Accepts user stories from CLI arguments, formats outputs with ANSI dark mode colors, prints stated assumptions & missing criteria, and exports to CSV/JSON.
              </p>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-slate-300 max-h-80 overflow-y-auto">
                <pre>{`# CLI Syntax:
python3 backend/cli.py [STORY] [--count N] [--priority PRIORITY] [--export {csv,json}] [--out FILE]

# Example:
python3 backend/cli.py "As a registered shopper, I want to pay with Apple Pay..." --count 8 --export csv --out apple_pay_tests.csv`}</pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-slate-500 text-xs">Python 3.10 Compatible • Standard Library Architecture</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
