interface AdSlotProps {
  placement: "start-bottom" | "gameover-bottom" | "mode-bottom";
}

/**
 * Placeholder ad slot. Ads are only allowed on non-gameplay screens (start,
 * mode-select, game-over). No real ad code ships in the MVP — this just
 * reserves the space so layout is stable when ads are wired up later.
 */
export default function AdSlot({ placement }: AdSlotProps) {
  return (
    <div
      data-ad-placement={placement}
      className="w-full max-w-xs h-12 rounded-xl border border-dashed border-white/40 bg-white/10 flex items-center justify-center"
    >
      <span className="text-[8px] text-white/50 tracking-widest">
        AD&nbsp;·&nbsp;광고 영역
      </span>
    </div>
  );
}
