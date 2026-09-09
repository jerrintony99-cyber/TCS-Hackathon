import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  HelpCircle, 
  BarChart3, 
  TrendingUp, 
  Layers, 
  FileQuestion,
  ChevronDown,
  ChevronUp,
  Cpu,
  Info
} from 'lucide-react';
import { Analysis, CoverageStats } from '../types';

interface CoverageMetricsBarProps {
  coverage: CoverageStats;
  analysis: Analysis;
}

export const CoverageMetricsBar: React.FC<CoverageMetricsBarProps> = ({
  coverage,
  analysis
}) => {
  const [showAssumptions, setShowAssumptions] = useState<boolean>(true);
  const [showMissing, setShowMissing] = useState<boolean>(true);

  const positivePercent = coverage.total > 0 ? Math.round((coverage.positive / coverage.total) * 100) : 0;
  const negativePercent = coverage.total > 0 ? Math.round((coverage.negative / coverage.total) * 100) : 0;
  const edgePercent = coverage.total > 0 ? Math.round((coverage.edge_cases / coverage.total) * 100) : 0;

  return (
    <div id="coverage-metrics-section" className="space-y-4 mb-6">
      
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Coverage / Relevance Score */}
        <div className="col-span-2 sm:col-span-3 lg:col-span-2 bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-xl p-4 border border-indigo-800/60 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">QA Relevance & Coverage</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              Target &gt;80% Pass
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">{coverage.overall_score}%</span>
            <span className="text-xs text-indigo-300">Relevance Index</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-indigo-900/60">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, coverage.overall_score)}%` }}
            />
          </div>
        </div>

        {/* Total Test Cases */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Cases</div>
          <div className="text-2xl font-bold text-white mt-1">{coverage.total}</div>
          <div className="text-[11px] text-slate-500 mt-1">Generated suite</div>
        </div>

        {/* Positive / Happy Path */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            <span>Positive</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{coverage.positive}</div>
          <div className="text-[11px] text-slate-500 mt-1">{positivePercent}% of suite</div>
        </div>

        {/* Negative Cases */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
            <span>Negative</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{coverage.negative}</div>
          <div className="text-[11px] text-slate-500 mt-1">{negativePercent}% of suite</div>
        </div>

        {/* Edge / Boundary Cases */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
            <span>Edge & Bounds</span>
            <Layers className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400 mt-1">{coverage.edge_cases}</div>
          <div className="text-[11px] text-slate-500 mt-1">{edgePercent}% boundary</div>
        </div>

      </div>

      {/* Requirement Analysis & Stated Assumptions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Stated Assumptions */}
        {analysis.assumptions && analysis.assumptions.length > 0 && (
          <div className="bg-indigo-950/30 border border-indigo-900/60 rounded-xl p-4 text-xs text-indigo-200 shadow-sm">
            <div 
              className="flex items-center justify-between cursor-pointer font-bold mb-2 text-indigo-300"
              onClick={() => setShowAssumptions(!showAssumptions)}
            >
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-indigo-400" />
                Stated QA Assumptions ({analysis.assumptions.length})
              </span>
              {showAssumptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            {showAssumptions && (
              <ul className="space-y-1 pl-4 list-disc text-slate-300 leading-relaxed">
                {analysis.assumptions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Missing Information / Ambiguities */}
        {analysis.missing_information && analysis.missing_information.length > 0 && (
          <div className="bg-amber-950/30 border border-amber-900/60 rounded-xl p-4 text-xs text-amber-200 shadow-sm">
            <div 
              className="flex items-center justify-between cursor-pointer font-bold mb-2 text-amber-300"
              onClick={() => setShowMissing(!showMissing)}
            >
              <span className="flex items-center gap-1.5">
                <FileQuestion className="w-4 h-4 text-amber-400" />
                Missing Information & Clarifications Needed ({analysis.missing_information.length})
              </span>
              {showMissing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            {showMissing && (
              <ul className="space-y-1 pl-4 list-disc text-slate-300 leading-relaxed">
                {analysis.missing_information.map((item, idx) => (
                  <li key={idx}>
                    <span className="font-semibold text-amber-300">Notice:</span> {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
