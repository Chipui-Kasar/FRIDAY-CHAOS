// "Vibe Check": a silly personality quiz + a random "talk about this for a couple of minutes" topic.
// Pure functions (no I/O, RNG is injectable) so it's easy to edit the content and to test.
// Nothing here is secret and nothing is stored: it's entertainment while people wait for / after the reveal.

export type Rng = () => number;
export type TypeKey = 'gremlin' | 'foodie' | 'owl' | 'star' | 'napper' | 'dragon';

export type Question = { q: string; a: { text: string; type: TypeKey }[] };
export type Archetype = { key: TypeKey; emoji: string; title: string; roast: string };

export const QUESTION_COUNT = 5;
export const TALK_SECONDS = 120;

export const ARCHETYPES: Record<TypeKey, Archetype> = {
  gremlin: { key: 'gremlin', emoji: '🦝', title: 'Chaos Gremlin', roast: 'Plans are just suggestions, and you are the suggestion box on fire. Every group needs one of you, and every group is slightly scared of you.' },
  foodie: { key: 'foodie', emoji: '🍛', title: 'Snack Strategist', roast: 'Your calendar is built around meals. You do not ask "what time is the meeting?", you ask "will there be biryani?".' },
  owl: { key: 'owl', emoji: '🦉', title: 'Overthinking Owl', roast: 'You have already run 14 scenarios for this quiz, and in 9 of them the answer was "it depends". You are very wise and slightly tired.' },
  star: { key: 'star', emoji: '🌟', title: 'Main Character', roast: 'You walk into a room like the background music just changed. The meeting has not started until you have said something dramatic.' },
  napper: { key: 'napper', emoji: '😴', title: 'Professional Napper', roast: 'Calm, unbothered, horizontal. You have never rushed anything and somehow everything still works out. Annoying, honestly.' },
  dragon: { key: 'dragon', emoji: '🐉', title: 'Deadline Dragon', roast: 'You breathe fire on anything unscheduled. You send agendas for casual chats. Your to-do list has a to-do list.' },
};

export const QUESTIONS: Question[] = [
  { q: 'The Wi-Fi dies in the middle of a big meeting. You…', a: [
    { text: 'Announce "this is fine" and start a hotspot party', type: 'gremlin' },
    { text: 'Wonder if the canteen is open', type: 'foodie' },
    { text: 'Start drafting a root-cause analysis', type: 'dragon' },
    { text: 'Take the best nap of the quarter', type: 'napper' },
  ] },
  { q: 'Pick a superpower:', a: [
    { text: 'Instantly knowing every restaurant’s secret menu', type: 'foodie' },
    { text: 'Pausing time (for naps, obviously)', type: 'napper' },
    { text: 'A spotlight that follows me everywhere', type: 'star' },
    { text: 'Reading the mind of every person I’m confused by', type: 'owl' },
  ] },
  { q: 'Your idea of a perfect Friday evening:', a: [
    { text: 'Absolutely no plans, on purpose', type: 'napper' },
    { text: 'A plan I made on Monday, with a backup plan', type: 'dragon' },
    { text: 'Whatever happens when I say "one quick thing"', type: 'gremlin' },
    { text: 'Being the reason the party exists', type: 'star' },
  ] },
  { q: 'A colleague says "quick question…". Your body language:', a: [
    { text: 'Eyes widen, 3 theories already forming', type: 'owl' },
    { text: 'Smile, lean in: finally, an audience', type: 'star' },
    { text: 'Check the clock, check the snack drawer', type: 'foodie' },
    { text: 'Open a calendar invite named "Quick Question (45 min)"', type: 'dragon' },
  ] },
  { q: 'Choose a pet:', a: [
    { text: 'A raccoon that steals things on my behalf', type: 'gremlin' },
    { text: 'A very large, very lazy cat', type: 'napper' },
    { text: 'A parrot that repeats my best lines', type: 'star' },
    { text: 'A goat, because it eats everything and I respect that', type: 'foodie' },
  ] },
  { q: 'You find a button labelled "DO NOT PRESS". You…', a: [
    { text: 'Press it before I finish reading', type: 'gremlin' },
    { text: 'Read the manual, the warranty and the reviews first', type: 'owl' },
    { text: 'Assign someone to press it and report back', type: 'dragon' },
    { text: 'Sit next to it and eat a snack', type: 'foodie' },
  ] },
  { q: 'Your theme song would be…', a: [
    { text: 'An epic orchestral entrance', type: 'star' },
    { text: 'A calm lo-fi beat', type: 'napper' },
    { text: 'A ticking clock, but it is a good ticking clock', type: 'dragon' },
    { text: 'A song that plays 4 songs at once', type: 'gremlin' },
  ] },
  { q: 'How do you reply to a message at 11:58 PM?', a: [
    { text: 'Instantly, with 3 emojis and a meme', type: 'gremlin' },
    { text: 'Tomorrow, after I draft it 6 times', type: 'owl' },
    { text: 'Instantly, I was already awake and organised', type: 'dragon' },
    { text: 'What message? I was asleep at 9', type: 'napper' },
  ] },
  { q: 'The team lunch menu arrives. You…', a: [
    { text: 'Order for the whole table, no questions', type: 'foodie' },
    { text: 'Give a short speech about the menu', type: 'star' },
    { text: 'Compare every option for 25 minutes', type: 'owl' },
    { text: 'Say "anything is fine" and mean it', type: 'napper' },
  ] },
  { q: 'Pick a mode of transport:', a: [
    { text: 'A shopping trolley with a motor', type: 'gremlin' },
    { text: 'A helicopter with my name on it', type: 'star' },
    { text: 'A train: predictable, on schedule, with a snack trolley', type: 'dragon' },
    { text: 'A very slow boat. Nowhere to be.', type: 'napper' },
  ] },
  { q: 'What do you do when you’re stuck in a long queue?', a: [
    { text: 'Rank everyone around me by snack potential', type: 'foodie' },
    { text: 'Write a mental essay on why queues exist', type: 'owl' },
    { text: 'Start a conversation, then a debate, then a club', type: 'star' },
    { text: 'Quietly start a rumour that the line is moving', type: 'gremlin' },
  ] },
  { q: 'Your phone is at 3%. You…', a: [
    { text: 'Already carry a charger, a backup charger and a charging plan', type: 'dragon' },
    { text: 'Post a dramatic last story before the lights go out', type: 'star' },
    { text: 'Feel strangely peaceful. Finally, silence.', type: 'napper' },
    { text: 'Calculate precisely how long 3% will last', type: 'owl' },
  ] },
];

// ---------- helpers ----------

/** Fisher–Yates on a copy. */
export function shuffle<T>(arr: readonly T[], rng: Rng = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const pick = <T,>(arr: readonly T[], rng: Rng = Math.random): T => arr[Math.floor(rng() * arr.length)];

/** A fresh, random set of questions with shuffled answers, so every person (and every retry) differs. */
export function pickQuestions(rng: Rng = Math.random, n = QUESTION_COUNT): Question[] {
  return shuffle(QUESTIONS, rng).slice(0, n).map((q) => ({ ...q, a: shuffle(q.a, rng) }));
}

/** Most-chosen type wins; ties are broken randomly so results aren't biased by answer order. */
export function scoreAnswers(types: readonly TypeKey[], rng: Rng = Math.random): Archetype {
  const tally = new Map<TypeKey, number>();
  for (const t of types) tally.set(t, (tally.get(t) ?? 0) + 1);
  const best = Math.max(0, ...tally.values());
  const leaders = [...tally].filter(([, c]) => c === best).map(([t]) => t);
  return ARCHETYPES[leaders.length ? pick(leaders, rng) : pick(Object.keys(ARCHETYPES) as TypeKey[], rng)];
}

// ---------- random talk topics ----------
// Topic = template + randomly chosen slot words. Each type has its own flavour, plus a shared "wild card" pool,
// so the number of possible topics is in the thousands and two people almost never get the same one.

const SLOTS = {
  thing: ['a spoon', 'a traffic cone', 'a broken umbrella', 'a left sock', 'a stapler', 'the office printer', 'a mango', 'a pillow', 'a samosa', 'a cricket bat', 'a GPS voice', 'a mosquito'],
  place: ['a lift that never arrives', 'a train with no destination', 'a wedding buffet', 'a haunted ATM', 'the last row of a cinema', 'a roundabout at 2 AM', 'a very quiet library', 'a rooftop in the rain'],
  job: ['a retired superhero', 'a professional yawner', 'a wedding DJ for aliens', 'a ghost HR manager', 'a pigeon air-traffic controller', 'a stand-up comedian for plants', 'a tea taster for dragons', 'a human alarm clock'],
  food: ['biryani', 'filter coffee', 'a dosa', 'instant noodles', 'pani puri', 'a cold pizza slice', 'the last gulab jamun', 'a mystery sandwich'],
  crime: ['stole the last samosa', 'replied-all to the whole company', 'microwaved fish in the office', 'ate someone else’s lunch', 'rearranged the meeting room chairs', 'unplugged the router "to check something"'],
  verb: ['argue with', 'give a TED talk to', 'file a complaint about', 'write a love letter to', 'start a podcast about', 'negotiate with', 'teach a class on', 'apologise to'],
};

const TEMPLATES: Record<TypeKey, ((r: Rng) => string)[]> = {
  gremlin: [
    (r) => `You are a lawyer defending the person who ${pick(SLOTS.crime, r)}. Make your closing argument.`,
    (r) => `Explain, with full confidence, why ${pick(SLOTS.thing, r)} should run the company.`,
    (r) => `Pitch a startup that sells ${pick(SLOTS.thing, r)} to people who already own ${pick(SLOTS.thing, r)}.`,
    (r) => `You woke up in ${pick(SLOTS.place, r)} holding ${pick(SLOTS.thing, r)}. Tell us exactly what happened.`,
  ],
  foodie: [
    (r) => `Defend ${pick(SLOTS.food, r)} as the greatest invention in human history.`,
    (r) => `Review ${pick(SLOTS.food, r)} like a very serious, very dramatic food critic.`,
    (r) => `You may eat only ${pick(SLOTS.food, r)} for a year. Present your survival plan.`,
    (r) => `Break up with ${pick(SLOTS.food, r)} in the most emotional way possible.`,
  ],
  owl: [
    (r) => `Explain why ${pick(SLOTS.thing, r)} is a metaphor for modern life. Cite no sources.`,
    (r) => `You overthink for a living as ${pick(SLOTS.job, r)}. Describe your worst Monday.`,
    (r) => `Give a calm, 2-minute lecture titled "What ${pick(SLOTS.thing, r)} taught me about teamwork".`,
    (r) => `Debate yourself: is ${pick(SLOTS.food, r)} better than ${pick(SLOTS.food, r)}? Take both sides.`,
  ],
  star: [
    (r) => `Accept an award for "Best Performance by ${pick(SLOTS.thing, r)}". Cry a little.`,
    (r) => `You are ${pick(SLOTS.job, r)} and just got famous. Give your first press conference.`,
    (r) => `Narrate your own entrance into ${pick(SLOTS.place, r)} as a movie trailer.`,
    (r) => `Do a dramatic speech to ${pick(SLOTS.thing, r)} before leaving it forever.`,
  ],
  napper: [
    (r) => `Sell us the idea of doing absolutely nothing, using only ${pick(SLOTS.thing, r)} as proof.`,
    (r) => `Give a sleepy guided meditation set in ${pick(SLOTS.place, r)}.`,
    (r) => `You are ${pick(SLOTS.job, r)}. Describe your ideal lazy Sunday in detail.`,
    (r) => `Explain why naps are the real engine of the economy.`,
  ],
  dragon: [
    (r) => `Run a very serious 2-minute stand-up for ${pick(SLOTS.job, r)}. Blockers? Yes.`,
    (r) => `Present a 5-year roadmap for ${pick(SLOTS.thing, r)}, with KPIs.`,
    (r) => `Give a performance review to ${pick(SLOTS.thing, r)}. Be fair but firm.`,
    (r) => `Announce a mandatory company policy about ${pick(SLOTS.thing, r)}. Include penalties.`,
  ],
};

const WILDCARD: ((r: Rng) => string)[] = [
  (r) => `Talk about ${pick(SLOTS.thing, r)} as if it were your childhood best friend.`,
  (r) => { const v = pick(SLOTS.verb, r); return `${v[0].toUpperCase()}${v.slice(1)} ${pick(SLOTS.thing, r)}. You have 2 minutes.`; },
  (r) => `You are ${pick(SLOTS.job, r)}. Describe your day at work.`,
  (r) => `Tell the story of the day you met ${pick(SLOTS.thing, r)} in ${pick(SLOTS.place, r)}.`,
];

/** Picks a random topic in the person's flavour (about 1 in 4 is a wild card). Avoids repeating `avoid`. */
export function makeTopic(type: TypeKey, rng: Rng = Math.random, avoid?: string): string {
  let t = '';
  for (let i = 0; i < 6; i++) {
    t = rng() < 0.25 ? pick(WILDCARD, rng)(rng) : pick(TEMPLATES[type], rng)(rng);
    if (t !== avoid) break;
  }
  return t;
}
