export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type TestType = 'Functional' | 'Negative' | 'Edge Case' | 'Security' | 'Performance';
export type TestCategory = 'Positive' | 'Negative';
export type TestCaseStatus = 'Draft' | 'Ready' | 'Passed' | 'Failed' | 'Blocked';

export interface TestCase {
  id: string;
  title: string;
  user_story_ref?: string;
  preconditions: string[];
  test_data: string[];
  steps: string[];
  expected_result: string;
  priority: PriorityLevel;
  test_type: TestType;
  category: TestCategory;
  status: TestCaseStatus;
}

export interface Analysis {
  summary: string;
  assumptions: string[];
  missing_information: string[];
  actors?: string[];
  acceptance_criteria?: string[];
}

export interface CoverageStats {
  total: number;
  positive: number;
  negative: number;
  edge_cases: number;
  security: number;
  performance: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  overall_score: number;
}

export interface GenerationRequest {
  user_story: string;
  test_case_count: number;
  test_types: TestType[];
  priority_filter?: 'All' | PriorityLevel;
  provider?: 'gemini' | 'ollama' | 'openai' | 'mock';
  model?: string;
  custom_api_key?: string;
  ollama_url?: string;
}

export interface GenerationResult {
  id: string;
  timestamp: string;
  user_story: string;
  analysis: Analysis;
  test_cases: TestCase[];
  coverage: CoverageStats;
  provider_used: string;
  model_used: string;
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  user_story: string;
  test_case_count: number;
  coverage_score: number;
  summary: string;
  data: GenerationResult;
}

export interface SampleUserStory {
  id: string;
  title: string;
  category: string;
  story: string;
  tags: string[];
}
