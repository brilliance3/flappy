import { useCallback, useEffect, useMemo, useState } from "react";
import GameCanvas from "./components/GameCanvas";
import StartScreen from "./components/StartScreen";
import GameOverScreen from "./components/GameOverScreen";
import PausedScreen from "./components/PausedScreen";
import {
  CHARACTERS,
  defaultCharacterForMode,
} from "./components/CharacterSelector";
import {
  type Character,
  type GameMode,
  type GameStatus,
} from "./types/game";
import { audioManager } from "./audio/audioManager";
import {
  isVibrationEnabled,
  setVibrationEnabled,
  vibratePattern,
} from "./utils/vibration";
import {
  getBestScore,
  getBgmEnabled,
  getSelectedCharacterId,
  getSelectedMode,
  getSoundEnabled,
  saveBestScore,
  saveBgmEnabled,
  saveSelectedCharacterId,
  saveSelectedMode,
  saveSoundEnabled,
} from "./utils/storage";

function loadBestScores(): Record<GameMode, number> {
  return {
    sky: getBestScore("sky"),
    space: getBestScore("space"),
    ocean: getBestScore("ocean"),
  };
}

export default function App() {
  const [status, setStatus] = useState<GameStatus>("ready");
  const [mode, setMode] = useState<GameMode>(() => getSelectedMode("sky"));
  const [bestScores, setBestScores] = useState<Record<GameMode, number>>(
    () => loadBestScores(),
  );
  const [lastScore, setLastScore] = useState<number>(0);
  const [isNewBest, setIsNewBest] = useState<boolean>(false);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() =>
    getSoundEnabled(),
  );
  const [bgmEnabled, setBgmEnabled] = useState<boolean>(() => getBgmEnabled());
  const [vibrationEnabled, setVibrationOn] = useState<boolean>(() =>
    isVibrationEnabled(),
  );
  // Remember a character per mode so switching modes keeps a valid selection.
  const [modeCharIds, setModeCharIds] = useState<Record<GameMode, string>>(
    () => {
      const ids: Record<GameMode, string> = {
        sky: defaultCharacterForMode("sky").id,
        space: defaultCharacterForMode("space").id,
        ocean: defaultCharacterForMode("ocean").id,
      };
      const saved = CHARACTERS.find((c) => c.id === getSelectedCharacterId(""));
      const savedMode = saved?.recommendedModes?.[0];
      if (saved && savedMode) ids[savedMode] = saved.id;
      return ids;
    },
  );

  const character = useMemo<Character>(() => {
    const id = modeCharIds[mode];
    return CHARACTERS.find((c) => c.id === id) ?? defaultCharacterForMode(mode);
  }, [mode, modeCharIds]);

  const handleSelectCharacter = useCallback(
    (c: Character) => {
      setModeCharIds((prev) => ({ ...prev, [mode]: c.id }));
      saveSelectedCharacterId(c.id);
    },
    [mode],
  );

  useEffect(() => {
    saveSelectedMode(mode);
  }, [mode]);

  const tapFeedback = useCallback(() => {
    audioManager.play("button");
    vibratePattern("button");
  }, []);

  /* ---------- Settings toggles ---------- */

  const handleToggleSound = useCallback((next: boolean) => {
    setSoundEnabled(next);
    saveSoundEnabled(next);
    audioManager.setSoundEnabled(next);
  }, []);

  const handleToggleBgm = useCallback((next: boolean) => {
    setBgmEnabled(next);
    saveBgmEnabled(next);
    audioManager.setBgmEnabled(next);
  }, []);

  const handleToggleVibration = useCallback((next: boolean) => {
    setVibrationOn(next);
    setVibrationEnabled(next);
    if (next) vibratePattern("button");
  }, []);

  /* ---------- Flow ---------- */

  const beginPlay = useCallback(() => {
    audioManager.unlock();
    audioManager.playBgm(mode);
    setLastScore(0);
    setIsNewBest(false);
    setStatus("playing");
  }, [mode]);

  const handleStart = useCallback(() => {
    tapFeedback();
    beginPlay();
  }, [tapFeedback, beginPlay]);

  const handleRestart = useCallback(() => {
    tapFeedback();
    beginPlay();
  }, [tapFeedback, beginPlay]);

  const handleGameOver = useCallback(
    (finalScore: number) => {
      audioManager.stopBgm();
      audioManager.play("gameover");
      vibratePattern("gameover");
      setLastScore(finalScore);
      const updatedBest = saveBestScore(mode, finalScore);
      setBestScores((prev) => ({ ...prev, [mode]: updatedBest }));
      setIsNewBest(finalScore > 0 && finalScore === updatedBest);
      setStatus("gameover");
    },
    [mode],
  );

  const handleHome = useCallback(() => {
    tapFeedback();
    audioManager.stopBgm();
    setStatus("ready");
  }, [tapFeedback]);

  const handlePause = useCallback(() => {
    tapFeedback();
    audioManager.pauseBgm();
    setStatus("paused");
  }, [tapFeedback]);

  const handleResume = useCallback(() => {
    tapFeedback();
    audioManager.resumeBgm();
    setStatus("playing");
  }, [tapFeedback]);

  const showCanvas = status === "playing" || status === "paused";

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6">
      <div
        className="relative w-[390px] h-[640px] max-w-full max-h-[100dvh] overflow-hidden rounded-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] bg-slate-900"
        style={{ aspectRatio: "390 / 640" }}
      >
        {showCanvas && (
          <GameCanvas
            mode={mode}
            character={character}
            paused={status === "paused"}
            onGameOver={handleGameOver}
          />
        )}

        {status === "playing" && (
          <button
            type="button"
            onClick={handlePause}
            aria-label="Pause"
            className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/35 text-white text-sm flex items-center justify-center active:scale-95"
          >
            ❚❚
          </button>
        )}

        {status === "paused" && (
          <PausedScreen
            mode={mode}
            soundEnabled={soundEnabled}
            bgmEnabled={bgmEnabled}
            vibrationEnabled={vibrationEnabled}
            onToggleSound={handleToggleSound}
            onToggleBgm={handleToggleBgm}
            onToggleVibration={handleToggleVibration}
            onResume={handleResume}
            onHome={handleHome}
          />
        )}

        {status === "ready" && (
          <StartScreen
            mode={mode}
            bestScores={bestScores}
            selectedCharacter={character}
            soundEnabled={soundEnabled}
            bgmEnabled={bgmEnabled}
            vibrationEnabled={vibrationEnabled}
            onSelectMode={setMode}
            onSelectCharacter={handleSelectCharacter}
            onToggleSound={handleToggleSound}
            onToggleBgm={handleToggleBgm}
            onToggleVibration={handleToggleVibration}
            onStart={handleStart}
          />
        )}

        {status === "gameover" && (
          <GameOverScreen
            mode={mode}
            score={lastScore}
            bestScore={bestScores[mode]}
            isNewBest={isNewBest}
            character={character}
            onRestart={handleRestart}
            onHome={handleHome}
          />
        )}
      </div>
    </div>
  );
}
