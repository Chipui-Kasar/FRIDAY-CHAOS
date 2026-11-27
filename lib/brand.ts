// Change the event name here; the whole app picks it up.
export const EVENT_NAME = 'Extempore Friday';
export const EVENT_EMOJI = '🎤';

// Shown to everyone, before and after their topic is revealed. Edit freely (not secret).
export const INSTRUCTIONS_TITLE = 'How to play';
export const INSTRUCTIONS: string[] = [
  'When the host calls your name, your topic unlocks. No peeking early, no prep.',
  'Stand up and speak on it for about one minute. Start talking straight away.',
  'Go all in: be dramatic, be funny, and commit to the bit. Keep the “say things like” lines handy if you freeze.',
  'No stopping, no “umm” marathons. If you run dry, make something up.',
  'Cheer for everyone, laugh with people, never at them. It’s all in good fun.',
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
