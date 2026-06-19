import ToggleChip from "./ToggleChip";
import { t } from "../i18n";

interface SoundToggleProps {
  soundEnabled: boolean;
  bgmEnabled: boolean;
  onToggleSound: (next: boolean) => void;
  onToggleBgm: (next: boolean) => void;
}

/** Two chips: sound effects and background music. */
export default function SoundToggle({
  soundEnabled,
  bgmEnabled,
  onToggleSound,
  onToggleBgm,
}: SoundToggleProps) {
  return (
    <>
      <ToggleChip
        label={t("sfx")}
        icon="🔊"
        enabled={soundEnabled}
        onToggle={onToggleSound}
      />
      <ToggleChip
        label={t("bgm")}
        icon="🎵"
        enabled={bgmEnabled}
        onToggle={onToggleBgm}
      />
    </>
  );
}
