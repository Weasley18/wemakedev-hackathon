import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface HypothesisRequest {
  hypothesis: string;
  analyst_id: string;
  context?: Record<string, any>;
}

export interface HuntPlan {
  plan_id: string;
  hypothesis: string;
  queries: Query[];
  created_at: string;
  analyst_id: string;
  mitre_techniques: MitreTechnique[];
  estimated_execution_time: string;
}

export interface Query {
  query_id: string;
  data_source: string;
  query_string: string;
  explanation: string;
  technique_ids: string[];
  time_range: { start: string; end: string };
  expected_volume: string;
  risk_level: string;
}

export interface MitreTechnique {
  id: string;
  name: string;
  description?: string;
}

export interface QueryApprovalRequest {
  plan_id: string;
  query_ids: string[];
  modifications?: Record<string, string>;
}

export interface HuntResult {
  result_id: string;
  plan_id: string;
  raw_results: Record<string, any>;
  analysis: Record<string, any>;
  created_at: string;
}

export interface ClarificationRequest {
  result_id: string;
  question: string;
  context: Record<string, any>;
}

export interface ClarificationResponse {
  result_id: string;
  answer: string;
  confidence: number;
}

// API Service functions
export const apiService = {
  // Create a hunt plan from a natural language hypothesis
  async createHuntPlan(request: HypothesisRequest): Promise<HuntPlan> {
    const response = await api.post<HuntPlan>('/hypothesis', request);
    return response.data;
  },

  // Execute approved queries from a hunt plan
  async executeHuntPlan(request: QueryApprovalRequest): Promise<HuntResult> {
    const response = await api.post<HuntResult>('/execute', request);
    return response.data;
  },

  // Request clarification about hunt results
  async requestClarification(request: ClarificationRequest): Promise<ClarificationResponse> {
    const response = await api.post<ClarificationResponse>('/clarify', request);
    return response.data;
  },

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await api.get<{ status: string; timestamp: string }>('/health');
    return response.data;
  }
};

export default apiService;
