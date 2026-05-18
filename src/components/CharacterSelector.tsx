import type { Character } from "../types/game";

export const CHARACTERS: Character[] = [
  { id: "chick", name: "Chick", emoji: "🐤", color: "#ffd84d" },
  { id: "bat", name: "Bat", emoji: "🦇", color: "#7b6cf3" },
  { id: "drone", name: "Drone", emoji: "🚁", color: "#5ad1c8" },
  { id: "rocket", name: "Rocket", emoji: "🚀", color: "#ff7a7a" },
];

interface CharacterSelectorProps {
  selectedId: string;
  onSelect: (character: Character) => void;
}

export default function CharacterSelector({
  selectedId,
  onSelect,
}: CharacterSelectorProps) {
  return (
    <div className="w-full">
      <p className="text-[10px] text-white/90 mb-3 text-center tracking-wider">
        CHOOSE YOUR FLYER
      </p>
      <div className="grid grid-cols-4 gap-2">
        {CHARACTERS.map((character) => {
          const isSelected = character.id === selectedId;
          return (
            <button
              key={character.id}
              type="button"
              onClick={() => onSelect(character)}
              className={[
                "aspect-square rounded-2xl border-2 flex flex-col items-center justify-center",
                "transition-transform active:scale-95",
                isSelected
                  ? "bg-white/90 border-yellow-300 shadow-lg scale-105"
                  : "bg-white/30 border-white/40 hover:bg-white/50",
              ].join(" ")}
              aria-pressed={isSelected}
              aria-label={`Select ${character.name}`}
            >
              <span className="text-3xl" aria-hidden>
                {character.emoji}
              </span>
              <span
                className={[
                  "text-[8px] mt-1 tracking-wider",
                  isSelected ? "text-slate-800" : "text-white",
                ].join(" ")}
              >
                {character.name.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
