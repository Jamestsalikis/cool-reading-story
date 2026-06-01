import { SupabaseClient } from '@supabase/supabase-js';

export type SubStatus = 'free' | 'subscribed' | 'cancelled' | 'admin';

export interface UserSub {
  status: SubStatus;
  free_stories_remaining: number;
  stories_this_month: number;
  stories_today: number;
  day_reset_date: string;
  extra_books_today: number;
  month_reset_date: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
}

export type PaywallResult =
  | { allowed: true; reason: 'admin' | 'free' | 'subscribed' | 'extra_book' }
  | { allowed: false; reason: 'no_subscription' | 'free_exhausted' | 'monthly_limit' | 'daily_limit' };

/**
 * Check whether a user is allowed to generate a story.
 * Handles monthly + daily counter resets.
 * Does NOT decrement — call decrementStoryCount() after successful generation.
 */
export async function checkGenerationAllowed(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string | undefined
): Promise<PaywallResult> {
  // Admins always allowed
  const { data: adminRow } = await supabase
    .from('admin_emails')
    .select('email')
    .eq('email', userEmail ?? '')
    .single();
  if (adminRow) return { allowed: true, reason: 'admin' };

  // Get subscription row — create one if missing (new user)
  let { data: sub } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!sub) {
    const { data: created } = await supabase
      .from('user_subscriptions')
      .insert({ user_id: userId, status: 'free', free_stories_remaining: 1 })
      .select()
      .single();
    sub = created;
  }

  if (!sub) return { allowed: false, reason: 'no_subscription' };

  if (sub.status === 'subscribed') {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Reset monthly counter if needed
    const resetDate = new Date(sub.month_reset_date);
    if (now >= resetDate) {
      const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        .toISOString()
        .split('T')[0];
      await supabase
        .from('user_subscriptions')
        .update({ stories_this_month: 0, month_reset_date: nextReset })
        .eq('user_id', userId);
      sub.stories_this_month = 0;
    }

    // Reset daily counter if the date has rolled over
    if (!sub.day_reset_date || sub.day_reset_date < today) {
      await supabase
        .from('user_subscriptions')
        .update({ stories_today: 0, day_reset_date: today, extra_books_today: 0 })
        .eq('user_id', userId);
      sub.stories_today = 0;
      sub.extra_books_today = 0;
    }

    // No account-wide daily cap — each child gets 1 story/day.
    // Per-child enforcement happens in the generate-story route.
    // extra_books_today unlocks additional stories per child there.
    return { allowed: true, reason: 'subscribed' };
  }

  // Free user — check account-level counter gate.
  // Per-child has_used_free_story gate is also enforced in the generate-story route.
  if (sub.status === 'free' || sub.status === 'cancelled') {
    // Reset extra_books_today if the day has rolled over
    const today = new Date().toISOString().split('T')[0];
    if (!sub.day_reset_date || sub.day_reset_date < today) {
      await supabase
        .from('user_subscriptions')
        .update({ extra_books_today: 0, day_reset_date: today })
        .eq('user_id', userId);
      sub.extra_books_today = 0;
    }

    if ((sub.free_stories_remaining ?? 0) > 0) {
      return { allowed: true, reason: 'free' };
    }
    // Free stories exhausted — check if they bought an extra book today
    if ((sub.extra_books_today ?? 0) > 0) {
      return { allowed: true, reason: 'extra_book' };
    }
    return { allowed: false, reason: 'free_exhausted' };
  }

  return { allowed: false, reason: 'no_subscription' };
}

/**
 * Decrement the appropriate counter after a story is successfully saved.
 * For free users, also marks the child's has_used_free_story = true.
 */
export async function decrementStoryCount(
  supabase: SupabaseClient,
  userId: string,
  reason: 'admin' | 'free' | 'subscribed' | 'extra_book',
  childId?: string
) {
  if (reason === 'admin') return;
  if (reason === 'extra_book') {
    // Decrement the purchased extra book slot
    const { data: subRow } = await supabase
      .from('user_subscriptions')
      .select('extra_books_today')
      .eq('user_id', userId)
      .single();
    const current = subRow?.extra_books_today ?? 0;
    await supabase
      .from('user_subscriptions')
      .update({ extra_books_today: Math.max(0, current - 1) })
      .eq('user_id', userId);
    return;
  }
  if (reason === 'free') {
    // Mark this child as having used their one free story
    if (childId) {
      await supabase
        .from('children')
        .update({ has_used_free_story: true })
        .eq('id', childId)
        .eq('parent_id', userId);
    }
    // Decrement account-level free story counter
    const { data: subRow } = await supabase
      .from('user_subscriptions')
      .select('free_stories_remaining')
      .eq('user_id', userId)
      .single();
    const remaining = subRow?.free_stories_remaining ?? 0;
    await supabase
      .from('user_subscriptions')
      .update({ free_stories_remaining: Math.max(0, remaining - 1) })
      .eq('user_id', userId);
  }
  if (reason === 'subscribed') {
    await supabase.rpc('increment_stories_this_month', { uid: userId });
    await supabase.rpc('increment_stories_today', { uid: userId });
  }
}
