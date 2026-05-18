import type { Character } from "../types/game";

interface GameOverScreenProps {
  score: number;
  bestScore: number;
  isNewBest: boolean;
  character: Character;
  onRestart: () => void;
  onChangeCharacter: () => void;
}

function medalFor(score: number): { label: string; color: string } | null {
  if (score >= 30) return { label: "GOLD", color: "bg-yellow-300" };
  if (score >= 20) return { label: "SILVER", color: "bg-slate-200" };
  if (score >= 10) return { label: "BRONZE", color: "bg-amber-500" };
  return null;
}

export default function GameOverScreen({
  score,
  bestScore,
  isNewBest,
  character,
  onRestart,
  onChangeCharacter,
}: GameOverScreenProps) {
  const medal = medalFor(score);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 animate-pop">
      <div className="w-full max-w-xs bg-white/90 rounded-3xl shadow-2xl p-6 flex flex-col items-center gap-4 border-4 border-white">
        <h2 className="text-lg text-rose-500 tracking-widest">GAME&nbsp;OVER</h2>
        <div className="text-5xl" aria-hidden>
          {character.emoji}
        </div>

        <div className="w-full grid grid-cols-2 gap-3">
          <div className="bg-sky-100 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[9px] text-slate-500 tracking-widest">
              SCORE
            </span>
            <span className="text-2xl text-slate-800">{score}</span>
          </div>
          <div className="bg-amber-100 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[9px] text-slate-500 tracking-widest">
              BEST
            </span>
            <span className="text-2xl text-slate-800">{bestScore}</span>
          </div>
        </div>

        {medal && (
          <div
            className={`flex items-center gap-2 ${medal.color} rounded-full px-4 py-1 shadow`}
          >
            <span className="text-xs" aria-hidden>
              🏅
            </span>
            <span className="text-[10px] tracking-widest text-slate-900">
              {medal.label}
            </span>
          </div>
        )}

        {isNewBest && (
          <p className="text-[10px] text-rose-500 tracking-widest animate-pulse">
            NEW&nbsp;BEST!
          </p>
        )}

        <div className="w-full flex flex-col gap-2 mt-2">
          <button
            type="button"
            onClick={onRestart}
            className="w-full py-3 rounded-2xl bg-emerald-400 text-white text-xs tracking-widest shadow-[0_5px_0_rgb(16,185,129)] active:translate-y-[3px] active:shadow-[0_2px_0_rgb(16,185,129)] transition-all"
          >
            RESTART
          </button>
          <button
            type="button"
            onClick={onChangeCharacter}
            className="w-full py-3 rounded-2xl bg-white text-slate-700 text-[10px] tracking-widest border-2 border-slate-300 active:translate-y-[2px] transition-all"
          >
            CHANGE&nbsp;CHARACTER
          </button>
        </div>
      </div>
    </div>
  );
}
