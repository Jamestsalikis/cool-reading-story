'use client';

// Client-side child profile actions for the bundled native app (no Next.js
// server). Mirrors the `'use server'` functions in child-actions.ts but uses
// the browser Supabase client. All DB ops are RLS-scoped to auth.uid() =
// parent_id, so a user can only ever touch their own children.
//
// NOTE: the free-user "1 child" gate below is enforced here in client code
// (same as the old server action). It is NOT tamper-proof on its own — Phase 4
// adds server-side enforcement (a DB trigger / edge-function check) so the
// limit can't be bypassed by calling Supabase directly. See PLAN.md §Phase 4.

import { createClient } from './client';
import { allContentAppropriate } from '../content-filter';

type Person = { name: string; nickname: string };

const readingLevelMap: Record<string, string> = {
  simple: 'beginner',
  medium: 'intermediate',
  imaginative: 'advanced',
};

export async function createChild(data: {
  name: string;
  age: number;
  gender: string;
  interests: string[];
  followUpAnswers: { question: string; answer: string }[];
  hairColour: string;
  eyeColour: string;
  skinColour: string;
  siblings: Person[];
  friends: Person[];
  petName: string;
  petType: string;
  petColour?: string;
  city: string;
  country: string;
  readingLevel: string;
}) {
  const supabase = createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Not authenticated' };

  const contentToCheck = [
    data.name,
    ...data.interests,
    ...(data.followUpAnswers?.map((f) => f.answer) ?? []),
    ...data.siblings.map((s) => s.name),
    ...data.friends.map((f) => f.name),
    data.petName,
  ];
  if (!allContentAppropriate(contentToCheck)) return { error: 'inappropriate_content' };

  // Subscription gate: free users can only have 1 child profile (+ purchased slots).
  const { data: adminRow } = await supabase
    .from('admin_emails')
    .select('email')
    .eq('email', user.email ?? '')
    .single();

  if (!adminRow) {
    const { data: subRow } = await supabase
      .from('user_subscriptions')
      .select('status, extra_child_slots')
      .eq('user_id', user.id)
      .single();

    const extraSlots = subRow?.extra_child_slots ?? 0;
    const maxChildren = 1 + extraSlots;

    const { count: existingChildren } = await supabase
      .from('children')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', user.id);

    if ((existingChildren ?? 0) >= maxChildren) {
      return { error: 'extra_child_required' };
    }
  }

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
        skinColour: data.skinColour,
        siblings: data.siblings.filter(s => s.name.trim()),
        friends: data.friends.filter(f => f.name.trim()),
        followUpAnswers: data.followUpAnswers,
        petName: data.petName,
        petType: data.petType,
        petColour: data.petColour || '',
        city: data.city,
        country: data.country,
      },
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { child };
}

export async function updateChild(childId: string, data: {
  name: string;
  age: number;
  gender: string;
  interests: string[];
  hairColour: string;
  eyeColour: string;
  skinColour: string;
  siblings: Person[];
  friends: Person[];
  petName: string;
  petType: string;
  petColour?: string;
  city: string;
  country: string;
  readingLevel: string;
  followUpAnswers?: { question: string; answer: string }[];
}) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Not authenticated' };

  const contentToCheck = [
    data.name,
    ...data.interests,
    ...(data.followUpAnswers?.map((f) => f.answer) ?? []),
    ...data.siblings.map((s) => s.name),
    ...data.friends.map((f) => f.name),
    data.petName,
  ];
  if (!allContentAppropriate(contentToCheck)) return { error: 'inappropriate_content' };

  // Preserve appearance fields we're not editing (e.g. followUpAnswers).
  const { data: current } = await supabase
    .from('children')
    .select('appearance')
    .eq('id', childId)
    .eq('parent_id', user.id)
    .single();

  const { error } = await supabase
    .from('children')
    .update({
      name: data.name,
      age: data.age,
      gender: data.gender === 'Skip' ? null : data.gender,
      interests: data.interests,
      reading_level: readingLevelMap[data.readingLevel] || 'intermediate',
      appearance: {
        ...(current?.appearance || {}),
        hairColour: data.hairColour,
        eyeColour: data.eyeColour,
        skinColour: data.skinColour,
        siblings: data.siblings.filter(s => s.name.trim()),
        friends: data.friends.filter(f => f.name.trim()),
        petName: data.petName,
        petType: data.petType,
        petColour: data.petColour || '',
        city: data.city,
        country: data.country,
        ...(data.followUpAnswers !== undefined ? { followUpAnswers: data.followUpAnswers } : {}),
      },
    })
    .eq('id', childId)
    .eq('parent_id', user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function getChildren() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { children: [] };

  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', user.id)
    .order('created_at', { ascending: true });

  return { children: children || [] };
}
