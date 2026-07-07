export interface ContentInteractions {
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  reposts: number;
}

export interface MetricEntry {
  id?: string;
  month: string; // formato "YYYY-MM-01"

  // Seguidores
  followers: number;
  followers_gained: number;
  followers_lost: number;
  gender_men_pct: number;
  gender_women_pct: number;

  // Visualizações
  views_total: number;
  views_reels_pct: number;
  views_stories_pct: number;
  views_posts_pct: number;
  accounts_reached_pct: number;

  // Interações (visão geral)
  interactions_total: number;
  interactions_followers_pct: number;
  interactions_non_followers_pct: number;
  interactions_reels_pct: number;
  interactions_stories_pct: number;
  interactions_posts_pct: number;

  // Interações detalhadas por tipo de conteúdo
  reels: ContentInteractions;
  stories: ContentInteractions;
  posts: ContentInteractions;

  profile_visits: number;
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
