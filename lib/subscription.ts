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
  | { allowed: true; reason: 'admin' | 'free' | 'subscribed' }
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
      .insert({ user_id: userId, status: 'free', free_stories_remaining: 2 })
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

    // Daily limit: 1 included in subscription + any extras purchased today
    const dailyAllowed = 1 + (sub.extra_books_today ?? 0);
    if ((sub.stories_today ?? 0) >= dailyAllowed) {
      return { allowed: false, reason: 'daily_limit' };
    }

    return { allowed: true, reason: 'subscribed' };
  }

  // Free user — check remaining
  if (sub.free_stories_remaining > 0) {
    return { allowed: true, reason: 'free' };
  }

  return { allowed: false, reason: 'free_exhausted' };
}

/**
 * Decrement the appropriate counter after a story is successfully saved.
 */
export async function decrementStoryCount(
  supabase: SupabaseClient,
  userId: string,
  reason: 'admin' | 'free' | 'subscribed'
) {
  if (reason === 'admin') return;
  if (reason === 'free') {
    await supabase.rpc('decrement_free_stories', { uid: userId });
  }
  if (reason === 'subscribed') {
    await supabase.rpc('increment_stories_this_month', { uid: userId });
    await supabase.rpc('increment_stories_today', { uid: userId });
  }
}
