import ToggleChip from "./ToggleChip";

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
        label="효과음"
        icon="🔊"
        enabled={soundEnabled}
        onToggle={onToggleSound}
      />
      <ToggleChip
        label="배경음"
        icon="🎵"
        enabled={bgmEnabled}
        onToggle={onToggleBgm}
      />
    </>
  );
}
