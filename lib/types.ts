export interface MetricEntry {
  id?: string;
  month: string; // formato "YYYY-MM-01"
  followers: number;
  new_followers: number;
  reach: number;
  impressions: number;
  profile_visits: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  posts_count: number;
  notes?: string;
  created_at?: string;
}

export interface AnalysisEntry {
  id?: string;
  month: string;
  analysis: string;
  created_at?: string;
}

export interface AnalyzeResponse {
  analysis: string;
}
