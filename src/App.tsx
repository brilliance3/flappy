import { useCallback, useEffect, useMemo, useState } from "react";
import GameCanvas from "./components/GameCanvas";
import StartScreen from "./components/StartScreen";
import GameOverScreen from "./components/GameOverScreen";
import { CHARACTERS } from "./components/CharacterSelector";
import type { Character, GameStatus } from "./types/game";
import {
  getBestScore,
  getSelectedCharacterId,
  saveBestScore,
  saveSelectedCharacterId,
} from "./utils/storage";

export default function App() {
  const [status, setStatus] = useState<GameStatus>("ready");
  const [bestScore, setBestScore] = useState<number>(() => getBestScore());
  const [lastScore, setLastScore] = useState<number>(0);
  const [isNewBest, setIsNewBest] = useState<boolean>(false);

  const initialCharacterId = useMemo(
    () => getSelectedCharacterId(CHARACTERS[0].id),
    [],
  );
  const [character, setCharacter] = useState<Character>(
    () =>
      CHARACTERS.find((c) => c.id === initialCharacterId) ?? CHARACTERS[0],
  );

  useEffect(() => {
    saveSelectedCharacterId(character.id);
  }, [character]);

  const handleStart = useCallback(() => {
    setLastScore(0);
    setIsNewBest(false);
    setStatus("playing");
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setLastScore(finalScore);
    const updatedBest = saveBestScore(finalScore);
    setBestScore(updatedBest);
    setIsNewBest(finalScore > 0 && finalScore === updatedBest);
    setStatus("gameover");
  }, []);

  const handleRestart = useCallback(() => {
    setLastScore(0);
    setIsNewBest(false);
    setStatus("playing");
  }, []);

  const handleChangeCharacter = useCallback(() => {
    setStatus("ready");
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6">
      {/* Mobile-first game stage — fixed 390x640 keeps the canvas pixel-perfect. */}
      <div
        className="relative w-[390px] h-[640px] max-w-full max-h-[100dvh] overflow-hidden rounded-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)]"
        style={{ aspectRatio: "390 / 640" }}
      >
        {/* The canvas is mounted only while playing so each playthrough starts fresh. */}
        {status === "playing" && (
          <GameCanvas character={character} onGameOver={handleGameOver} />
        )}

        {status === "ready" && (
          <StartScreen
            bestScore={bestScore}
            selectedCharacter={character}
            onSelectCharacter={setCharacter}
            onStart={handleStart}
          />
        )}

        {status === "gameover" && (
          <GameOverScreen
            score={lastScore}
            bestScore={bestScore}
            isNewBest={isNewBest}
            character={character}
            onRestart={handleRestart}
            onChangeCharacter={handleChangeCharacter}
          />
        )}
      </div>
    </div>
  );
}
