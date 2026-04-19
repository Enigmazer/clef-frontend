/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useRef, useCallback } from 'react';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [playerMode, setPlayerMode] = useState('none');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1);

  const commonMediaRef = useRef(null);

  const openPlayer = useCallback((material) => {
    setActiveMaterial(material);
    setPlayerMode('modal');
  }, []);

  const closePlayer = useCallback(() => {
    setActiveMaterial(null);
    setPlayerMode('none');
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const toggleMode = useCallback((mode, time = null) => {
    if (time !== null) setCurrentTime(time);
    setPlayerMode(mode);
  }, []);

  const value = {
    activeMaterial,
    playerMode,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    speed,
    setSpeed,
    openPlayer,
    closePlayer,
    toggleMode,
    commonMediaRef
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
  return context;
};
