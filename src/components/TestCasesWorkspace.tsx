import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Copy, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Plus, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  CheckSquare, 
  Square,
  Sparkles,
  Layers,
  ShieldAlert,
  Zap,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { PriorityLevel, TestCase, TestCaseStatus, TestCategory, TestType, GenerationResult } from '../types';
import { copyToClipboard, exportToCsv, exportToJson, formatAsMarkdown, printTestReport } from '../utils/exportUtils';

interface TestCasesWorkspaceProps {
  generationResult: GenerationResult;
  onUpdateTestCases: (updated: TestCase[]) => void;
  onOpenEditModal: (tc: TestCase) => void;
  onOpenRegenerateModal: (tc: TestCase) => void;
  onToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const TestCasesWorkspace: React.FC<TestCasesWorkspaceProps> = ({
  generationResult,
  onUpdateTestCases,
  onOpenEditModal,
  onOpenRegenerateModal,
  onToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | PriorityLevel>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | TestType>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | TestCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | TestCaseStatus>('All');
  const [sortBy, setSortBy] = useState<'id' | 'priority' | 'type'>('id');
  const [sortAsc, setSortAsc] = useState(true);

  // Selected test cases for bulk action
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Expanded card state
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  // View mode: 'table' vs 'card'
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  // Export dropdown
  const [showExportMenu, setShowExportMenu] = useState(false);

  const testCases = generationResult.test_cases;

  // Toggle individual card expansion
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    testCases.forEach((tc) => (all[tc.id] = true));
    setExpandedIds(all);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredCases.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCases.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Status toggle
  const handleStatusChange = (id: string, newStatus: TestCaseStatus) => {
    const updated = testCases.map((tc) => (tc.id === id ? { ...tc, status: newStatus } : tc));
    onUpdateTestCases(updated);
    onToast(`Updated status to ${newStatus}`, 'info');
  };

  // Bulk status update
  const handleBulkStatusChange = (newStatus: TestCaseStatus) => {
    const updated = testCases.map((tc) =>
      selectedIds.includes(tc.id) ? { ...tc, status: newStatus } : tc
    );
    onUpdateTestCases(updated);
    onToast(`Updated ${selectedIds.length} cases to ${newStatus}`, 'success');
  };

  // Delete test case
  const handleDeleteOne = (id: string) => {
    const updated = testCases.filter((tc) => tc.id !== id);
    onUpdateTestCases(updated);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    onToast(`Removed test case ${id}`, 'info');
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} test cases?`)) return;
    const updated = testCases.filter((tc) => !selectedIds.includes(tc.id));
    onUpdateTestCases(updated);
    setSelectedIds([]);
    onToast(`Deleted ${selectedIds.length} test cases`, 'info');
  };

  // Copy single test case
  const handleCopySingle = async (tc: TestCase) => {
    const formatted = `${tc.id}: ${tc.title}
Preconditions:
${tc.preconditions.map((p) => `- ${p}`).join('\n')}
Test Data:
${tc.test_data.map((d) => `- ${d}`).join('\n')}
Execution Steps:
${tc.steps.join('\n')}
Expected Result:
${tc.expected_result}
Priority: ${tc.priority} | Type: ${tc.test_type} | Category: ${tc.category}`;

    const ok = await copyToClipboard(formatted);
    if (ok) onToast(`Copied ${tc.id} to clipboard!`, 'success');
  };

  // Add a manual test case template
  const handleAddManualCase = () => {
    const nextNum = testCases.length + 1;
    const newId = `TC${String(nextNum).padStart(3, '0')}`;
    const newCase: TestCase = {
      id: newId,
      title: 'Manual Test Case - Verify Requirement',
      user_story_ref: 'REQ-01',
      preconditions: ['Preconditions are satisfied'],
      test_data: ['Standard input parameters'],
      steps: [
        '1. Navigate to target screen',
        '2. Enter valid test parameters',
        '3. Click primary action button',
        '4. Verify system responds as expected'
      ],
      expected_result: 'System successfully verifies acceptance criteria without errors.',
      priority: 'Medium',
      test_type: 'Functional',
      category: 'Positive',
      status: 'Draft'
    };
    onUpdateTestCases([...testCases, newCase]);
    onToast(`Added new test case template ${newId}`, 'success');
    onOpenEditModal(newCase);
  };

  // Filter and sort computation
  const filteredCases = useMemo(() => {
    return testCases
      .filter((tc) => {
        if (priorityFilter !== 'All' && tc.priority !== priorityFilter) return false;
        if (typeFilter !== 'All' && tc.test_type !== typeFilter) return false;
        if (categoryFilter !== 'All' && tc.category !== categoryFilter) return false;
        if (statusFilter !== 'All' && tc.status !== statusFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = tc.title.toLowerCase().includes(q);
          const matchId = tc.id.toLowerCase().includes(q);
          const matchExpected = tc.expected_result.toLowerCase().includes(q);
          const matchSteps = tc.steps.some((s) => s.toLowerCase().includes(q));
          if (!matchTitle && !matchId && !matchExpected && !matchSteps) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'id') {
          diff = a.id.localeCompare(b.id);
        } else if (sortBy === 'priority') {
          const order = { High: 1, Medium: 2, Low: 3 };
          diff = (order[a.priority] || 4) - (order[b.priority] || 4);
        } else if (sortBy === 'type') {
          diff = a.test_type.localeCompare(b.test_type);
        }
        return sortAsc ? diff : -diff;
      });
  }, [testCases, priorityFilter, typeFilter, categoryFilter, statusFilter, searchQuery, sortBy, sortAsc]);

  // Export handlers
  const handleCopyMarkdown = async () => {
    const md = formatAsMarkdown(generationResult);
    const ok = await copyToClipboard(md);
    if (ok) onToast('Copied full test specifications as Markdown!', 'success');
    setShowExportMenu(false);
  };

  const handleExportCsv = () => {
    exportToCsv(
      selectedIds.length > 0 ? testCases.filter((c) => selectedIds.includes(c.id)) : testCases,
      generationResult.user_story
    );
    onToast('Downloaded test cases as CSV', 'success');
    setShowExportMenu(false);
  };

  const handleExportJson = () => {
    exportToJson(generationResult);
    onToast('Downloaded full test suite JSON', 'success');
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    printTestReport(generationResult);
    setShowExportMenu(false);
  };

  return (
    <div id="test-cases-workspace" className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-4 sm:p-6 mb-12 text-slate-100">
      
      {/* Workspace Header & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white">Generated Test Suite</h2>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold px-2 py-0.5 rounded-full">
              {filteredCases.length} of {testCases.length} Cases
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive enterprise test repository. Filter, edit, regenerate, or export across Jira, TestRail, and Excel formats.
          </p>
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Add Manual Test Case */}
          <button
            id="btn-add-test-case"
            onClick={handleAddManualCase}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Test Case</span>
          </button>

          {/* View Mode Toggle */}
          <div className="inline-flex rounded-lg border border-slate-800 p-0.5 bg-slate-950 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                viewMode === 'table' ? 'bg-indigo-600 shadow-xs text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                viewMode === 'card' ? 'bg-indigo-600 shadow-xs text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Card View
            </button>
          </div>

          {/* Export Dropdown Menu */}
          <div className="relative">
            <button
              id="btn-export-menu"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export & Share</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {showExportMenu && (
              <div 
                className="absolute right-0 mt-1.5 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-20 py-1 text-xs text-slate-200"
                onMouseLeave={() => setShowExportMenu(false)}
              >
                <button
                  onClick={handleExportCsv}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2 text-slate-200"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-medium">Download CSV</div>
                    <div className="text-[10px] text-slate-400">Jira, TestRail, Excel compatible</div>
                  </div>
                </button>
                <button
                  onClick={handleExportJson}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2 text-slate-200"
                >
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="font-medium">Download JSON</div>
                    <div className="text-[10px] text-slate-400">Full structured object tree</div>
                  </div>
                </button>
                <button
                  onClick={handleCopyMarkdown}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2 text-slate-200"
                >
                  <Copy className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-medium">Copy as Markdown</div>
                    <div className="text-[10px] text-slate-400">Formatted documentation</div>
                  </div>
                </button>
                <div className="border-t border-slate-800 my-1" />
                <button
                  onClick={handlePrint}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-800 flex items-center gap-2 text-slate-200"
                >
                  <Printer className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="font-medium">Print Test Plan Report</div>
                    <div className="text-[10px] text-slate-400">Formatted executive summary</div>
                  </div>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            id="test-cases-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test cases by title, steps, expected result, ID..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Test Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
          >
            <option value="All">All Types</option>
            <option value="Functional">Functional</option>
            <option value="Negative">Negative</option>
            <option value="Edge Case">Edge Case</option>
            <option value="Security">Security</option>
            <option value="Performance">Performance</option>
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
          >
            <option value="All">Positive & Negative</option>
            <option value="Positive">Positive Only</option>
            <option value="Negative">Negative Only</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Ready">Ready</option>
            <option value="Passed">Passed</option>
            <option value="Failed">Failed</option>
            <option value="Blocked">Blocked</option>
          </select>

          {/* Sort */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="p-1 rounded text-slate-400 hover:text-white"
              title={sortAsc ? "Sort Ascending" : "Sort Descending"}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
            >
              <option value="id">Sort by ID</option>
              <option value="priority">Sort by Priority</option>
              <option value="type">Sort by Type</option>
            </select>
          </div>

        </div>

      </div>

      {/* Batch Operations Bar (if selected > 0) */}
      {selectedIds.length > 0 && (
        <div className="mt-3 p-2.5 bg-indigo-950/40 border border-indigo-800/60 rounded-lg flex items-center justify-between text-xs text-indigo-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="font-bold">{selectedIds.length} test cases selected</span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-indigo-400 hover:underline ml-2"
            >
              Deselect All
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Mark as:</span>
            <button
              onClick={() => handleBulkStatusChange('Ready')}
              className="px-2 py-1 bg-slate-900 border border-slate-800 text-slate-200 rounded hover:bg-slate-800 font-medium"
            >
              Ready
            </button>
            <button
              onClick={() => handleBulkStatusChange('Passed')}
              className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded hover:bg-emerald-500/30 font-medium"
            >
              Passed
            </button>
            <button
              onClick={handleExportCsv}
              className="px-2 py-1 bg-slate-900 border border-slate-800 text-slate-200 rounded hover:bg-slate-800 font-medium"
            >
              Export Selected
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-2 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded hover:bg-rose-500/30 font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Test Cases View */}
      {filteredCases.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <div className="w-12 h-12 rounded-full bg-slate-950 flex items-center justify-center mx-auto mb-3 text-slate-500 border border-slate-800">
            <Filter className="w-6 h-6" />
          </div>
          <p className="font-semibold text-slate-300">No test cases match your filters</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or reset filter dropdowns.</p>
        </div>
      ) : viewMode === 'table' ? (
        
        /* TABLE VIEW */
        <div className="mt-4 overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredCases.length && filteredCases.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="p-3 w-20">ID</th>
                <th className="p-3">Title & Scenarios</th>
                <th className="p-3 w-24">Priority</th>
                <th className="p-3 w-28">Type</th>
                <th className="p-3 w-24">Status</th>
                <th className="p-3 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredCases.map((tc) => {
                const isSelected = selectedIds.includes(tc.id);
                const isExpanded = expandedIds[tc.id];

                return (
                  <React.Fragment key={tc.id}>
                    <tr className={`hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-indigo-950/30' : ''}`}>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(tc.id)}
                          className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-indigo-400">
                        {tc.id}
                      </td>
                      <td className="p-3">
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => toggleExpand(tc.id)}
                            className="mt-0.5 text-slate-500 hover:text-slate-300"
                          >
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                          <div>
                            <span className="font-semibold text-slate-100">{tc.title}</span>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
                              <span className={`px-1.5 py-0.2 rounded font-medium ${
                                tc.category === 'Positive' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}>
                                {tc.category}
                              </span>
                              <span>•</span>
                              <span>{tc.steps.length} steps</span>
                              <span>•</span>
                              <span className="truncate max-w-xs text-slate-400">{tc.expected_result}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          tc.priority === 'High'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : tc.priority === 'Medium'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {tc.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-slate-300 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded font-medium text-[11px]">
                          {tc.test_type}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={tc.status}
                          onChange={(e) => handleStatusChange(tc.id, e.target.value as any)}
                          className={`text-[11px] font-semibold rounded px-2 py-0.5 border ${
                            tc.status === 'Passed'
                              ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                              : tc.status === 'Failed'
                              ? 'bg-rose-950/60 border-rose-600 text-rose-300'
                              : tc.status === 'Blocked'
                              ? 'bg-amber-950/60 border-amber-600 text-amber-300'
                              : 'bg-slate-950 border-slate-800 text-slate-300'
                          }`}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Ready">Ready</option>
                          <option value="Passed">Passed</option>
                          <option value="Failed">Failed</option>
                          <option value="Blocked">Blocked</option>
                        </select>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenEditModal(tc)}
                            title="Edit Test Case"
                            className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenRegenerateModal(tc)}
                            title="Regenerate Test Case with AI"
                            className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleCopySingle(tc)}
                            title="Copy Test Case Details"
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteOne(tc.id)}
                            title="Delete"
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDED ROW ACCORDION */}
                    {isExpanded && (
                      <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-300">
                        <td colSpan={7} className="p-4 pl-12 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider block mb-1">
                                Preconditions:
                              </span>
                              <ul className="list-disc pl-4 space-y-0.5 text-xs text-slate-400">
                                {tc.preconditions?.map((p, idx) => (
                                  <li key={idx}>{p}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider block mb-1">
                                Test Data:
                              </span>
                              <ul className="list-disc pl-4 space-y-0.5 text-xs font-mono text-slate-400">
                                {tc.test_data?.map((d, idx) => (
                                  <li key={idx}>{d}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div>
                            <span className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider block mb-1">
                              Actionable Execution Steps:
                            </span>
                            <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-300">
                              {tc.steps?.map((step, idx) => (
                                <li key={idx}>{step.replace(/^\d+\.\s*/, '')}</li>
                              ))}
                            </ol>
                          </div>

                          <div className="p-2.5 bg-emerald-950/30 border border-emerald-900/60 rounded-lg text-xs">
                            <span className="font-bold text-emerald-400 block mb-0.5">Expected Result:</span>
                            <span className="text-emerald-300">{tc.expected_result}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        
        /* CARD VIEW */
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCases.map((tc) => {
            const isSelected = selectedIds.includes(tc.id);

            return (
              <div
                key={tc.id}
                className={`border rounded-xl p-4 transition-all ${
                  isSelected ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-950/20' : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                }`}
              >
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(tc.id)}
                      className="rounded border-slate-700 bg-slate-900 text-indigo-600 cursor-pointer"
                    />
                    <span className="font-mono font-bold text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded">
                      {tc.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      tc.priority === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {tc.priority}
                    </span>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded font-medium">
                      {tc.test_type}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditModal(tc)}
                      className="p-1 text-slate-400 hover:text-indigo-400 rounded"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenRegenerateModal(tc)}
                      className="p-1 text-slate-400 hover:text-indigo-400 rounded"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleCopySingle(tc)}
                      className="p-1 text-slate-400 hover:text-white rounded"
                      title="Copy"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteOne(tc.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-100 text-sm mt-3 mb-2">{tc.title}</h3>

                <div className="space-y-2 text-xs text-slate-400">
                  <div>
                    <span className="font-semibold text-slate-300 block mb-1">Steps:</span>
                    <ol className="list-decimal pl-4 space-y-0.5 text-slate-300">
                      {tc.steps.map((step, idx) => (
                        <li key={idx}>{step.replace(/^\d+\.\s*/, '')}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="p-2 bg-emerald-950/30 rounded border border-emerald-900/60 text-emerald-300 mt-2">
                    <span className="font-semibold block text-[11px] text-emerald-400">Expected Result:</span>
                    <span className="text-xs text-emerald-300">{tc.expected_result}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">Category: {tc.category}</span>
                  <select
                    value={tc.status}
                    onChange={(e) => handleStatusChange(tc.id, e.target.value as any)}
                    className="text-[11px] font-medium border border-slate-800 rounded px-2 py-0.5 bg-slate-900 text-slate-300"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Ready">Ready</option>
                    <option value="Passed">Passed</option>
                    <option value="Failed">Failed</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
