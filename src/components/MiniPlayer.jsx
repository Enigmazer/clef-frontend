import { useRef, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { X, Play, Pause, Maximize2, Music } from 'lucide-react';

export default function MiniPlayer() {
  const {
    activeMaterial, playerMode, isPlaying, setIsPlaying,
    currentTime, setCurrentTime, volume, isMuted, setIsMuted, speed,
    toggleMode, closePlayer, commonMediaRef,
  } = usePlayer();

  const isVideo = activeMaterial?.type?.toLowerCase() === 'video';

  // For video: local element. For audio: the persistent element from context.
  const videoRef = useRef(null);
  const mediaRef = isVideo ? videoRef : commonMediaRef;

  // ── Sync video element when context values change ─────────────────────────
  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !isVideo) return;
    el.volume = volume;
    el.muted = isMuted;
    el.playbackRate = speed;
  }, [volume, isMuted, speed, isVideo, mediaRef]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !isVideo) return;
    if (isPlaying && el.paused) el.play().catch(() => {});
    else if (!isPlaying && !el.paused) el.pause();
  }, [isPlaying, isVideo, mediaRef]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    if (playerMode !== 'mini') return;
    const onKey = (e) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      const key = e.key.toLowerCase();
      if (key === ' ' || key === 'k') {
        e.preventDefault();
        const el = mediaRef.current;
        if (!el) return;
        if (el.paused) el.play().catch(() => {});
        else el.pause();
      } else if (key === 'm') {
        e.preventDefault();
        const el = mediaRef.current;
        if (!el) return;
        el.muted = !el.muted;
        setIsMuted(el.muted);
      } else if (key === 'i') {
        e.preventDefault();
        toggleMode('modal', mediaRef.current?.currentTime);
      } else if (key === 'escape') {
        closePlayer();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [playerMode, mediaRef, setIsMuted, toggleMode, closePlayer]);

  if (playerMode !== 'mini' || !activeMaterial) return null;

  const togglePlay = () => {
    const el = mediaRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  const handleVideoLoadedMetadata = () => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = currentTime;
    el.playbackRate = speed;
    el.volume = volume;
    el.muted = isMuted;
    if (isPlaying) el.play().catch(() => {});
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] shadow-2xl rounded-xl overflow-hidden bg-[#111] border border-white/10 select-none group"
      style={{ width: 320, height: 180 }}
    >
      {/* Media */}
      {isVideo ? (
        <video
          ref={videoRef}
          src={activeMaterial.url}
          className="w-full h-full object-cover pointer-events-none"
          onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
          onLoadedMetadata={handleVideoLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0d0d0d] to-[#1a1a1a] gap-2 pointer-events-none">
          <div className={`w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center transition-all ${isPlaying ? 'animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.2)]' : ''}`}>
            <Music size={28} className="text-emerald-500" />
          </div>
          <p className="text-[10px] text-white/50 px-6 truncate font-medium text-center w-full">{activeMaterial.title}</p>
        </div>
      )}

      {/* Overlay controls — visible on hover */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
        {/* Top bar */}
        <p className="text-[9px] text-white/70 truncate font-medium px-1">{activeMaterial.title}</p>

        {/* Centre buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); toggleMode('modal', mediaRef.current?.currentTime); }}
            className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
            title="Restore full player (I)"
          >
            <Maximize2 size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); closePlayer(); }}
            className="p-2 bg-red-500/30 hover:bg-red-500/60 rounded-full text-white transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Bottom hint */}
        <p className="text-[8px] text-white/30 text-center">I to restore</p>
      </div>
    </div>
  );
}
