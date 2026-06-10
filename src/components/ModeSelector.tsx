import { GAME_MODES, type GameMode } from "../types/game";

interface ModeSelectorProps {
  selectedMode: GameMode;
  bestScores: Record<GameMode, number>;
  onSelect: (mode: GameMode) => void;
}

const DIFFICULTY_STYLE: Record<GameMode, string> = {
  sky: "bg-sky-300 text-sky-900",
  space: "bg-indigo-300 text-indigo-900",
  ocean: "bg-teal-300 text-teal-900",
};

export default function ModeSelector({
  selectedMode,
  bestScores,
  onSelect,
}: ModeSelectorProps) {
  return (
    <div className="w-full">
      <p className="text-[10px] text-white/90 mb-2 text-center tracking-wider">
        SELECT MODE
      </p>
      <div className="flex flex-col gap-2">
        {GAME_MODES.map((m) => {
          const isSelected = m.id === selectedMode;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m.id)}
              className={[
                "w-full text-left rounded-2xl border-2 px-3 py-2.5 flex items-center gap-3 min-h-[56px]",
                "transition-transform active:scale-[0.98]",
                isSelected
                  ? "bg-white/95 border-yellow-300 shadow-lg"
                  : "bg-white/25 border-white/30 hover:bg-white/40",
              ].join(" ")}
              aria-pressed={isSelected}
            >
              <span className="text-2xl shrink-0" aria-hidden>
                {m.badge}
              </span>
              <span className="flex-1 min-w-0">
                <span
                  className={[
                    "block text-[12px] tracking-wide truncate",
                    isSelected ? "text-slate-900" : "text-white",
                  ].join(" ")}
                >
                  {m.title}
                </span>
                <span
                  className={[
                    "block text-[9px] truncate",
                    isSelected ? "text-slate-500" : "text-white/80",
                  ].join(" ")}
                >
                  {m.subtitle}
                </span>
              </span>
              <span className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className={`text-[8px] px-1.5 py-0.5 rounded-full ${DIFFICULTY_STYLE[m.id]}`}
                >
                  {m.difficultyLabel}
                </span>
                <span
                  className={[
                    "text-[9px]",
                    isSelected ? "text-slate-600" : "text-white/80",
                  ].join(" ")}
                >
                  BEST {bestScores[m.id]}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
