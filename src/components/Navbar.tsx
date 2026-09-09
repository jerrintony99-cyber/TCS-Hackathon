import React from 'react';
import { 
  ShieldCheck, 
  History, 
  BookOpen, 
  Sparkles, 
  FileCheck,
  RefreshCw,
  Cpu,
  Moon,
  Terminal
} from 'lucide-react';

interface NavbarProps {
  onOpenHistory: () => void;
  onOpenDocs: () => void;
  onOpenPython: () => void;
  onReset: () => void;
  historyCount: number;
  providerStatus: {
    hasKey: boolean;
    provider: string;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHistory,
  onOpenDocs,
  onOpenPython,
  onReset,
  historyCount,
  providerStatus
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-white shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Description */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onReset} id="brand-logo-button">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">TestGen AI</span>
              <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full font-medium border border-indigo-500/30">
                Enterprise QA
              </span>
              <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-medium border border-slate-700 flex items-center gap-1">
                <Moon className="w-2.5 h-2.5 text-indigo-400" />
                Dark Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Intelligent User Story to Structured Test Case Generator
            </p>
          </div>
        </div>

        {/* Status Pill & Navigation Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* AI Engine Status */}
          <div 
            id="engine-status-pill"
            className="hidden lg:flex items-center space-x-2 text-xs px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300"
            title={providerStatus.hasKey ? "Connected to Gemini 3.8 Flash Engine" : "Running on Enterprise Synthetic QA Engine"}
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              {providerStatus.hasKey ? "Gemini 3.8 Flash" : "Enterprise QA Simulator"}
            </span>
            <span className={`w-2 h-2 rounded-full ${providerStatus.hasKey ? "bg-emerald-400 animate-pulse" : "bg-indigo-400"}`} />
          </div>

          {/* Python Edition Button */}
          <button
            id="open-python-btn"
            onClick={onOpenPython}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/50 transition-colors shadow-sm"
            title="View or execute the pure Python web server and CLI"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Python Edition 🐍</span>
          </button>

          {/* Prompt Architecture & TCS Spec Docs Button */}
          <button
            id="open-docs-btn"
            onClick={onOpenDocs}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Docs</span>
          </button>

          {/* History Drawer Trigger */}
          <button
            id="open-history-btn"
            onClick={onOpenHistory}
            className="relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {historyCount}
              </span>
            )}
          </button>

          {/* New Story Reset Button */}
          <button
            id="new-story-btn"
            onClick={onReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Story</span>
          </button>

        </div>

      </div>
    </header>
  );
};
