'use client';
import { useState } from 'react';
import { GAMES, type GameId } from '../lib/games';
import { ExcuseMaster, HotTakeRoulette, IdentityCrisis, WouldYouRather } from './Games';
import VibeCheck from './VibeCheck';

const VIEWS: Record<GameId, React.ComponentType> = {
  vibe: VibeCheck, identity: IdentityCrisis, hottake: HotTakeRoulette, rather: WouldYouRather, excuse: ExcuseMaster,
};

/** "Pick a game" menu. Entertainment only: nothing is stored or sent to the server. */
export default function GameHub() {
  const [id, setId] = useState<GameId | null>(null);
  const game = id ? GAMES.find((g) => g.id === id)! : null;
  const View = id ? VIEWS[id] : null;

  return (
    <section className="vibe" aria-live="polite">
      {game && View ? (
        <>
          <div className="vhead">
            <button type="button" className="ghost" onClick={() => setId(null)}>← All games</button>
            <h2>{game.emoji} {game.name}</h2>
          </div>
          <View />
        </>
      ) : (
        <>
          <h2>🎮 Pick a game</h2>
          <p className="vtext">Waiting around? Choose one. Each game gives you something different every time.</p>
          <div className="vgames">
            {GAMES.map((g) => (
              <button type="button" key={g.id} className="vgame" onClick={() => setId(g.id)}>
                <span className="vgemoji" aria-hidden>{g.emoji}</span>
                <span><b>{g.name}</b><small>{g.blurb}</small></span>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
