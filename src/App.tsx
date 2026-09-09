import React, { useState, useEffect } from 'react';
import { 
  fetchHealth, 
  fetchConfig, 
  fetchHistory, 
  deleteHistoryItem, 
  clearAllHistory, 
  generateTestCases, 
  regenerateTestCase,
  updateHistoryTestCases
} from './services/api';
import { GenerationResult, HistoryItem, PriorityLevel, TestCase, TestType } from './types';
import { SAMPLE_USER_STORIES } from './data/sampleStories';
import { Navbar } from './components/Navbar';
import { StoryInputPanel } from './components/StoryInputPanel';
import { CoverageMetricsBar } from './components/CoverageMetricsBar';
import { TestCasesWorkspace } from './components/TestCasesWorkspace';
import { EditTestCaseModal } from './components/EditTestCaseModal';
import { RegenerateModal } from './components/RegenerateModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { PromptDocsModal } from './components/PromptDocsModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Sparkles, ShieldCheck, CheckCircle2, ArrowRight, Layers, FileText } from 'lucide-react';

export default function App() {
  // Main state
  const [userStory, setUserStory] = useState<string>(SAMPLE_USER_STORIES[0].story);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  
  // Modals & Drawers
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [regeneratingTestCase, setRegeneratingTestCase] = useState<TestCase | null>(null);
  const [isRegeneratingSingle, setIsRegeneratingSingle] = useState<boolean>(false);

  // History & Provider Info
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add toast helper
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const health = await fetchHealth();
        setHasGeminiKey(health.gemini_configured);

        const history = await fetchHistory();
        setHistoryItems(history);

        // If history exists, load the most recent generation by default for immediate preview
        if (history.length > 0 && history[0].data) {
          setGenerationResult(history[0].data);
          setUserStory(history[0].user_story);
        }
      } catch (err) {
        console.warn('Initialization check error:', err);
      }
    }
    init();
  }, []);

  // Handle generation flow with animated progress feedback
  const handleGenerate = async (options: {
    testCaseCount: number;
    testTypes: TestType[];
    priority: 'All' | PriorityLevel;
    provider: 'gemini' | 'ollama' | 'openai' | 'mock';
  }) => {
    if (!userStory.trim()) return;

    setIsGenerating(true);
    setGenerationStep('Deconstructing actors & business requirements...');

    const stepTimer1 = setTimeout(() => {
      setGenerationStep('Formulating happy path & boundary negative vectors...');
    }, 900);

    const stepTimer2 = setTimeout(() => {
      setGenerationStep('Synthesizing execution steps & concrete test data...');
    }, 1800);

    const stepTimer3 = setTimeout(() => {
      setGenerationStep('Calculating test coverage density & quality metrics...');
    }, 2700);

    try {
      const result = await generateTestCases({
        user_story: userStory,
        test_case_count: options.testCaseCount,
        test_types: options.testTypes,
        priority_filter: options.priority,
        provider: options.provider
      });

      setGenerationResult(result);
      addToast(`Generated ${result.test_cases.length} test cases with ${result.coverage.overall_score}% coverage!`, 'success');

      // Refresh history
      const updatedHistory = await fetchHistory();
      setHistoryItems(updatedHistory);
    } catch (err: any) {
      console.error('Generation error:', err);
      addToast(err.message || 'Failed to generate test cases. Please try again.', 'error');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Handle single test case update (from edit modal or workspace)
  const handleUpdateTestCases = (updatedCases: TestCase[]) => {
    if (!generationResult) return;

    // Recalculate stats
    const positive = updatedCases.filter((c) => c.category === 'Positive').length;
    const negative = updatedCases.filter((c) => c.category === 'Negative').length;
    const edge_cases = updatedCases.filter((c) => c.test_type === 'Edge Case').length;
    const security = updatedCases.filter((c) => c.test_type === 'Security').length;
    const performance = updatedCases.filter((c) => c.test_type === 'Performance').length;
    const high_priority = updatedCases.filter((c) => c.priority === 'High').length;
    const medium_priority = updatedCases.filter((c) => c.priority === 'Medium').length;
    const low_priority = updatedCases.filter((c) => c.priority === 'Low').length;

    const newResult: GenerationResult = {
      ...generationResult,
      test_cases: updatedCases,
      coverage: {
        ...generationResult.coverage,
        total: updatedCases.length,
        positive,
        negative,
        edge_cases,
        security,
        performance,
        high_priority,
        medium_priority,
        low_priority
      }
    };

    setGenerationResult(newResult);

    // Save to history storage
    if (newResult.id) {
      updateHistoryTestCases(newResult.id, updatedCases);
    }
  };

  // Handle single case save from edit modal
  const handleSaveEditedCase = (updatedCase: TestCase) => {
    if (!generationResult) return;
    const updatedCases = generationResult.test_cases.map((c) =>
      c.id === updatedCase.id ? updatedCase : c
    );
    handleUpdateTestCases(updatedCases);
    setEditingTestCase(null);
    addToast(`Saved changes to ${updatedCase.id}`, 'success');
  };

  // Handle single test case regeneration
  const handleConfirmRegenerate = async (instruction: string) => {
    if (!regeneratingTestCase || !generationResult) return;

    setIsRegeneratingSingle(true);
    try {
      const regenerated = await regenerateTestCase(
        generationResult.user_story,
        regeneratingTestCase,
        instruction
      );

      const updatedCases = generationResult.test_cases.map((c) =>
        c.id === regenerated.id ? regenerated : c
      );
      handleUpdateTestCases(updatedCases);
      addToast(`Regenerated ${regenerated.id} successfully!`, 'success');
      setRegeneratingTestCase(null);
    } catch (err: any) {
      addToast(err.message || 'Regeneration failed', 'error');
    } finally {
      setIsRegeneratingSingle(false);
    }
  };

  // Handle history item selection
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setGenerationResult(item.data);
    setUserStory(item.user_story);
    addToast(`Loaded test suite from ${new Date(item.timestamp).toLocaleDateString()}`, 'info');
  };

  // Handle history delete
  const handleDeleteHistory = async (id: string) => {
    await deleteHistoryItem(id);
    setHistoryItems((prev) => prev.filter((h) => h.id !== id));
    addToast('Deleted history item', 'info');
  };

  // Handle history clear all
  const handleClearAllHistory = async () => {
    await clearAllHistory();
    setHistoryItems([]);
    addToast('Cleared all history', 'info');
  };

  // Reset to new story
  const handleReset = () => {
    setUserStory('');
    setGenerationResult(null);
    addToast('Workspace ready for new user story', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Navigation */}
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenDocs={() => setIsDocsOpen(true)}
        onReset={handleReset}
        historyCount={historyItems.length}
        providerStatus={{
          hasKey: hasGeminiKey,
          provider: hasGeminiKey ? 'Gemini 3.8 Flash' : 'Synthetic QA Engine'
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Story Input & Settings Panel */}
        <StoryInputPanel
          userStory={userStory}
          onChangeUserStory={setUserStory}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          generationStep={generationStep}
          hasGeminiKey={hasGeminiKey}
        />

        {/* Results Area */}
        {generationResult ? (
          <div>
            {/* Coverage & Relevance Metrics */}
            <CoverageMetricsBar
              coverage={generationResult.coverage}
              analysis={generationResult.analysis}
            />

            {/* Interactive Test Cases Workspace */}
            <TestCasesWorkspace
              generationResult={generationResult}
              onUpdateTestCases={handleUpdateTestCases}
              onOpenEditModal={(tc) => setEditingTestCase(tc)}
              onOpenRegenerateModal={(tc) => setRegeneratingTestCase(tc)}
              onToast={addToast}
            />
          </div>
        ) : (
          /* Empty / Welcome State */
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Transform Requirements into Actionable QA Test Cases
            </h3>
            <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed mb-6">
              Enter any feature requirement or click one of the example scenarios above. The QA engine automatically generates positive flows, boundary checks, negative tests, and security validations.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Positive Scenarios
                </div>
                <div className="text-slate-500">Happy path validations with realistic test data and preconditions.</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  Boundary & Edge Cases
                </div>
                <div className="text-slate-500">Min/max thresholds, empty inputs, single characters, and timeouts.</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Security & Resiliency
                </div>
                <div className="text-slate-500">Injection resistance, authorization checks, and rate-limiting guardrails.</div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>TestGen AI</strong> • Enterprise Single-Agent QA Specification Platform
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>TCS Technology Day QA Solution</span>
            <span>•</span>
            <span>&gt;80% Relevance Target</span>
            <span>•</span>
            <span>Node.js / Python Ready</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {editingTestCase && (
        <EditTestCaseModal
          testCase={editingTestCase}
          onSave={handleSaveEditedCase}
          onClose={() => setEditingTestCase(null)}
        />
      )}

      {regeneratingTestCase && (
        <RegenerateModal
          testCase={regeneratingTestCase}
          onConfirm={handleConfirmRegenerate}
          onClose={() => setRegeneratingTestCase(null)}
          isRegenerating={isRegeneratingSingle}
        />
      )}

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyItems={historyItems}
        onSelectHistory={handleSelectHistoryItem}
        onDeleteHistory={handleDeleteHistory}
        onClearAll={handleClearAllHistory}
      />

      <PromptDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

    </div>
  );
}
