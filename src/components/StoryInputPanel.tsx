import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Sliders, 
  Play, 
  Lightbulb, 
  CheckSquare, 
  Square, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Layers, 
  HelpCircle, 
  FileText,
  Terminal
} from 'lucide-react';
import { PriorityLevel, TestType } from '../types';
import { SAMPLE_USER_STORIES } from '../data/sampleStories';

interface StoryInputPanelProps {
  userStory: string;
  onChangeUserStory: (val: string) => void;
  onGenerate: (options: {
    testCaseCount: number;
    testTypes: TestType[];
    priority: 'All' | PriorityLevel;
    provider: 'gemini' | 'ollama' | 'openai' | 'mock' | 'python';
  }) => void;
  isGenerating: boolean;
  generationStep?: string;
  hasGeminiKey: boolean;
}

const ALL_TEST_TYPES: TestType[] = [
  'Functional',
  'Negative',
  'Edge Case',
  'Security',
  'Performance'
];

export const StoryInputPanel: React.FC<StoryInputPanelProps> = ({
  userStory,
  onChangeUserStory,
  onGenerate,
  isGenerating,
  generationStep,
  hasGeminiKey
}) => {
  const [testCaseCount, setTestCaseCount] = useState<number>(8);
  const [selectedTypes, setSelectedTypes] = useState<TestType[]>([
    'Functional',
    'Negative',
    'Edge Case',
    'Security',
    'Performance'
  ]);
  const [priorityFilter, setPriorityFilter] = useState<'All' | PriorityLevel>('All');
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'ollama' | 'openai' | 'mock' | 'python'>(
    'python'
  );
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const toggleTestType = (type: TestType) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter((t) => t !== type));
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const handleSelectExample = (storyText: string) => {
    onChangeUserStory(storyText);
  };

  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userStory.trim() || isGenerating) return;
    onGenerate({
      testCaseCount,
      testTypes: selectedTypes,
      priority: priorityFilter,
      provider: selectedProvider
    });
  };

  const handleDemoGenerate = () => {
    const demo = SAMPLE_USER_STORIES[0];
    onChangeUserStory(demo.story);
    onGenerate({
      testCaseCount: 8,
      testTypes: ALL_TEST_TYPES,
      priority: 'All',
      provider: selectedProvider
    });
  };

  return (
    <div id="story-input-panel" className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-5 sm:p-6 mb-6 text-slate-100">
      
      {/* Top Banner / Explanation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            Natural-Language Requirement Input
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Describe your feature requirement or user story. The AI QA agent will parse actors, acceptance criteria, negative branches, and edge boundaries.
          </p>
        </div>

        {/* Quick Demo Button */}
        <button
          id="btn-quick-demo"
          type="button"
          onClick={handleDemoGenerate}
          disabled={isGenerating}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/60 rounded-lg transition-colors shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-indigo-300" />
          Load Demo Scenarios
        </button>
      </div>

      {/* Example Story Chips */}
      <div className="mb-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Click an Example User Story to Try:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_USER_STORIES.map((sample) => (
            <button
              key={sample.id}
              id={`sample-${sample.id}`}
              type="button"
              onClick={() => handleSelectExample(sample.story)}
              className="text-xs bg-slate-950 hover:bg-indigo-950 hover:text-indigo-300 text-slate-300 border border-slate-800 hover:border-indigo-700/70 rounded-lg px-2.5 py-1.5 transition-all flex items-center gap-1.5"
            >
              <span className="font-medium">{sample.title}</span>
              <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                {sample.category}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Textarea Input */}
      <form onSubmit={handleFormSubmit}>
        <div className="relative">
          <textarea
            id="user-story-textarea"
            rows={4}
            value={userStory}
            onChange={(e) => onChangeUserStory(e.target.value)}
            placeholder="e.g. As a registered user, I want to log into my account using my email and password so that I can access my personalized dashboard and order history."
            className="w-full text-slate-100 text-sm p-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500 resize-y leading-relaxed font-sans"
            disabled={isGenerating}
          />
          <div className="flex items-center justify-between text-xs text-slate-500 mt-1.5 px-1">
            <span>
              <strong>Tip:</strong> Formats like <em>"As a [user]... I want [goal]... So that [value]"</em> or detailed bulleted acceptance criteria work best.
            </span>
            <span>{userStory.length} characters</span>
          </div>
        </div>

        {/* Generation Settings Controls */}
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Number of Test Cases */}
            <div className="md:col-span-3">
              <label htmlFor="select-case-count" className="block text-xs font-semibold text-slate-400 mb-1">
                Target Test Cases:
              </label>
              <select
                id="select-case-count"
                value={testCaseCount}
                onChange={(e) => setTestCaseCount(Number(e.target.value))}
                disabled={isGenerating}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={5}>5 Test Cases (Core Scenarios)</option>
                <option value={8}>8 Test Cases (Balanced Suite)</option>
                <option value={10}>10 Test Cases (Thorough Coverage)</option>
                <option value={12}>12 Test Cases (Exhaustive QA)</option>
                <option value={15}>15 Test Cases (Enterprise Suite)</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="md:col-span-3">
              <label htmlFor="select-priority-focus" className="block text-xs font-semibold text-slate-400 mb-1">
                Priority Focus:
              </label>
              <select
                id="select-priority-focus"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                disabled={isGenerating}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-medium focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="All">All Priorities (P1 - P3)</option>
                <option value="High">High Priority Critical Only</option>
                <option value="Medium">Medium & High Priority</option>
                <option value="Low">Include Low Priority UI checks</option>
              </select>
            </div>

            {/* Test Types Multi-select Chips */}
            <div className="md:col-span-6">
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Included Test Dimensions:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_TEST_TYPES.map((type) => {
                  const isChecked = selectedTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleTestType(type)}
                      disabled={isGenerating}
                      className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors flex items-center gap-1.5 ${
                        isChecked
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-300'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-600" />
                      )}
                      <span>{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Advanced Provider Accordion */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>{showAdvanced ? 'Hide Advanced Engine Settings' : 'Advanced AI & Python Engine Settings'}</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Backend QA Inference Engine:</label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="python">Python Native Subprocess (backend/cli.py)</option>
                    <option value="gemini">Gemini 3.8 Flash (Server Native AI)</option>
                    <option value="mock">Enterprise Synthetic Simulator</option>
                    <option value="ollama">Ollama Local Model (Llama 3 / Gemma 2)</option>
                  </select>
                </div>
                <div className="text-slate-400 flex items-center leading-relaxed">
                  <p>
                    Runs Python 3 subprocess natively to synthesize tests with positive/negative branches and boundary validations.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-400">
              {isGenerating ? (
                <span className="flex items-center gap-2 text-indigo-400 font-medium animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  {generationStep || 'Analyzing user story and synthesizing test matrix...'}
                </span>
              ) : (
                <span>Converts natural language into structured, executable test cases with &gt;80% coverage.</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-generate-test-cases"
                type="submit"
                disabled={isGenerating || !userStory.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Test Cases</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
};
