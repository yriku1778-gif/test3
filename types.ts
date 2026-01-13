
export interface NewsSource {
  id: string;
  name: string;
  domain: string;
  selected: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  source: string;
  url: string;
  publishedDate: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GeminiNewsResponse {
  articles: NewsArticle[];
  analysis: string;
}
