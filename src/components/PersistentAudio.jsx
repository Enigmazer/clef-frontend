/**
 * PersistentAudio
 * ---------------
 * A hidden <audio> element that lives for the entire lifetime of an audio
 * session. It is never unmounted when switching between modal ↔ mini modes,
 * which eliminates the buffering gap users would otherwise hear when the
 * element is destroyed and recreated.
 *
 * Both MaterialPlayerModal and MiniPlayer control playback by calling methods
 * on `commonMediaRef.current` (supplied by PlayerContext). This component is
 * the only owner of that DOM node for audio content.
 */
import { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

export default function PersistentAudio() {
  const {
    activeMaterial, playerMode,
    isPlaying, setIsPlaying,
    setCurrentTime,
    volume, isMuted, speed,
    commonMediaRef,
  } = usePlayer();

  const audioRef = useRef(null);
  const isAudio = activeMaterial?.type?.toLowerCase() === 'audio';
  const isActive = !!activeMaterial && playerMode !== 'none' && isAudio;

  // Wire the ref that the modal / mini player both use for control.
  // Runs on every render so the ref is always pointing at the live element.
  // Clears on unmount so neither player holds a dangling reference.
  useEffect(() => {
    commonMediaRef.current = audioRef.current;
    return () => { commonMediaRef.current = null; };
  });

  // Sync volume / mute / speed imperatively (no remount needed)
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
    el.muted = isMuted;
    el.playbackRate = speed;
  }, [volume, isMuted, speed]);

  // Sync play / pause from context → element
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !isActive) return;
    if (isPlaying && el.paused) el.play().catch(() => {});
    else if (!isPlaying && !el.paused) el.pause();
  }, [isPlaying, isActive]);

  if (!isActive) return null;

  return (
    <audio
      ref={audioRef}
      src={activeMaterial.url}
      style={{ display: 'none' }}
      onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onEnded={() => setIsPlaying(false)}
    />
  );
}
