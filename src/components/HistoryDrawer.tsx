import React from 'react';
import { X, History, Trash2, ArrowRight, Calendar, Sparkles, CheckCircle } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  historyItems: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  historyItems,
  onSelectHistory,
  onDeleteHistory,
  onClearAll
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 text-slate-100 h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">Generation History</h3>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold px-2 py-0.5 rounded-full">
              {historyItems.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {historyItems.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <History className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
              <p className="font-semibold text-slate-300">No test generations yet</p>
              <p className="text-xs mt-1 text-slate-500">Submit a user story to see your past QA test suites here.</p>
            </div>
          ) : (
            historyItems.map((item) => (
              <div
                key={item.id}
                className="border border-slate-800 hover:border-indigo-500/50 rounded-xl p-3.5 bg-slate-950 hover:bg-indigo-950/20 transition-all group"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                  <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                    {item.coverage_score || 90}% Coverage
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-snug mb-2">
                  {item.user_story}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-400 font-medium">
                    {item.test_case_count} Test Cases
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDeleteHistory(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded"
                      title="Delete from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        onSelectHistory(item);
                        onClose();
                      }}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium flex items-center gap-1 shadow-md shadow-indigo-600/20 transition-colors"
                    >
                      <span>Load Suite</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {historyItems.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
            <span className="text-xs text-slate-500">Stored locally in session</span>
            <button
              onClick={onClearAll}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All History
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
