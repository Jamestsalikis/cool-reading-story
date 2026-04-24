'use server';

import { createClient } from './server';

type Person = { name: string; nickname: string };

export async function createChild(data: {
  name: string;
  age: number;
  gender: string;
  interests: string[];
  followUpAnswers: { question: string; answer: string }[];
  hairColour: string;
  eyeColour: string;
  siblings: Person[];
  friends: Person[];
  petName: string;
  petType: string;
  city: string;
  country: string;
  readingLevel: string;
}) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Not authenticated' };

  const readingLevelMap: Record<string, string> = {
    simple: 'beginner',
    medium: 'intermediate',
    imaginative: 'advanced',
  };

  const { data: child, error } = await supabase
    .from('children')
    .insert({
      parent_id: user.id,
      name: data.name,
      age: data.age,
      gender: data.gender === 'Skip' ? null : data.gender,
      interests: data.interests,
      reading_level: readingLevelMap[data.readingLevel] || 'intermediate',
      appearance: {
        hairColour: data.hairColour,
        eyeColour: data.eyeColour,
        siblings: data.siblings.filter(s => s.name.trim()),
        friends: data.friends.filter(f => f.name.trim()),
        followUpAnswers: data.followUpAnswers,
        petName: data.petName,
        petType: data.petType,
        city: data.city,
        country: data.country,
      },
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { child };
}

export async function getChildren() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { children: [] };

  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', user.id)
    .order('created_at', { ascending: true });

  return { children: children || [] };
}
