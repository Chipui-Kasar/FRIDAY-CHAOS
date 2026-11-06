// Change the event name here; the whole app picks it up.
export const EVENT_NAME = 'Undercover Friday';
export const EVENT_EMOJI = '🕵️';

// Shown to everyone AFTER they reveal their character. Edit freely (not secret).
export const INSTRUCTIONS_TITLE = 'How to play';
export const INSTRUCTIONS: string[] = [
  'Stay in character when it’s your turn: voice, attitude, everything.',
  'Never say your character out loud. Let people guess it from how you act.',
  'Don’t show your screen to anyone, and keep it secret until the reveal.',
  'Be creative, be funny, and stay kind. It’s all in good fun.',
];

// Picks an emoji for a character by keyword. First match wins; edit/add freely.
const EMOJI_RULES: [RegExp, string][] = [
  [/billionaire|millionaire/i, '💸'], [/alien/i, '👽'], [/politician/i, '🗳️'], [/motivational/i, '📢'],
  [/detective/i, '🕵️'], [/ceo/i, '💼'], [/reporter|news/i, '🎤'], [/celebrity/i, '🌟'], [/teacher/i, '🍎'],
  [/robot/i, '🤖'], [/customer/i, '😠'], [/fitness|trainer/i, '🏋️'], [/time travel/i, '⏳'],
  [/restaurant|chef/i, '🍽️'], [/lawyer|potato/i, '🥔'], [/king|queen/i, '👑'],
  [/pirate/i, '🏴‍☠️'], [/bus driver/i, '🚌'],
];
export const emojiFor = (text: string) => EMOJI_RULES.find(([re]) => re.test(text))?.[1] ?? '🎭';
