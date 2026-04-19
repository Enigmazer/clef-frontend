import { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  X, Video, Music, RotateCcw, RotateCw, Monitor,
  Maximize, Minimize, Play, Pause, Volume2, VolumeX, Loader2
} from 'lucide-react';

function formatTime(time) {
  if (isNaN(time)) return '0:00';
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function MaterialPlayerModal() {
  const {
    activeMaterial, playerMode, toggleMode, closePlayer,
    isPlaying, setIsPlaying, currentTime, setCurrentTime,
    volume, setVolume, isMuted, setIsMuted, speed, setSpeed,
    commonMediaRef,
  } = usePlayer();

  const isOpen = playerMode === 'modal';
  const isVideo = activeMaterial?.type?.toLowerCase() === 'video';

  const videoRef = useRef(null);
  const mediaRef = isVideo ? videoRef : commonMediaRef;
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const isPlayingRef = useRef(false);
  const mediaStateRef = useRef({ currentTime, speed, volume, isMuted, isPlaying });

  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // --- Logic Handlers ---

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);

    if (isPlayingRef.current) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!mediaRef.current) return;
    if (mediaRef.current.paused) {
      mediaRef.current.play();
    } else {
      mediaRef.current.pause();
    }
    resetControlsTimeout();
  }, [mediaRef, resetControlsTimeout]);

  const handleSkip = useCallback((seconds) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime += seconds;
      resetControlsTimeout();
    }
  }, [mediaRef, resetControlsTimeout]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const togglePip = useCallback(() => {
    toggleMode('mini', mediaRef.current?.currentTime);
  }, [mediaRef, toggleMode]);

  const handleSpeedChange = useCallback((newSpeed) => {
    setSpeed(newSpeed);
    if (mediaRef.current) mediaRef.current.playbackRate = newSpeed;
    resetControlsTimeout();
  }, [mediaRef, setSpeed, resetControlsTimeout]);

  const handleSeek = useCallback((e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (mediaRef.current) mediaRef.current.currentTime = time;
    resetControlsTimeout();
  }, [mediaRef, setCurrentTime, resetControlsTimeout]);

  const toggleMute = useCallback(() => {
    if (mediaRef.current) {
      const nextMute = !mediaRef.current.muted;
      mediaRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
    resetControlsTimeout();
  }, [mediaRef, setIsMuted, resetControlsTimeout]);

  const handleVolumeChange = useCallback((e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (mediaRef.current) {
      mediaRef.current.volume = val;
      const nextMute = (val === 0);
      mediaRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
    resetControlsTimeout();
  }, [mediaRef, setVolume, setIsMuted, resetControlsTimeout]);

  const handleLoadedMetadata = useCallback(() => {
    if (mediaRef.current) {
      const state = mediaStateRef.current;
      setDuration(mediaRef.current.duration || 0);
      mediaRef.current.currentTime = state.currentTime;
      mediaRef.current.playbackRate = state.speed;
      mediaRef.current.volume = state.volume;
      mediaRef.current.muted = state.isMuted;
      if (state.isPlaying) mediaRef.current.play().catch(() => { });
    }
  }, [mediaRef]);

  useEffect(() => {
    mediaStateRef.current = { currentTime, speed, volume, isMuted, isPlaying };
  }, [currentTime, speed, volume, isMuted, isPlaying]);

  // --- Effects ---

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (document.activeElement?.tagName === 'INPUT' && e.key !== 'Escape') {
        if (e.key.startsWith('Arrow')) return;
      }

      const key = e.key.toLowerCase();
      const handledKeys = [' ', 'k', 'f', 'i', 'm', 'arrowright', 'arrowleft'];
      if (handledKeys.includes(key)) e.preventDefault();

      if (key === 'escape') {
        if (document.fullscreenElement) document.exitFullscreen();
        else closePlayer();
      } else if (key === ' ' || key === 'k') {
        togglePlay();
      } else if (key === 'f') {
        toggleFullscreen();
      } else if (key === 'i' && !document.fullscreenElement) {
        togglePip();
      } else if (key === 'arrowright') {
        handleSkip(10);
      } else if (key === 'arrowleft') {
        handleSkip(-10);
      } else if (key === 'm') {
        toggleMute();
      }
      resetControlsTimeout();
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      resetControlsTimeout();
    };

    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isOpen, closePlayer, togglePlay, toggleFullscreen, handleSkip, togglePip, toggleMute, resetControlsTimeout]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    if (isPlaying) {
      const t = setTimeout(() => {
        resetControlsTimeout();
      }, 0);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setShowControls(true);
      }, 0);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      return () => clearTimeout(t);
    }
  }, [isPlaying, resetControlsTimeout]);

  useEffect(() => {
    if (!isOpen || !isVideo) return;
    const timeout = setTimeout(() => {
      if (mediaRef.current) {
        const { currentTime, speed, volume, isMuted, isPlaying } = mediaStateRef.current;
        mediaRef.current.currentTime = currentTime;
        mediaRef.current.playbackRate = speed;
        mediaRef.current.volume = volume;
        mediaRef.current.muted = isMuted;
        if (isPlaying) mediaRef.current.play().catch(() => { });
      }
    }, 50);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || isVideo) return;
    const el = commonMediaRef.current;
    if (el) setDuration(el.duration || 0);
  }, [isOpen, isVideo, commonMediaRef]);

  if (!isOpen || !activeMaterial) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      onClick={closePlayer}
    >
      <div
        ref={containerRef}
        onMouseMove={resetControlsTimeout}
        className={`bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all duration-300 border border-gray-100 dark:border-[#2a2a2a] relative group
          ${isFullscreen ? 'max-w-none h-screen rounded-none border-none' : 'aspect-video scale-100 shadow-emerald-500/5'}
          ${showControls ? 'cursor-default' : 'cursor-none'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Overlay */}
        <div className={`absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent transition-all duration-500 ${showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2 rounded-lg ${isVideo ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-violet-500 text-white shadow-lg shadow-violet-500/20'
              }`}>
              {isVideo ? <Video size={18} /> : <Music size={18} />}
            </div>
            <h3 className="font-semibold text-white truncate text-sm tracking-tight">
              {activeMaterial.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/90 hover:text-white"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
            <button
              onClick={closePlayer}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/90 hover:text-white"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Media Content Area */}
        <div
          className="w-full h-full bg-black flex items-center justify-center relative select-none"
          onClick={togglePlay}
        >
          {isVideo ? (
            <video
              ref={videoRef}
              className="w-full h-full object-contain pointer-events-none"
              src={activeMaterial.url}
              onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
              onLoadedMetadata={handleLoadedMetadata}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onEnded={() => setIsPlaying(false)}
              onWaiting={() => setIsLoading(true)}
              onCanPlay={() => setIsLoading(false)}
              onLoadStart={() => setIsLoading(true)}
              onLoadedData={() => setIsLoading(false)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full p-12 bg-gradient-to-br from-[#111] via-black to-[#1a1a1a]">
              <div className={`w-36 h-36 rounded-full bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)] ${isPlaying ? 'animate-pulse' : ''}`}>
                <Music size={64} className="text-emerald-500" />
              </div>
            </div>
          )}

          {/* Loading Spinner Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-10 transition-opacity">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            </div>
          )}

          {/* Big Center Play/Pause Indicator */}
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500 ${!isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
            }`}>
            <div className="p-7 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white shadow-2xl">
              <Play size={52} fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Bottom Custom Controls */}
        <div className={`absolute bottom-0 inset-x-0 z-20 flex flex-col p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-all duration-500 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
          {/* Unified SYNCED Seek Bar */}
          <div className="group/timeline mb-4 relative flex items-center transition-all">
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.01"
              value={currentTime}
              onChange={handleSeek}
              className="pro-range-input h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-emerald-500 outline-none transition-all hover:bg-white/30"
            />
          </div>

          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <button onClick={togglePlay} className="text-white hover:text-emerald-400 transition-colors">
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
              </button>

              <div className="flex items-center gap-1.5">
                <button onClick={() => handleSkip(-10)} className="text-white/80 hover:text-white transition-colors" title="Back 10s (←)">
                  <RotateCcw size={20} />
                </button>
                <button onClick={() => handleSkip(10)} className="text-white/80 hover:text-white transition-colors" title="Forward 10s (→)">
                  <RotateCw size={20} />
                </button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-3 group/volume ml-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl transition-all">
                <button onClick={toggleMute} className="text-white/80 hover:text-white transition-colors">
                  {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range" min="0" max="1" step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 accent-emerald-500 appearance-none bg-white/20 rounded-full cursor-pointer hover:bg-white/30"
                />
              </div>

              <div className="text-xs text-white/70 font-mono tracking-wider ml-2 tabular-nums">
                {formatTime(currentTime)} <span className="opacity-30 mx-1">/</span> {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-5">
              {/* Speed Selector */}
              <div className="flex items-center bg-white/5 backdrop-blur-md rounded-xl p-1 border border-white/10 shadow-lg">
                {[0.5, 1, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-tighter transition-all ${speed === s ? 'bg-emerald-500 text-white shadow-lg' : 'text-white/50 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {s === 1 ? 'NORM' : `${s}x`}
                  </button>
                ))}
              </div>

              {/* Mini-player button — hidden in fullscreen */}
              {isVideo && !isFullscreen && (
                <button onClick={togglePip} className="text-white/80 hover:text-white transition-colors" title="Mini player (I)">
                  <Monitor size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Shortcut Legend Overlay */}
          <div className="mt-5 pb-1 flex items-center justify-between text-[9px] text-white/20 font-bold uppercase tracking-[2.5px] border-t border-white/5 pt-3">
            <div className="flex gap-6">
              <span className="flex gap-1.5"><kbd className="text-white/40 opacity-100">SPACE</kbd> Play</span>
              <span className="flex gap-1.5"><kbd className="text-white/40 opacity-100">F</kbd> Fullscreen</span>
              {isVideo && <span className="flex gap-1.5"><kbd className="text-white/40 opacity-100">I</kbd> Mini</span>}
              <span className="flex gap-1.5"><kbd className="text-white/40 opacity-100">M</kbd> Mute</span>
              <span className="flex gap-1.5"><kbd className="text-white/40 opacity-100">ESC</kbd> Close</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-500/30 opacity-100">
              <div className="w-1 h-1 rounded-full bg-current animate-pulse" />
              CLEF PRO PLAYER
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
