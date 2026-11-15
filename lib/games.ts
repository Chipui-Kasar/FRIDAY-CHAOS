// Content + generators for the extra party games (Identity Crisis, Hot Take, Would You Rather, Excuse Master).
// Pure functions with an injectable RNG, same as lib/vibe.ts. Edit the lists freely; nothing here is secret.
import { pick, shuffle, type Rng } from './vibe';

export type GameId = 'vibe' | 'identity' | 'hottake' | 'rather' | 'excuse';
export const GAMES: { id: GameId; emoji: string; name: string; blurb: string }[] = [
  { id: 'vibe', emoji: '🎲', name: 'Vibe Check', blurb: 'Answer 5 silly questions, find out what type of person you are, then talk about a random topic.' },
  { id: 'identity', emoji: '🎭', name: 'Identity Crisis', blurb: 'Get a ridiculous new identity, stay in character, then survive the mid-speech twist.' },
  { id: 'hottake', emoji: '🔥', name: 'Hot Take Roulette', blurb: 'You are randomly assigned FOR or AGAINST something silly. Defend it with a straight face.' },
  { id: 'rather', emoji: '🤔', name: 'Would You Rather?', blurb: 'Pick the lesser evil, then justify your choice to the room.' },
  { id: 'excuse', emoji: '🙈', name: 'Excuse Master', blurb: 'A disaster, a mandatory word, and 45 seconds to deliver the most convincing excuse ever.' },
];

// ---------- Identity Crisis ----------
export type Identity = { name: string; job: string; quirk: string; secret: string };

const ID = {
  name: ['Gopal', 'Bunty', 'Lakshmi Aunty', 'Captain Biscuit', 'Dr. Zorg', 'Sir Reginald', 'Madam Mango', 'Chintu', 'Professor Pickle', 'Big Raju'],
  job: ['a retired pigeon whisperer', 'a wedding caterer who hates weddings', 'a part-time ghost and full-time accountant', 'the world’s okayest astronaut', 'a motivational speaker for sleepy cats', 'a lift operator in a one-storey building', 'a detective who is afraid of mysteries', 'a stand-up comedian with no jokes', 'a tea-shop philosopher', 'a bus conductor from the future'],
  quirk: ['speaks only in questions', 'whispers every third word', 'treats every sentence like breaking news', 'ends everything with "…and that’s why I’m single"', 'is convinced everyone is a spy', 'narrates their own actions out loud', 'is always slightly out of breath', 'refers to themselves in the third person', 'cannot stop giving unsolicited advice'],
  secret: ['is secretly terrified of pigeons', 'secretly owes ₹50 to a goat', 'is secretly the best dancer in the city', 'has never actually watched a cricket match', 'is secretly a very good singer but only in lifts', 'once lost a staring contest to a cow and never recovered'],
};
export const INTERVIEW = [
  'What did you have for breakfast today?', 'What is your biggest regret?', 'Describe your perfect weekend.', 'What is your most unusual talent?',
  'Who is your hero, and why?', 'What would your enemies say about you?', 'How did you get your job?', 'What is the worst advice you have ever given?',
];

export function makeIdentity(rng: Rng = Math.random): Identity {
  return { name: pick(ID.name, rng), job: pick(ID.job, rng), quirk: pick(ID.quirk, rng), secret: pick(ID.secret, rng) };
}
/** The "crisis": a second identity that differs from the first. */
export function makeTwist(of: Identity, rng: Rng = Math.random): Identity {
  let t = makeIdentity(rng);
  for (let i = 0; i < 6 && (t.name === of.name || t.job === of.job); i++) t = makeIdentity(rng);
  return t;
}
export const nextQuestion = (rng: Rng = Math.random, avoid?: string) => {
  let q = pick(INTERVIEW, rng);
  for (let i = 0; i < 6 && q === avoid; i++) q = pick(INTERVIEW, rng);
  return q;
};

// ---------- Hot Take Roulette ----------
export const HOT_TAKES = [
  'Tea is better than coffee.', 'Pineapple belongs on pizza.', 'Monday meetings should be illegal.', 'Reply-all is a form of public speaking.',
  'Biryani is a personality, not a food.', 'The snooze button is the best invention of the century.', 'Cats are secretly running the world.',
  'Lunch before 11 AM is completely acceptable.', 'Group photos need at least 14 retakes.', 'Standing desks are just office gym memberships.',
  'Every meeting could have been a voice note.', 'Dogs should be allowed to vote.', 'Cold coffee is a crime.', 'Weekends should start on Thursday.',
];
export type HotTake = { statement: string; stance: 'FOR' | 'AGAINST' };
export function makeHotTake(rng: Rng = Math.random, avoid?: string): HotTake {
  let s = pick(HOT_TAKES, rng);
  for (let i = 0; i < 6 && s === avoid; i++) s = pick(HOT_TAKES, rng);
  return { statement: s, stance: rng() < 0.5 ? 'FOR' : 'AGAINST' };
}

// ---------- Would You Rather ----------
export const RATHER: [string, string][] = [
  ['Only whisper for a year', 'Only shout for a year'], ['Reply-all to every email', 'Never be able to send an email again'],
  ['Have a pet dinosaur that is always hungry', 'Have a pet dragon that is always sleepy'], ['Walk everywhere backwards', 'Talk everywhere in rhymes'],
  ['Eat biryani for every meal', 'Never eat biryani again'], ['Know exactly when you will die', 'Know exactly how you will die'],
  ['Be famous for something embarrassing', 'Be completely unknown but incredibly happy'], ['Have a rewind button for your life', 'Have a pause button for your life'],
  ['Fight one horse-sized duck', 'Fight a hundred duck-sized horses'], ['Always be 10 minutes late', 'Always be 2 hours early'],
  ['Have every ringtone be a goat scream', 'Have every notification be your boss’s voice'], ['Lose all your passwords every month', 'Lose all your socks every week'],
  ['Be a mid-level wizard', 'Be a very senior janitor of a magic school'], ['Have no internet for a month', 'Have no sleep for a week'],
];
/** A shuffled deck so questions don't repeat until all have been seen. */
export const ratherDeck = (rng: Rng = Math.random) => shuffle(RATHER, rng);

// ---------- Excuse Master ----------
export const SCENARIOS = [
  'You are two hours late to a wedding.', 'You did not submit the report that was due yesterday.', 'You ate the whole office cake.', 'You missed the 9 AM meeting you were hosting.',
  'You forgot your own birthday party.', 'You were found asleep on your keyboard during a client call.', 'You arrived at work wearing two different shoes.', 'You replied "love you too" to your manager.',
];
export const MUST_INCLUDE = ['a goat', 'a rainbow', 'your neighbour’s cousin', 'a mysterious phone call', 'a runaway auto', 'a sudden power cut', 'a cat named Tom', 'a very serious pigeon'];
export type Excuse = { scenario: string; include: string };
export function makeExcuse(rng: Rng = Math.random, avoid?: string): Excuse {
  let scenario = pick(SCENARIOS, rng);
  for (let i = 0; i < 6 && scenario === avoid; i++) scenario = pick(SCENARIOS, rng);
  return { scenario, include: pick(MUST_INCLUDE, rng) };
}
