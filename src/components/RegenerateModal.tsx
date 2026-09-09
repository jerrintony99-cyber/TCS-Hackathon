import React, { useState } from 'react';
import { X, RefreshCw, Sparkles, MessageSquare } from 'lucide-react';
import { TestCase } from '../types';

interface RegenerateModalProps {
  testCase: TestCase;
  onConfirm: (instruction: string) => void;
  onClose: () => void;
  isRegenerating: boolean;
}

export const RegenerateModal: React.FC<RegenerateModalProps> = ({
  testCase,
  onConfirm,
  onClose,
  isRegenerating
}) => {
  const [instruction, setInstruction] = useState<string>('');

  const quickInstructions = [
    'Make steps more granular and test data specific',
    'Focus on boundary limits and negative edge conditions',
    'Add SQL injection / XSS security verification',
    'Simulate slow network latency / timeout scenario',
    'Test with mobile viewport and touch inputs'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(instruction);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              Regenerate Test Case ({testCase.id})
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isRegenerating}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <div className="font-semibold text-slate-200 mb-1">{testCase.title}</div>
            <div className="text-slate-400 line-clamp-2">{testCase.expected_result}</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              Optional Refinement Prompt for AI QA Agent:
            </label>
            <textarea
              rows={3}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Focus on edge cases with empty strings, or verify audit trail logging..."
              className="w-full text-xs p-3 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 focus:outline-none focus:border-indigo-500"
              disabled={isRegenerating}
            />
          </div>

          {/* Quick chip suggestions */}
          <div>
            <span className="text-[11px] font-medium text-slate-400 block mb-1.5">Or select a quick refinement goal:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickInstructions.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInstruction(chip)}
                  className="text-[11px] bg-slate-950 hover:bg-indigo-950/40 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-800/60 rounded-md px-2 py-1 transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isRegenerating}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRegenerating}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-colors cursor-pointer"
            >
              {isRegenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Regenerating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Regenerate with AI</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
