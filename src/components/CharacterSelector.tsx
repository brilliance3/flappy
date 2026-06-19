import { useEffect, useRef } from "react";
import type { Character, GameMode } from "../types/game";
import { t } from "../i18n";
import {
  drawBat,
  drawBird,
  drawPlane,
  drawSatellite,
  drawShuttle,
  drawSubmarine,
  drawTurtle,
} from "./characterSprites";

const Q = Math.PI / 4; // quarter turn used to point "up-right" emojis rightward

export const CHARACTERS: Character[] = [
  // Sky — full side-view sprites (emoji read poorly here).
  { id: "chick", name: "Bird", emoji: "🐦", color: "#ffd84d", recommendedModes: ["sky"], sprite: drawBird },
  { id: "bat", name: "Bat", emoji: "🦇", color: "#7b6cf3", recommendedModes: ["sky"], sprite: drawBat },
  { id: "bee", name: "Bee", emoji: "🐝", color: "#fbbf24", recommendedModes: ["sky"], flipX: true },
  { id: "plane", name: "Paper Plane", emoji: "✈️", color: "#93c5fd", recommendedModes: ["sky"], sprite: drawPlane },
  // Space
  { id: "rocket", name: "Rocket", emoji: "🚀", color: "#ff7a7a", recommendedModes: ["space"], baseRotation: Q },
  { id: "shuttle", name: "Space Shuttle", emoji: "🚀", color: "#e2e8f0", recommendedModes: ["space"], sprite: drawShuttle },
  { id: "ufo", name: "UFO", emoji: "🛸", color: "#a78bfa", recommendedModes: ["space"] },
  { id: "satellite", name: "Satellite", emoji: "🛰️", color: "#94a3b8", recommendedModes: ["space"], sprite: drawSatellite },
  // Ocean
  { id: "fish", name: "Fish", emoji: "🐠", color: "#fb923c", recommendedModes: ["ocean"], flipX: true },
  { id: "jellyfish", name: "Jellyfish", emoji: "🪼", color: "#f0abfc", recommendedModes: ["ocean"] },
  { id: "turtle", name: "Turtle", emoji: "🐢", color: "#34d399", recommendedModes: ["ocean"], sprite: drawTurtle },
  { id: "submarine", name: "Submarine", emoji: "🛥️", color: "#facc15", recommendedModes: ["ocean"], sprite: drawSubmarine },
];

/** Characters belonging to a given mode (always 4). */
export function charactersForMode(mode: GameMode): Character[] {
  return CHARACTERS.filter((c) => c.recommendedModes?.includes(mode));
}

/** First (default) character for a mode. */
export function defaultCharacterForMode(mode: GameMode): Character {
  return charactersForMode(mode)[0];
}

/**
 * Renders a character's preview: its custom sprite on a small canvas, or the
 * emoji when it has none. Keeps menus consistent with what shows in-game.
 */
export function SpriteIcon({
  character,
  size = 30,
}: {
  character: Character;
  size?: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const sprite = character.sprite;
    if (!canvas || !sprite) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.scale(size / 60, size / 60); // sprites span ≈ ±28 units
    sprite(ctx, 18);
    ctx.restore();
  }, [character, size]);

  if (!character.sprite) {
    return (
      <span style={{ fontSize: size * 0.8, lineHeight: 1 }} aria-hidden>
        {character.emoji}
      </span>
    );
  }
  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

interface CharacterSelectorProps {
  selectedId: string;
  mode: GameMode;
  onSelect: (character: Character) => void;
}

export default function CharacterSelector({
  selectedId,
  mode,
  onSelect,
}: CharacterSelectorProps) {
  const list = charactersForMode(mode);
  return (
    <div className="w-full">
      <p className="text-[10px] text-white/90 mb-2 text-center tracking-wider">
        {t("choose_flyer")}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {list.map((character) => {
          const isSelected = character.id === selectedId;
          return (
            <button
              key={character.id}
              type="button"
              onClick={() => onSelect(character)}
              className={[
                "aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5",
                "transition-transform active:scale-95",
                isSelected
                  ? "bg-white/90 border-yellow-300 shadow-lg scale-105"
                  : "bg-white/30 border-white/40 hover:bg-white/50",
              ].join(" ")}
              aria-pressed={isSelected}
              aria-label={t(`char_${character.id}`)}
            >
              <span className="flex items-center justify-center h-8" aria-hidden>
                <SpriteIcon character={character} size={30} />
              </span>
              <span
                className={[
                  "text-[7px] tracking-wide leading-none text-center px-0.5",
                  isSelected ? "text-slate-700" : "text-white/90",
                ].join(" ")}
              >
                {t(`char_${character.id}`).toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
