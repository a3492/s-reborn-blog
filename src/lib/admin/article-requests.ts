import { supabase } from '../supabase';

export type ArticleRequest = {
  id: string;
  query: string;
  status: 'pending' | 'reviewing' | 'done' | 'rejected';
  created_at: string;
  user_agent?: string;
  referrer?: string;
  note?: string;
};

export async function getArticleRequests(limit = 50): Promise<ArticleRequest[]> {
  const { data, error } = await supabase
    .from('article_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('article_requests fetch error:', error.message);
    return [];
  }
  return data ?? [];
}

export async function getPendingCount(): Promise<number> {
  const { count, error } = await supabase
    .from('article_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (error) return 0;
  return count ?? 0;
}
