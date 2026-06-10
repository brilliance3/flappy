import AdSlot from "./AdSlot";
import { SpriteIcon } from "./CharacterSelector";
import {
  getModeMeta,
  medalFor,
  type Character,
  type GameMode,
  type MedalTier,
} from "../types/game";

interface GameOverScreenProps {
  mode: GameMode;
  score: number;
  bestScore: number;
  isNewBest: boolean;
  character: Character;
  onRestart: () => void;
  onHome: () => void;
}

const MEDAL_STYLE: Record<Exclude<MedalTier, null>, { label: string; color: string }> = {
  gold: { label: "GOLD", color: "bg-yellow-300" },
  silver: { label: "SILVER", color: "bg-slate-200" },
  bronze: { label: "BRONZE", color: "bg-amber-500" },
};

export default function GameOverScreen({
  mode,
  score,
  bestScore,
  isNewBest,
  character,
  onRestart,
  onHome,
}: GameOverScreenProps) {
  const meta = getModeMeta(mode);
  const tier = medalFor(mode, score);
  const medal = tier ? MEDAL_STYLE[tier] : null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 animate-pop">
      <div className="w-full max-w-xs bg-white/90 rounded-3xl shadow-2xl p-5 flex flex-col items-center gap-3 border-4 border-white">
        <h2 className="text-lg text-rose-500 tracking-widest">GAME&nbsp;OVER</h2>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 tracking-widest">
          <span aria-hidden>{meta.badge}</span>
          <span>{meta.title}</span>
        </div>
        <div className="flex items-center justify-center h-12" aria-hidden>
          <SpriteIcon character={character} size={48} />
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

        <div className="w-full flex flex-col gap-2 mt-1">
          <button
            type="button"
            onClick={onRestart}
            className="w-full py-3 rounded-2xl bg-emerald-400 text-white text-xs tracking-widest shadow-[0_5px_0_rgb(16,185,129)] active:translate-y-[3px] active:shadow-[0_2px_0_rgb(16,185,129)] transition-all min-h-[44px]"
          >
            다시하기
          </button>
          <button
            type="button"
            onClick={onHome}
            className="w-full py-3 rounded-2xl bg-white text-slate-700 text-[10px] tracking-widest border-2 border-slate-300 active:translate-y-[2px] transition-all min-h-[44px]"
          >
            다른 모드 선택 · 홈으로
          </button>
        </div>
      </div>

      <div className="mt-3">
        <AdSlot placement="gameover-bottom" />
      </div>
    </div>
  );
}
