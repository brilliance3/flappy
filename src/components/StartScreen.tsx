import CharacterSelector, { SpriteIcon } from "./CharacterSelector";
import ModeSelector from "./ModeSelector";
import SoundToggle from "./SoundToggle";
import VibrationToggle from "./VibrationToggle";
import AdSlot from "./AdSlot";
import { getModeMeta, type Character, type GameMode } from "../types/game";

interface StartScreenProps {
  mode: GameMode;
  bestScores: Record<GameMode, number>;
  selectedCharacter: Character;
  soundEnabled: boolean;
  bgmEnabled: boolean;
  vibrationEnabled: boolean;
  onSelectMode: (mode: GameMode) => void;
  onSelectCharacter: (character: Character) => void;
  onToggleSound: (next: boolean) => void;
  onToggleBgm: (next: boolean) => void;
  onToggleVibration: (next: boolean) => void;
  onStart: () => void;
}

export default function StartScreen({
  mode,
  bestScores,
  selectedCharacter,
  soundEnabled,
  bgmEnabled,
  vibrationEnabled,
  onSelectMode,
  onSelectCharacter,
  onToggleSound,
  onToggleBgm,
  onToggleVibration,
  onStart,
}: StartScreenProps) {
  const meta = getModeMeta(mode);

  return (
    <div className="absolute inset-0 z-10 overflow-y-auto animate-pop">
      <div className="min-h-full flex flex-col items-center gap-3 px-5 py-5">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.25)] tracking-widest text-center leading-tight">
            TAP TAP TAP
          </h1>
          <p className="mt-1 text-[8px] text-white/80 tracking-widest">
            3-MODE TAP ACTION RUNNER
          </p>
        </div>

        <div
          className="animate-floaty drop-shadow-[0_6px_0_rgba(0,0,0,0.15)] flex items-center justify-center h-16"
          aria-hidden
        >
          <SpriteIcon character={selectedCharacter} size={64} />
        </div>

        <ModeSelector
          selectedMode={mode}
          bestScores={bestScores}
          onSelect={onSelectMode}
        />

        <p className="text-[9px] text-white/90 text-center px-2">
          {meta.controlHint}
        </p>

        <CharacterSelector
          selectedId={selectedCharacter.id}
          mode={mode}
          onSelect={onSelectCharacter}
        />

        <div className="w-full flex flex-wrap items-center justify-center gap-2">
          <SoundToggle
            soundEnabled={soundEnabled}
            bgmEnabled={bgmEnabled}
            onToggleSound={onToggleSound}
            onToggleBgm={onToggleBgm}
          />
          <VibrationToggle
            enabled={vibrationEnabled}
            onToggle={onToggleVibration}
          />
        </div>

        <button
          type="button"
          onClick={onStart}
          className="w-full max-w-xs py-4 rounded-2xl bg-yellow-300 text-slate-900 text-sm tracking-widest shadow-[0_6px_0_rgb(234,179,8)] active:translate-y-[3px] active:shadow-[0_3px_0_rgb(234,179,8)] transition-all min-h-[44px]"
        >
          TAP TO START
        </button>

        <AdSlot placement="start-bottom" />
      </div>
    </div>
  );
}
