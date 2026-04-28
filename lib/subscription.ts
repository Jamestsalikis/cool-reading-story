import { SupabaseClient } from '@supabase/supabase-js';

export type SubStatus = 'free' | 'subscribed' | 'cancelled' | 'admin';

export interface UserSub {
  status: SubStatus;
  free_stories_remaining: number;
  stories_this_month: number;
  month_reset_date: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
}

export type PaywallResult =
  | { allowed: true; reason: 'admin' | 'free' | 'subscribed' }
  | { allowed: false; reason: 'no_subscription' | 'free_exhausted' | 'monthly_limit' };

/**
 * Check whether a user is allowed to generate a story.
 * Also handles monthly counter reset.
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
      .insert({ user_id: userId, status: 'free', free_stories_remaining: 3 })
      .select()
      .single();
    sub = created;
  }

  if (!sub) return { allowed: false, reason: 'no_subscription' };

  if (sub.status === 'subscribed') {
    // Reset monthly counter if needed
    const now = new Date();
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
    if (sub.stories_this_month >= 15) {
      return { allowed: false, reason: 'monthly_limit' };
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
  }
}
