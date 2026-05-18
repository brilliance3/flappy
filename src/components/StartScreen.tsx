import CharacterSelector from "./CharacterSelector";
import type { Character } from "../types/game";

interface StartScreenProps {
  bestScore: number;
  selectedCharacter: Character;
  onSelectCharacter: (character: Character) => void;
  onStart: () => void;
}

export default function StartScreen({
  bestScore,
  selectedCharacter,
  onSelectCharacter,
  onStart,
}: StartScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between py-10 px-6 z-10 animate-pop">
      <div className="flex flex-col items-center">
        <h1 className="text-2xl text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.25)] tracking-widest text-center leading-tight">
          TAP WING
          <br />
          RUNNER
        </h1>
        <p className="mt-3 text-[9px] text-white/80 tracking-widest">
          A CLOUD-HOPPING ADVENTURE
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div
          className="text-7xl animate-floaty drop-shadow-[0_6px_0_rgba(0,0,0,0.15)]"
          aria-hidden
        >
          {selectedCharacter.emoji}
        </div>
        <div className="text-[10px] text-white/80 tracking-widest mt-1">
          BEST&nbsp;SCORE
        </div>
        <div className="text-2xl text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.25)]">
          {bestScore}
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-5">
        <CharacterSelector
          selectedId={selectedCharacter.id}
          onSelect={(c) => {
            onSelectCharacter(c);
          }}
        />
        <button
          type="button"
          onClick={onStart}
          className="w-full max-w-xs py-4 rounded-2xl bg-yellow-300 text-slate-900 text-sm tracking-widest shadow-[0_6px_0_rgb(234,179,8)] active:translate-y-[3px] active:shadow-[0_3px_0_rgb(234,179,8)] transition-all"
        >
          TAP TO START
        </button>
        <p className="text-[8px] text-white/70 tracking-widest text-center">
          TAP&nbsp;·&nbsp;CLICK&nbsp;·&nbsp;SPACE&nbsp;TO&nbsp;FLAP
        </p>
      </div>
    </div>
  );
}
