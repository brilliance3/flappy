interface ToggleChipProps {
  label: string;
  icon: string;
  enabled: boolean;
  onToggle: (next: boolean) => void;
}

/** Small pill toggle used for sound / bgm / vibration settings. */
export default function ToggleChip({
  label,
  icon,
  enabled,
  onToggle,
}: ToggleChipProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!enabled)}
      aria-pressed={enabled}
      className={[
        "flex items-center gap-1 rounded-full px-2.5 min-h-[40px] min-w-0 border-2 text-[10px] tracking-wide",
        "transition-transform active:scale-95",
        enabled
          ? "bg-white/90 border-yellow-300 text-slate-800"
          : "bg-white/20 border-white/30 text-white/70",
      ].join(" ")}
    >
      <span className="shrink-0" aria-hidden>
        {icon}
      </span>
      <span className="truncate">{label}</span>
      <span
        className={[
          "ml-0.5 text-[8px] px-1 py-0.5 rounded-full shrink-0",
          enabled ? "bg-emerald-400 text-white" : "bg-slate-500/60 text-white",
        ].join(" ")}
      >
        {enabled ? "ON" : "OFF"}
      </span>
    </button>
  );
}
