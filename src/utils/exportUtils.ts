import { GenerationResult, TestCase } from '../types';

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      textArea.remove();
      return Promise.resolve(true);
    } catch (e) {
      textArea.remove();
      return Promise.resolve(false);
    }
  }
}

export function exportToJson(data: GenerationResult) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TestGen_${data.id || 'export'}_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCsv(testCases: TestCase[], userStory: string) {
  const headers = [
    'Test Case ID',
    'Title',
    'User Story Ref',
    'Priority',
    'Test Type',
    'Category',
    'Status',
    'Preconditions',
    'Test Data',
    'Test Steps',
    'Expected Result'
  ];

  const sanitizeCell = (value: string | string[] | undefined): string => {
    if (!value) return '""';
    const text = Array.isArray(value) ? value.join(' | ') : String(value);
    const escaped = text.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const rows = testCases.map((tc) => [
    sanitizeCell(tc.id),
    sanitizeCell(tc.title),
    sanitizeCell(tc.user_story_ref || 'REQ-01'),
    sanitizeCell(tc.priority),
    sanitizeCell(tc.test_type),
    sanitizeCell(tc.category),
    sanitizeCell(tc.status),
    sanitizeCell(tc.preconditions),
    sanitizeCell(tc.test_data),
    sanitizeCell(tc.steps),
    sanitizeCell(tc.expected_result)
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TestCases_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function formatAsMarkdown(data: GenerationResult): string {
  let md = `# QA Test Case Specification: ${data.id}\n\n`;
  md += `**Date:** ${new Date(data.timestamp).toLocaleString()}\n`;
  md += `**Engine:** ${data.model_used} (${data.provider_used})\n`;
  md += `**Coverage Score:** ${data.coverage.overall_score}%\n\n`;
  
  md += `## 1. User Story & Requirements\n> ${data.user_story}\n\n`;

  if (data.analysis) {
    md += `## 2. Requirement Analysis\n${data.analysis.summary}\n\n`;
    if (data.analysis.assumptions?.length) {
      md += `### Stated Assumptions\n`;
      data.analysis.assumptions.forEach((a) => (md += `- ${a}\n`));
      md += `\n`;
    }
    if (data.analysis.missing_information?.length) {
      md += `### Missing Information / Clarifications Needed\n`;
      data.analysis.missing_information.forEach((m) => (md += `- ⚠️ ${m}\n`));
      md += `\n`;
    }
  }

  md += `## 3. Test Cases (${data.test_cases.length})\n\n`;
  data.test_cases.forEach((tc) => {
    md += `### ${tc.id}: ${tc.title}\n`;
    md += `- **Priority:** ${tc.priority} | **Type:** ${tc.test_type} | **Category:** ${tc.category} | **Status:** ${tc.status}\n`;
    md += `- **Preconditions:**\n`;
    tc.preconditions.forEach((p) => (md += `  - ${p}\n`));
    md += `- **Test Data:**\n`;
    tc.test_data.forEach((d) => (md += `  - \`${d}\`\n`));
    md += `- **Execution Steps:**\n`;
    tc.steps.forEach((s) => (md += `  ${s}\n`));
    md += `- **Expected Result:** ${tc.expected_result}\n\n`;
    md += `---\n\n`;
  });

  return md;
}

export function printTestReport(data: GenerationResult) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>TestGen AI - Quality Assurance Test Plan</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #1e293b; padding: 40px; }
    h1 { font-size: 24px; margin-bottom: 4px; color: #0f172a; }
    .meta { color: #64748b; font-size: 14px; margin-bottom: 24px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-right: 6px; }
    .badge-high { background: #fee2e2; color: #991b1b; }
    .badge-func { background: #e0e7ff; color: #3730a3; }
    .badge-pos { background: #dcfce7; color: #166534; }
    .badge-neg { background: #fef3c7; color: #92400e; }
    .story-box { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin-bottom: 24px; border-radius: 0 6px 6px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; font-size: 13px; vertical-align: top; }
    th { background: #f1f5f9; font-weight: 600; }
    .steps-list { margin: 0; padding-left: 18px; }
    .score-box { display: flex; gap: 24px; margin-bottom: 24px; }
    .score-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 18px; }
    .score-value { font-size: 20px; font-weight: bold; color: #2563eb; }
    @media print { body { padding: 0; } button { display: none; } }
  </style>
</head>
<body>
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <h1>TestGen AI • Enterprise Test Plan & Traceability Matrix</h1>
    <button onclick="window.print()" style="padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">Print Report</button>
  </div>
  <div class="meta">
    Generated: ${new Date(data.timestamp).toLocaleString()} | Model: ${data.model_used} | Total Test Cases: ${data.test_cases.length} | Coverage Score: <strong>${data.coverage.overall_score}%</strong>
  </div>

  <div class="story-box">
    <strong>Target User Story:</strong><br/>
    ${data.user_story}
  </div>

  <div class="score-box">
    <div class="score-card"><div class="score-value">${data.coverage.total}</div>Total Cases</div>
    <div class="score-card"><div class="score-value">${data.coverage.positive}</div>Positive Scenarios</div>
    <div class="score-card"><div class="score-value">${data.coverage.negative}</div>Negative Scenarios</div>
    <div class="score-card"><div class="score-value">${data.coverage.edge_cases}</div>Edge / Boundary Cases</div>
    <div class="score-card"><div class="score-value">${data.coverage.overall_score}%</div>Relevance & Coverage Score</div>
  </div>

  <h2>Executable Test Specifications</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 70px;">ID</th>
        <th style="width: 180px;">Title & Tags</th>
        <th style="width: 150px;">Preconditions & Test Data</th>
        <th>Execution Steps</th>
        <th style="width: 220px;">Expected Result</th>
        <th style="width: 70px;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${data.test_cases
        .map(
          (tc) => `<tr>
        <td><strong>${tc.id}</strong></td>
        <td>
          <strong>${tc.title}</strong><br/>
          <span class="badge badge-high">${tc.priority}</span>
          <span class="badge badge-func">${tc.test_type}</span>
          <span class="badge ${tc.category === 'Positive' ? 'badge-pos' : 'badge-neg'}">${tc.category}</span>
        </td>
        <td>
          <small><strong>Preconditions:</strong><br/>${tc.preconditions.join('<br/>')}</small><br/><br/>
          <small><strong>Data:</strong><br/>${tc.test_data.join('<br/>')}</small>
        </td>
        <td>
          <ol class="steps-list">
            ${tc.steps.map((s) => `<li>${s.replace(/^\d+\.\s*/, '')}</li>`).join('')}
          </ol>
        </td>
        <td>${tc.expected_result}</td>
        <td><strong>${tc.status}</strong></td>
      </tr>`
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}
