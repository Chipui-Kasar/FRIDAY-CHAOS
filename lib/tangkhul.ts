/**
 * Content for the Tangkhul language games (host screen at /tangkhul).
 *
 * SOURCE: words below were read from https://dictionary.tangkhullyrics.com/ (Tangkhul English Dictionary).
 * That dictionary is an older, written-form reference; spoken/modern dialects can differ. The host should
 * glance through this list and fix anything that does not match their own dialect.
 * Wrong options are made up by us on purpose (they are English, not Tangkhul).
 * `say` (pronunciation hint) is optional: add it only if you are sure.
 */
export type Item = {
  tangkhul: string; meaning: string; wrong: [string, string];
  say?: string; fun?: string; // fun = funny fact the host reads after the reveal
};
export type Round = { title: string; items: Item[] };
export type Scenario = { title: string; situation: string; item: Item; twist: string };

const w = (tangkhul: string, meaning: string, wrong: [string, string], extra: Partial<Item> = {}): Item => ({ tangkhul, meaning, wrong, ...extra });

/** Mode 1: Word Guess. */
export const CHALLENGE: Round[] = [
  { title: 'Round 1: Everyday words', items: [
    w('zāt', 'cooked rice', ['a type of bus', 'a loud sneeze']),
    w('khai', 'fish', ['a hat', 'a mountain']),
    w('fa̱', 'dog', ['a tiger', 'a spoon']),
    w('machi', 'salt', ['a market', 'a mosquito']),
    w('kaphā', 'good', ['late', 'sleepy']),
  ] },
  { title: 'Round 2: Family, numbers and more', items: [
    w('āva', 'mother', ['uncle', 'teacher']),
    w('āvā', 'father', ['neighbour', 'boss']),
    w('kapi', 'sleep', ['dance', 'sing']),
    w('Kathum', 'three', ['seven', 'ten']),
    w('kakhanang', 'sorry', ['thank you', 'good morning']),
  ] },
  { title: 'Round 3: Food, animals and more', items: [
    w('harra', 'egg', ['hen', 'plate']),
    w('kasāthei', 'chilli', ['tomato', 'ginger']),
    w('Hok', 'pig', ['hook', 'hockey']),
    w('kachāng', 'moon', ['sun', 'cloud']),
    w('āming', 'name', ['money', 'morning']),
    w('kharā', 'come', ['go', 'wait']),
    w('phangā', 'five', ['fan', 'fine']),
    w('mati', 'four', ['mat', 'forty']),
  ] },
];

/** Mode 2: Survival test. The word is what you hear or need; everyone guesses it. Words here must NOT appear in CHALLENGE. */
export const SURVIVAL: Scenario[] = [
  { title: 'You are thirsty', situation: 'It is very hot and you need something to drink. Someone points at the well and says one word.', item: w('rashāng', 'cold water', ['hot tea', 'a bucket']), twist: 'The well is very deep and you only have a spoon.' },
  { title: 'Meeting a new friend', situation: 'A villager puts an arm around you and says one word with a big smile.', item: w('itao', 'friend', ['stranger', 'tourist']), twist: 'Now they introduce you to their whole family as "my best friend".' },
  { title: 'Grandma has arrived', situation: 'Everyone stands up and says one word as an elderly lady walks in.', item: w('āyi', 'grandmother', ['neighbour', 'doctor']), twist: 'She asks if you have eaten. You have. She does not believe you.' },
  { title: 'Respect your elders', situation: 'An old man enters and the children whisper one word.', item: w('āwo', 'grandfather', ['uncle', 'teacher']), twist: 'He tells you a very long story. You must look extremely interested.' },
  { title: 'Everyone is laughing', situation: 'The whole table bursts out and someone says one word to you.', item: w('khamana̱', 'laugh', ['cry', 'sneeze']), twist: 'You do not know why they are laughing. Laugh along anyway, convincingly.' },
  { title: 'Dance floor', situation: 'Music starts and a cousin pulls you up, shouting one word.', item: w('lumlao', 'dance', ['sing', 'sit']), twist: 'You must dance for 10 seconds. No excuses.' },
  { title: 'Love is in the air', situation: 'Someone is singing a song, and the one word in it keeps repeating.', item: w('khalum', 'love', ['anger', 'hunger']), twist: 'They point at you during the chorus.' },
  { title: 'A warm welcome', situation: 'You arrive at a house and everyone cheers one phrase at the door.', item: w('ning khamahai', 'welcome', ['go away', 'be careful']), twist: 'They have prepared a speech about you. You did not know.' },
  { title: 'Building day', situation: 'The whole village is working together. Someone hands you a tool and says one word.', item: w('shimkasā', 'build a house', ['cook a meal', 'catch a fish']), twist: 'You are made the supervisor, and you have never built anything.' },
  { title: 'Wake-up call', situation: 'At sunrise someone shouts one word through the door and a rooster crows loudly.', item: w('harnao', 'chicken', ['bicycle', 'umbrella']), twist: 'The chicken is inside the room. Act out how you handle it.' },
  { title: 'Campfire', situation: 'It is getting cold. A friend crouches down and says one word while rubbing their hands.', item: w('mei', 'fire', ['rain', 'blanket']), twist: 'You are in charge of the fire, and you have no matches. Act out how you start it.' },
  { title: 'Stargazing', situation: 'You are sitting outside at night and a child points at the sky and says one word.', item: w('sirā', 'star', ['plane', 'cloud']), twist: 'The child asks you to name all of them. You must invent names.' },
  { title: 'Mountain trek', situation: 'You are on a long walk. The guide points far ahead and says one word.', item: w('Kaphung', 'mountain', ['river', 'bridge']), twist: 'The guide says "just a small hill" and you must climb it. Act out the climb.' },
  { title: 'Look at me', situation: 'Someone points at their own face and says one word.', item: w('mik', 'eye', ['nose', 'ear']), twist: 'You must stare at the person next to you for 5 seconds without laughing.' },
  { title: 'A little visitor', situation: 'A small one tugs your sleeve and says a word.', item: w('naoshinao', 'child', ['elder', 'guest']), twist: 'The child wants you to play hide and seek. You are very bad at hiding.' },
  { title: 'Time for a drink', situation: 'Someone hands you a cup and says one word.', item: w('khamang', 'drink', ['eat', 'wash']), twist: 'It is much stronger than you expected. React with your whole body.' },
  { title: 'Cow in the road', situation: 'You are walking in the village and a farmer waves his arms and shouts one word.', item: w('simuk', 'cow', ['goat', 'horse']), twist: 'The cow will not move. Act out how you convince it.' },
  { title: 'Late night', situation: 'It is dark outside. Your host says one word and shows you where to sleep.', item: w('ngayāshong', 'night', ['morning', 'noon']), twist: 'There is only one blanket and four guests.' },
];

/** Bonus challenges, read out by the host. */
export const BONUS = {
  challenge: 'Use a newly learned Tangkhul word in a funny English sentence. Best sentence gets 3 bonus points.',
  blank: 'Introduce yourself to the room in Tangkhul, with a big smile and a very confident voice. Funniest introduction gets 3 bonus points.',
  survival: 'No options this time. Pick a situation and try to communicate using only the Tangkhul words you learned today.',
};

/** Funny ways to say the word. Generic, no language knowledge needed. */
export const STYLES = [
  'Say it like a news anchor announcing breaking news.',
  'Whisper it like a secret agent.',
  'Say it like you are the hero in a Tamil movie fight scene.',
  'Say it like a mother calling you for dinner.',
  'Say it with a very serious meeting-room face.',
  'Sing it in the style of a film song.',
  'Say it like you just won the lottery.',
  'Say it very slowly, like a robot that is low on battery.',
  'Say it like your manager approved your leave.',
  'Shout it from the back of the room like the cricket crowd.',
];

export const GOOD = ['Excellent! Tangkhul elders would be proud.', 'Very good! You are a natural.', 'Nice! Now say it again, louder.', 'Perfect! Someone give this person a rice beer. Just kidding, tea.'];
export const TRY = ['Close! The word is shaking its head politely.', 'Brave attempt! The word does not recognise itself.', 'Almost! Try again, slower.', 'That was creative. It was also a new word.'];

export const pick = <T,>(arr: readonly T[], rnd: () => number = Math.random): T => arr[Math.floor(rnd() * arr.length)];

/** Options A/B/C with the correct answer at a random position. Returns the options and the index of the right one. */
export function options(item: Item, rnd: () => number = Math.random): { list: string[]; correct: number } {
  const list = [item.meaning, ...item.wrong];
  for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
  return { list, correct: list.indexOf(item.meaning) };
}
