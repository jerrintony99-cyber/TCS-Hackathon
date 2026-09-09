import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Edit3 } from 'lucide-react';
import { PriorityLevel, TestCase, TestCaseStatus, TestCategory, TestType } from '../types';

interface EditTestCaseModalProps {
  testCase: TestCase;
  onSave: (updated: TestCase) => void;
  onClose: () => void;
}

export const EditTestCaseModal: React.FC<EditTestCaseModalProps> = ({
  testCase,
  onSave,
  onClose
}) => {
  const [title, setTitle] = useState(testCase.title);
  const [priority, setPriority] = useState<PriorityLevel>(testCase.priority);
  const [testType, setTestType] = useState<TestType>(testCase.test_type);
  const [category, setCategory] = useState<TestCategory>(testCase.category);
  const [status, setStatus] = useState<TestCaseStatus>(testCase.status);
  const [expectedResult, setExpectedResult] = useState(testCase.expected_result);
  
  // Array states
  const [preconditions, setPreconditions] = useState<string[]>(
    testCase.preconditions && testCase.preconditions.length > 0 ? [...testCase.preconditions] : ['']
  );
  const [testData, setTestData] = useState<string[]>(
    testCase.test_data && testCase.test_data.length > 0 ? [...testCase.test_data] : ['']
  );
  const [steps, setSteps] = useState<string[]>(
    testCase.steps && testCase.steps.length > 0 ? [...testCase.steps] : ['1. ']
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...testCase,
      title: title.trim() || testCase.title,
      priority,
      test_type: testType,
      category,
      status,
      expected_result: expectedResult.trim() || testCase.expected_result,
      preconditions: preconditions.filter((p) => p.trim().length > 0),
      test_data: testData.filter((d) => d.trim().length > 0),
      steps: steps.filter((s) => s.trim().length > 0)
    });
  };

  const handleStepChange = (index: number, val: string) => {
    const updated = [...steps];
    updated[index] = val;
    setSteps(updated);
  };

  const addStep = () => {
    setSteps([...steps, `${steps.length + 1}. `]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded">
              {testCase.id}
            </span>
            <h3 className="text-base font-bold text-white">Edit Test Case Specification</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
              required
            />
          </div>

          {/* Attributes Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full text-xs p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-200"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Test Type</label>
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as TestType)}
                className="w-full text-xs p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-200"
              >
                <option value="Functional">Functional</option>
                <option value="Negative">Negative</option>
                <option value="Edge Case">Edge Case</option>
                <option value="Security">Security</option>
                <option value="Performance">Performance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TestCategory)}
                className="w-full text-xs p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-200"
              >
                <option value="Positive">Positive</option>
                <option value="Negative">Negative</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TestCaseStatus)}
                className="w-full text-xs p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-200"
              >
                <option value="Draft">Draft</option>
                <option value="Ready">Ready</option>
                <option value="Passed">Passed</option>
                <option value="Failed">Failed</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>

          {/* Preconditions */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Preconditions (One per line)</label>
            <textarea
              rows={2}
              value={preconditions.join('\n')}
              onChange={(e) => setPreconditions(e.target.value.split('\n'))}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 font-mono"
              placeholder="e.g. User account is active"
            />
          </div>

          {/* Test Data */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Test Data (One per line)</label>
            <textarea
              rows={2}
              value={testData.join('\n')}
              onChange={(e) => setTestData(e.target.value.split('\n'))}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 font-mono"
              placeholder="e.g. email: user@test.com"
            />
          </div>

          {/* Execution Steps */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Actionable Execution Steps</label>
              <button
                type="button"
                onClick={addStep}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Add Step
              </button>
            </div>
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleStepChange(idx, e.target.value)}
                    className="flex-1 text-xs p-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder={`Step ${idx + 1}`}
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Expected Result */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Result</label>
            <textarea
              rows={3}
              value={expectedResult}
              onChange={(e) => setExpectedResult(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 focus:outline-none focus:border-indigo-500"
              placeholder="Exact expected outcome and feedback..."
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
