import ToggleChip from "./ToggleChip";

interface VibrationToggleProps {
  enabled: boolean;
  onToggle: (next: boolean) => void;
}

export default function VibrationToggle({
  enabled,
  onToggle,
}: VibrationToggleProps) {
  return (
    <ToggleChip
      label="진동"
      icon="📳"
      enabled={enabled}
      onToggle={onToggle}
    />
  );
}
