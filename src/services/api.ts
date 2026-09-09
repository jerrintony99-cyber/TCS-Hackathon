import { GenerationRequest, GenerationResult, HistoryItem, TestCase } from '../types';

export async function fetchHealth(): Promise<{ status: string; gemini_configured: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    console.warn('API health check error:', err);
    return { status: 'offline', gemini_configured: false };
  }
}

export async function fetchConfig(): Promise<any> {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error('Failed to fetch config');
    return await res.json();
  } catch (err) {
    return {
      has_gemini_key: false,
      default_model: 'gemini-3.8-flash',
      available_providers: []
    };
  }
}

export async function generateTestCases(payload: GenerationRequest): Promise<GenerationResult> {
  const res = await fetch('/api/generate-test-cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Generation failed with status ${res.status}`);
  }

  return await res.json();
}

export async function regenerateTestCase(
  userStory: string,
  existingTestCase: TestCase,
  instruction?: string,
  customApiKey?: string
): Promise<TestCase> {
  const res = await fetch('/api/regenerate-test-case', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_story: userStory,
      existing_test_case: existingTestCase,
      instruction,
      custom_api_key: customApiKey
    })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to regenerate test case');
  }

  return await res.json();
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  try {
    const res = await fetch('/api/history');
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.warn('Failed to load history:', err);
    return [];
  }
}

export async function fetchHistoryItem(id: string): Promise<GenerationResult | null> {
  try {
    const res = await fetch(`/api/history/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function deleteHistoryItem(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateHistoryTestCases(id: string, testCases: TestCase[]): Promise<boolean> {
  try {
    const res = await fetch(`/api/history/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test_cases: testCases })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function clearAllHistory(): Promise<boolean> {
  try {
    const res = await fetch('/api/history/clear', { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}
