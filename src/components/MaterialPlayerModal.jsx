import { useEffect, useRef, useState, useCallback } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  X, Video, Music, RotateCcw, RotateCw, Monitor,
  Maximize, Minimize, Play, Pause, Volume2, VolumeX, Loader2,
  ChevronDown
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

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
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

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        if (window.screen?.orientation?.lock) {
          try {
            await window.screen.orientation.lock('landscape');
          } catch (e) {
            console.warn('Orientation lock failed', e);
          }
        }
      } else {
        await document.exitFullscreen();
        if (window.screen?.orientation?.unlock) {
          try {
            window.screen.orientation.unlock();
          } catch (e) {
            console.warn('Orientation unlock failed', e);
          }
        }
      }
    } catch (err) {
      console.error(`Error toggling fullscreen: ${err.message}`);
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
    resetControlsTimeout();
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
    if (!isOpen || isVideo || !commonMediaRef.current) return;
    const el = commonMediaRef.current;
    
    if (el.readyState >= 1) {
      setDuration(el.duration || 0);
    }

    const handleDurationChange = () => setDuration(el.duration || 0);
    const handleTimeUpdate = () => setCurrentTime(el.currentTime || 0);

    el.addEventListener('durationchange', handleDurationChange);
    el.addEventListener('loadedmetadata', handleDurationChange);
    el.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      el.removeEventListener('durationchange', handleDurationChange);
      el.removeEventListener('loadedmetadata', handleDurationChange);
      el.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isOpen, isVideo, commonMediaRef, setCurrentTime]);

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
        className={`bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 dark:border-[#2a2a2a] relative group
          ${isFullscreen ? 'max-w-none h-full w-full rounded-none border-none' : 'aspect-video scale-100 shadow-emerald-500/5'}
          ${showControls ? 'cursor-default' : 'cursor-none'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Overlay, pointer-events-none to let clicks pass to center video */}
        <div className={`absolute top-0 inset-x-0 z-20 pointer-events-none flex items-center justify-between p-4 sm:p-5 pb-12 bg-gradient-to-b from-black/90 via-black/50 to-transparent transition-all duration-500 ${showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}>
          <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 min-w-0">
            {/* YouTube style dismiss to PIP on mobile! */}
            {!isFullscreen && (
              <button onClick={(e) => { e.stopPropagation(); togglePip(); }} className="sm:hidden p-2 -ml-2 text-white hover:bg-white/20 rounded-full transition-colors" title="Miniplayer">
                <ChevronDown size={24} />
              </button>
            )}
            <div className={`hidden sm:flex p-2 rounded-lg ${isVideo ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-violet-500 text-white shadow-lg shadow-violet-500/20'
              }`}>
              {isVideo ? <Video size={18} /> : <Music size={18} />}
            </div>
            <h3 className="font-semibold text-white truncate text-sm tracking-tight">
              {activeMaterial.title}
            </h3>
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
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

          {/* Mobile Center Controls overlay & PC Paused Indicator */}
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300 z-10 ${showControls ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {/* Mobile Playback Controls */}
            <div className="flex sm:hidden items-center gap-6 pointer-events-auto">
              <button onClick={(e) => { e.stopPropagation(); handleSkip(-10); }} className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white/90 hover:text-emerald-400 active:scale-90 transition-all border border-white/10">
                <RotateCcw size={22} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="p-5 bg-black/50 backdrop-blur-md rounded-full text-white hover:text-emerald-400 active:scale-90 transition-all border border-white/20 shadow-2xl shadow-emerald-500/20">
                {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleSkip(10); }} className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white/90 hover:text-emerald-400 active:scale-90 transition-all border border-white/10">
                <RotateCw size={22} />
              </button>
            </div>

            {/* PC aesthetic Paused Indicator */}
            <div className={`hidden sm:flex p-7 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white shadow-2xl transition-all duration-500 ${!isPlaying ? 'opacity-100' : 'opacity-0'}`}>
              <Play size={52} fill="currentColor" className="ml-2" />
            </div>
          </div>
        </div>

        {/* Bottom Custom Controls, pointer-events-none to pass clicks to video overlay */}
        <div className={`absolute bottom-0 inset-x-0 z-20 pointer-events-none flex flex-col p-4 pb-4 sm:pb-5 sm:p-5 pt-16 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-all duration-500 ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
          {/* Unified SYNCED Seek Bar & Time */}
          <div className="pointer-events-auto flex items-center gap-3 sm:gap-4 sm:mb-6">
            <span className="text-[10px] sm:text-xs text-white/90 font-bold font-mono tracking-wider tabular-nums shrink-0">
              {formatTime(currentTime)}
            </span>
            <div className="group/timeline relative flex items-center transition-all flex-1">
              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.01"
                value={currentTime}
                onChange={handleSeek}
                className="pro-range-input h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/30 accent-emerald-500 outline-none transition-all hover:bg-white/50"
              />
            </div>
            <span className="text-[10px] sm:text-xs text-white/70 font-mono tracking-wider tabular-nums shrink-0">
              {formatTime(duration)}
            </span>
            
            <div className="sm:hidden flex items-center gap-3 shrink-0">
              {/* Space-saving single button speed cycler for mobile inline with timeline */}
              <button 
                className="px-2 py-1 bg-white/20 text-white hover:bg-white/30 transition-colors font-mono text-[9px] font-bold rounded tracking-wider"
                onClick={(e) => {
                  e.stopPropagation();
                  const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : speed === 2 ? 0.5 : 1;
                  handleSpeedChange(nextSpeed);
                }}
              >
                {speed}x
              </button>

              {/* Mobile PIP Button explicitly next to seek bar! */}
              {!isFullscreen && (
                <button onClick={(e) => { e.stopPropagation(); togglePip(); }} className="text-white/90 hover:text-white transition-colors p-1" title="Mini player">
                  <Monitor size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="pointer-events-auto hidden sm:flex items-center justify-between mt-2 sm:mt-0">
            {/* Left side: Volume (PC only) */}
            <div className="flex items-center w-1/3 justify-start">
              <div className="hidden sm:flex items-center gap-3 group/volume bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl transition-all border border-white/5 shadow-inner">
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
            </div>

            {/* Center: Playback Controls (PC Only) */}
            <div className="flex items-center justify-center gap-6 sm:gap-8 w-1/3">
              <button onClick={() => handleSkip(-10)} className="text-white/70 hover:text-white transition-colors" title="Back 10s (←)">
                <RotateCcw size={22} className="w-6 h-6" />
              </button>
              
              <button 
                onClick={togglePlay} 
                className="p-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 hover:text-emerald-300 rounded-full transition-all shadow-lg shadow-emerald-500/10"
              >
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
              </button>

              <button onClick={() => handleSkip(10)} className="text-white/70 hover:text-white transition-colors" title="Forward 10s (→)">
                <RotateCw size={22} className="w-6 h-6" />
              </button>
            </div>

            {/* Right side: Speed and MiniPlayer (PC Only) */}
            <div className="flex items-center justify-end gap-5 w-1/3">
              {/* Full speed selector for PC */}
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

              {/* Mini-player button */}
              {!isFullscreen && (
                <button onClick={togglePip} className="text-white/80 hover:text-white transition-colors" title="Mini player (I)">
                  <Monitor size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Shortcut Legend Overlay - hidden on touch devices */}
          <div className="hidden sm:flex mt-3 sm:mt-5 pb-1 items-center justify-between text-[9px] text-white/20 font-bold uppercase tracking-[2.5px] border-t border-white/5 pt-3">
            <div className="flex gap-6">
              <span className="flex gap-1.5"><kbd className="text-white/40 opacity-100">SPACE</kbd> Play</span>
              <span className="flex gap-1.5"><kbd className="text-white/40 opacity-100">F</kbd> Fullscreen</span>
              <span className="flex gap-1.5"><kbd className="text-white/40 opacity-100">I</kbd> Mini</span>
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
