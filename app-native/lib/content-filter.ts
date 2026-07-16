// Shared content filter for user-entered free text (child name, custom interests,
// follow-up answers, family/pet names). Used both client-side (onboarding, for an
// instant warning) and server-side (createChild/updateChild, as the real gate so it
// cannot be bypassed by calling the API directly).

export const BLOCKED_TERMS = [
  // Profanity
  'fuck', 'shit', 'bitch', 'bastard', 'piss', 'cock', 'cunt', 'whore', 'slut', 'twat', 'arse',
  'asshole', 'dickhead', 'wanker', 'motherfucker',
  // Sexual / anatomy slang + acts
  'dick', 'penis', 'vagina', 'pussy', 'boob', 'tit', 'nude', 'naked', 'sex', 'sexual', 'porn', 'erotic',
  'anal', 'oral sex', 'blowjob', 'blow job', 'handjob', 'hand job', 'sucking dick', 'suck dick', 'suck cock',
  'orgasm', 'masturbate', 'masturbation', 'ejaculate', 'fellatio', 'genital', 'genitals', 'testicle', 'scrotum',
  'horny', 'fetish', 'bdsm', 'prostitute', 'rape', 'molest', 'incest', 'bestiality', 'pedophile', 'paedophile',
  // Adult themes called out by team
  'gay', 'lesbian', 'trans', 'queer', 'lgbt', 'mardi gras', 'stripper', 'strip club',
  // Drugs / alcohol
  'drug', 'drugs', 'alcohol', 'weed', 'marijuana', 'cannabis', 'hashish', 'bong',
  'cocaine', 'crack cocaine', 'heroin', 'opium', 'opioid', 'opioids', 'morphine', 'codeine', 'methadone',
  'meth', 'methamphetamine', 'crystal meth', 'crank', 'amphetamine', 'amphetamines',
  'lsd', 'ecstasy', 'mdma', 'ketamine', 'pcp', 'angel dust', 'mescaline',
  'psilocybin', 'shrooms', 'magic mushroom', 'magic mushrooms', 'dmt', 'ayahuasca',
  'fentanyl', 'oxycodone', 'oxycontin', 'percocet', 'vicodin', 'xanax', 'valium', 'adderall',
  'narcotic', 'narcotics', 'steroids', 'bath salts',
  'vape', 'vaping', 'cigarette', 'cigarettes', 'tobacco', 'nicotine', 'smoking',
  // Violence / self-harm / hate
  'murder', 'kill', 'killing', 'stab', 'stabbing', 'behead', 'gore', 'torture', 'suicide', 'self harm', 'self-harm',
  'shoot', 'shooting', 'gun', 'guns', 'gunshot', 'lynch', 'massacre', 'genocide',
  'nazi', 'racist', 'terrorist', 'kkk', 'nigger', 'faggot',
];

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** True if the text contains no blocked term. Multi-word / hyphenated terms are
 *  matched as substrings; single words are matched on word boundaries to avoid
 *  false positives (e.g. "cumin", "skill", "Gunther"). */
export function isContentAppropriate(text: string | null | undefined): boolean {
  if (!text) return true;
  const lower = text.toLowerCase();
  return !BLOCKED_TERMS.some((term) => {
    if (term.includes(' ') || term.includes('-')) return lower.includes(term);
    return new RegExp(`\\b${escapeRegex(term)}\\b`, 'i').test(lower);
  });
}

/** True only if every supplied value passes the filter. */
export function allContentAppropriate(values: (string | null | undefined)[]): boolean {
  return values.every(isContentAppropriate);
}
