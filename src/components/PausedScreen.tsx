import SoundToggle from "./SoundToggle";
import VibrationToggle from "./VibrationToggle";
import { getModeMeta, type GameMode } from "../types/game";
import { t } from "../i18n";

interface PausedScreenProps {
  mode: GameMode;
  soundEnabled: boolean;
  bgmEnabled: boolean;
  vibrationEnabled: boolean;
  onToggleSound: (next: boolean) => void;
  onToggleBgm: (next: boolean) => void;
  onToggleVibration: (next: boolean) => void;
  onResume: () => void;
  onHome: () => void;
}

export default function PausedScreen({
  mode,
  soundEnabled,
  bgmEnabled,
  vibrationEnabled,
  onToggleSound,
  onToggleBgm,
  onToggleVibration,
  onResume,
  onHome,
}: PausedScreenProps) {
  const meta = getModeMeta(mode);

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 px-8 bg-black/45 backdrop-blur-sm animate-pop">
      <h2 className="text-lg text-white tracking-widest">{t("paused")}</h2>
      <p className="text-[10px] text-white/80 tracking-widest">
        {meta.badge} {t(`${mode}_title`)}
      </p>

      <div className="w-full flex flex-nowrap items-center justify-center gap-1.5">
        <SoundToggle
          soundEnabled={soundEnabled}
          bgmEnabled={bgmEnabled}
          onToggleSound={onToggleSound}
          onToggleBgm={onToggleBgm}
        />
        <VibrationToggle enabled={vibrationEnabled} onToggle={onToggleVibration} />
      </div>

      <div className="w-full max-w-xs flex flex-col gap-2 mt-2">
        <button
          type="button"
          onClick={onResume}
          className="w-full py-3 rounded-2xl bg-yellow-300 text-slate-900 text-xs tracking-widest min-h-[44px] active:translate-y-[2px] transition-all"
        >
          {t("resume")}
        </button>
        <button
          type="button"
          onClick={onHome}
          className="w-full py-3 rounded-2xl bg-white/90 text-slate-700 text-[10px] tracking-widest min-h-[44px] active:translate-y-[2px] transition-all"
        >
          {t("home")}
        </button>
      </div>
    </div>
  );
}
