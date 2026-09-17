/* LOCAL PREVIEW ONLY. Fabricated data so the dashboard can be rendered and
   screenshotted without an account. Never imported unless PREVIEW_MOCK=1. */
const USER = { id: 'preview-user', email: 'preview@example.com' };

const CHILDREN = [
  { id: 'c1', name: 'Zak', age: 7, interests: ['Dinosaurs', 'Soccer'], has_used_free_story: true,
    gender: 'boy', skin_colour: 'Tanned', hair_colour: 'Brown', reading_level: 'beginner' },
  { id: 'c2', name: 'Zoe', age: 5, interests: ['Unicorns', 'Fairies'], has_used_free_story: false,
    gender: 'girl', skin_colour: 'White', hair_colour: 'Blonde', reading_level: 'beginner' },
];

const mkStory = (id: string, title: string, child: string, age: number, img: string, series?: [string, number]) => ({
  id, title, created_at: new Date(Date.now() - Math.random() * 6e8).toISOString(),
  word_count: 520, series_id: series ? 's1' : null, series_title: series ? series[0] : null,
  volume_number: series ? series[1] : null,
  pages: [{ page_number: 1, image_url: img }, { page_number: 2, image_url: img }],
  children: { name: child, age },
});

const STORIES = [
  mkStory('s1', 'Zak and the Dinosaur Who Made a Friend', 'Zak', 7, '/journey/world-dino.avif', ['The Dinosaur Valley', 1]),
  mkStory('s2', 'Zak and the Bone That Should Not Exist', 'Zak', 7, '/journey/world-dino.avif', ['The Dinosaur Valley', 2]),
  mkStory('s3', 'Zak and the Cup Nobody Wanted', 'Zak', 7, '/journey/world-hero.avif'),
  mkStory('s4', 'Zoe and the Unicorn Who Carried the Last Map', 'Zoe', 5, '/journey/world-unicorn.avif'),
  mkStory('s5', 'Zoe and the Whale Who Waited', 'Zoe', 5, '/journey/world-ocean.avif'),
];

const SUB = {
  status: 'subscribed', stories_this_month: 12, stories_today: 0, extra_books_today: 0,
  extra_child_slots: 1, current_period_end: new Date(Date.now() + 2e9).toISOString(),
  has_seen_tour: true,
};

function table(name: string) {
  const rows: Record<string, unknown[]> = {
    children: CHILDREN, stories: STORIES, user_subscriptions: [SUB], admin_emails: [],
  };
  const data = rows[name] ?? [];
  const chain: Record<string, unknown> = {};
  const self = () => chain;
  for (const m of ['select', 'eq', 'neq', 'in', 'order', 'limit', 'not', 'is', 'update', 'insert', 'delete', 'gte', 'lte'])
    chain[m] = self;
  chain.single = () => Promise.resolve({ data: data[0] ?? null, error: null });
  chain.maybeSingle = () => Promise.resolve({ data: data[0] ?? null, error: null });
  chain.then = (res: (v: { data: unknown[]; error: null }) => unknown) =>
    Promise.resolve({ data, error: null }).then(res);
  return chain;
}

export function createMockClient() {
  return {
    from: (n: string) => table(n),
    auth: {
      getUser: async () => ({ data: { user: USER }, error: null }),
      getSession: async () => ({ data: { session: { user: USER } }, error: null }),
      updateUser: async () => ({ data: { user: USER }, error: null }),
      signOut: async () => ({ error: null }),
    },
  };
}
