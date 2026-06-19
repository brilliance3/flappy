import ToggleChip from "./ToggleChip";
import { t } from "../i18n";

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
      label={t("vibration")}
      icon="📳"
      enabled={enabled}
      onToggle={onToggle}
    />
  );
}
