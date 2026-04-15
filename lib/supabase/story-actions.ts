'use server';

import { createClient } from './server';

export async function getStoriesByParent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { stories: [] };

  const { data: stories } = await supabase
    .from('stories')
    .select(`
      *,
      children (name, age)
    `)
    .eq('parent_id', user.id)
    .order('created_at', { ascending: false });

  return { stories: stories || [] };
}

export async function getStory(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { story: null };

  const { data: story } = await supabase
    .from('stories')
    .select(`
      *,
      children (name, age, interests)
    `)
    .eq('id', id)
    .eq('parent_id', user.id)
    .single();

  return { story };
}

export async function toggleFavourite(id: string, isFavourite: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('stories')
    .update({ is_favourite: isFavourite })
    .eq('id', id)
    .eq('parent_id', user.id);

  if (error) return { error: error.message };
  return { success: true };
}
