/** Objects for the look-and-remember round (host screen at /look). Plain everyday things, simple English. */
export type Thing = { e: string; n: string };

export const THINGS: Thing[] = [
  ['⌚', 'Watch'], ['🔑', 'Key'], ['☂️', 'Umbrella'], ['🎒', 'School bag'], ['👓', 'Glasses'], ['📱', 'Mobile phone'], ['💻', 'Laptop'], ['🖱️', 'Mouse'],
  ['⌨️', 'Keyboard'], ['🎧', 'Headphones'], ['📷', 'Camera'], ['🔦', 'Torch'], ['🔋', 'Battery'], ['💡', 'Bulb'], ['🕯️', 'Candle'], ['🧲', 'Magnet'],
  ['✂️', 'Scissors'], ['📎', 'Paper clip'], ['📌', 'Pin'], ['📏', 'Ruler'], ['✏️', 'Pencil'], ['🖊️', 'Pen'], ['📒', 'Notebook'], ['📚', 'Books'],
  ['📰', 'Newspaper'], ['🧾', 'Bill'], ['💰', 'Money bag'], ['🪙', 'Coin'], ['💳', 'Card'], ['🎁', 'Gift'], ['🎈', 'Balloon'], ['🧸', 'Teddy bear'],
  ['🪁', 'Kite'], ['⚽', 'Football'], ['🏏', 'Cricket bat'], ['🏸', 'Badminton racket'], ['🎲', 'Dice'], ['🎸', 'Guitar'], ['🥁', 'Drum'], ['🎺', 'Trumpet'],
  ['☕', 'Coffee cup'], ['🍵', 'Tea cup'], ['🥛', 'Glass of milk'], ['🍴', 'Fork and knife'], ['🥄', 'Spoon'], ['🍽️', 'Plate'], ['🍳', 'Frying pan'], ['🧂', 'Salt'],
  ['🍎', 'Apple'], ['🍌', 'Banana'], ['🍇', 'Grapes'], ['🍉', 'Watermelon'], ['🍍', 'Pineapple'], ['🥭', 'Mango'], ['🍋', 'Lemon'], ['🥥', 'Coconut'],
  ['🥕', 'Carrot'], ['🌽', 'Corn'], ['🍅', 'Tomato'], ['🧅', 'Onion'], ['🌶️', 'Chilli'], ['🥚', 'Egg'], ['🍞', 'Bread'], ['🧀', 'Cheese'],
  ['🍕', 'Pizza'], ['🍔', 'Burger'], ['🍩', 'Doughnut'], ['🍪', 'Biscuit'], ['🍫', 'Chocolate'], ['🍦', 'Ice cream'], ['🎂', 'Cake'], ['🍿', 'Popcorn'],
  ['🪑', 'Chair'], ['🛏️', 'Bed'], ['🚪', 'Door'], ['🪞', 'Mirror'], ['🧹', 'Broom'], ['🪣', 'Bucket'], ['🧼', 'Soap'], ['🪥', 'Toothbrush'],
  ['🚿', 'Shower'], ['🛁', 'Bathtub'], ['🧻', 'Tissue roll'], ['🔨', 'Hammer'], ['🪛', 'Screwdriver'], ['🔧', 'Spanner'], ['🪚', 'Saw'], ['⚓', 'Anchor'],
  ['🚲', 'Bicycle'], ['🛵', 'Scooter'], ['🚗', 'Car'], ['🚌', 'Bus'], ['✈️', 'Aeroplane'], ['🚀', 'Rocket'], ['⛵', 'Boat'], ['🚁', 'Helicopter'],
  ['🐶', 'Dog'], ['🐱', 'Cat'], ['🐟', 'Fish'], ['🐢', 'Turtle'], ['🐘', 'Elephant'], ['🦋', 'Butterfly'], ['🐝', 'Bee'], ['🐓', 'Rooster'],
  ['🌻', 'Sunflower'], ['🌵', 'Cactus'], ['🍀', 'Clover'], ['⭐', 'Star'], ['🌙', 'Moon'], ['☀️', 'Sun'], ['☁️', 'Cloud'], ['🌈', 'Rainbow'],
  ['🦄', 'Unicorn'], ['🛸', 'UFO'], ['🥒', 'Zucchini'], ['🦓', 'Zebra'], ['🪀', 'Yo-yo'], ['🛥️', 'Yacht'], ['❓', 'Question mark'], ['🎻', 'Violin'], ['🌋', 'Volcano'], ['🧛', 'Vampire'],
  ['🧃', 'Juice box'], ['👖', 'Jeans'], ['🧥', 'Jacket'], ['🫙', 'Jar'], ['🚙', 'Jeep'], ['🪼', 'Jellyfish'], ['🦘', 'Kangaroo'], ['🪁', 'Kite 2'],
  ['🦁', 'Lion'], ['🪔', 'Lamp'], ['🍃', 'Leaf'], ['🍄', 'Mushroom'], ['🥭', 'Mango 2'], ['🗺️', 'Map'], ['🥜', 'Nuts'], ['👃', 'Nose'],
  ['📓', 'Notepad'], ['🐙', 'Octopus'], ['🍊', 'Orange'], ['🦉', 'Owl'], ['🐧', 'Penguin'], ['🥞', 'Pancake'], ['🍐', 'Pear'], ['🐇', 'Rabbit'],
  ['📻', 'Radio'], ['💍', 'Ring'], ['🪢', 'Rope'], ['🐍', 'Snake'], ['🥪', 'Sandwich'], ['🧵', 'Sewing thread'], ['🐅', 'Tiger'], ['🚜', 'Tractor'],
  ['📺', 'Television'], ['🎻', 'Violin 2'], ['🏆', 'Trophy'], ['🛶', 'Canoe'], ['🥁', 'Drum 2'], ['🦆', 'Duck'], ['🍆', 'Eggplant'], ['🦅', 'Eagle'],
  ['🪟', 'Window'], ['🍯', 'Honey'], ['🏠', 'House'], ['🐴', 'Horse'], ['🪖', 'Helmet'], ['🍨', 'Ice cream bowl'], ['🧊', 'Ice cube'], ['🧪', 'Test tube'],
  ['🥑', 'Avocado'], ['🪓', 'Axe'], ['🥓', 'Bacon'], ['🍚', 'Bowl of rice'], ['🐻', 'Bear'], ['🔔', 'Bell'], ['🕶️', 'Sunglasses'], ['🐪', 'Camel'], ['📞', 'Call phone'], ['🎠', 'Carousel'],
  ['👑', 'Crown'], ['🎩', 'Hat'], ['🧢', 'Cap'], ['👟', 'Shoe'], ['🧦', 'Socks'], ['🧣', 'Scarf'], ['🧤', 'Gloves'], ['👔', 'Tie'],
].map(([e, n]) => ({ e, n })).filter((t) => !/ \d$/.test(t.n));

const shuffle = <T,>(a: T[], rnd: () => number): T[] => {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; }
  return x;
};

/** `n` different random objects. */
export const pickThings = (n: number, rnd: () => number = Math.random): Thing[] => shuffle(THINGS, rnd).slice(0, n);

/**
 * Replace `k` objects with different ones that are NOT already on the list.
 * `changed` = positions that were swapped; `removed` = what used to be there.
 */
export function swapThings(list: Thing[], k = 3, rnd: () => number = Math.random) {
  const names = new Set(list.map((t) => t.n));
  const fresh = shuffle(THINGS.filter((t) => !names.has(t.n)), rnd);
  const changed = shuffle(list.map((_, i) => i), rnd).slice(0, k).sort((a, b) => a - b);
  const updated = [...list];
  const removed: Thing[] = [];
  changed.forEach((idx, j) => { removed.push(list[idx]); updated[idx] = fresh[j]; });
  return { updated, changed, removed };
}

/** Letters only, upper case: "Aarthi K" -> "AARTHI". Only the first word of a name is used. */
export const secretWord = (name: string) => (name.trim().split(/\s+/)[0] ?? '').toUpperCase().replace(/[^A-Z]/g, '');

/**
 * One different object per letter, in order, so the first letters spell `word`
 * (APPLE, JELLYFISH, ICE CUBE... -> AJI...). Returns null if a letter has no object left.
 */
export function objectsSpelling(word: string, rnd: () => number = Math.random): Thing[] | null {
  const used = new Set<string>();
  const out: Thing[] = [];
  for (const ch of word.toUpperCase()) {
    const options = shuffle(THINGS.filter((t) => t.n[0].toUpperCase() === ch && !used.has(t.n)), rnd);
    if (!options.length) return null;
    used.add(options[0].n);
    out.push(options[0]);
  }
  return out;
}
