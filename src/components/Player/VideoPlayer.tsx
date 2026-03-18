import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play, Pause, Volume2, VolumeX, Volume1,
  Maximize, Minimize, Loader2, AlertTriangle,
  Languages, RefreshCw, Settings, PictureInPicture2,
  SkipForward, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioTrack {
  id: number;
  name: string;
  lang: string;
  label: string;
}

interface QualityLevel {
  id: number;
  height: number;
  label: string;
}

interface Props {
  url: string;
  channelName: string;
  channelLogo?: string;
  onClose?: () => void;
}

function getAudioLabel(track: { name?: string; lang?: string }, index: number): string {
  const n = (track.name || '').toLowerCase();
  const l = (track.lang || '').toLowerCase();
  if (n.includes('uz') || l.includes('uz')) return "O'zbekcha";
  if (n.includes('ru') || l.includes('ru') || l === 'rus') return 'Русский';
  if (n.includes('en') || l.includes('en') || l === 'eng') return 'English';
  if (track.name) return track.name;
  if (track.lang) return track.lang.toUpperCase();
  return `Trek ${index + 1}`;
}

export const VideoPlayer: React.FC<Props> = ({ url, channelName, channelLogo, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = useState(0);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 = auto
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showRateMenu, setShowRateMenu] = useState(false);

  const closeAllMenus = () => {
    setShowAudioMenu(false);
    setShowQualityMenu(false);
    setShowRateMenu(false);
  };

  const initPlayer = useCallback(() => {
    if (!videoRef.current) return;
    setLoading(true);
    setError(null);

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({
        capLevelToPlayerSize: true,
        backBufferLength: 30,
        maxBufferLength: 30,
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Audio tracks
        const tracks = hls.audioTracks.map((t, i) => ({
          id: i,
          name: t.name || '',
          lang: t.lang || '',
          label: getAudioLabel(t, i),
        }));
        setAudioTracks(tracks);
        setCurrentAudioTrack(hls.audioTrack);

        // Quality levels
        const levels = hls.levels.map((l, i) => ({
          id: i,
          height: l.height,
          label: `${l.height}p`,
        }));
        setQualityLevels(levels);
        setCurrentQuality(-1);

        setLoading(false);
        video.play().catch(() => {
          video.muted = true;
          setMuted(true);
          video.play().catch(() => {});
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            setError("Tarmoq xatosi. Internet aloqangizni tekshiring.");
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            setError("Ijro xatosi. Qaytadan urinib ko'ring.");
          }
        }
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        video.play().catch(() => {});
      });
    } else {
      setError("Ushbu brauzerda HLS qo'llab-quvvatlanmaydi.");
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    initPlayer();
    return () => { hlsRef.current?.destroy(); };
  }, [initPlayer]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => setLoading(false);
    const onPiP = () => setIsPiP(true);
    const offPiP = () => setIsPiP(false);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('enterpictureinpicture', onPiP);
    video.addEventListener('leavepictureinpicture', offPiP);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('enterpictureinpicture', onPiP);
      video.removeEventListener('leavepictureinpicture', offPiP);
    };
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k': e.preventDefault(); togglePlay(); break;
        case 'm': toggleMute(); break;
        case 'f': toggleFullscreen(); break;
        case 'arrowup': e.preventDefault(); changeVolume(Math.min(1, volume + 0.1)); break;
        case 'arrowdown': e.preventDefault(); changeVolume(Math.max(0, volume - 0.1)); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [volume, playing]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.paused ? v.play() : v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const changeVolume = (val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    v.muted = val === 0;
    setVolume(val);
    setMuted(val === 0);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const togglePiP = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await v.requestPictureInPicture();
      }
    } catch {}
  };

  const switchAudioTrack = (index: number) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = index;
      setCurrentAudioTrack(index);
    }
    closeAllMenus();
  };

  const switchQuality = (level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setCurrentQuality(level);
    }
    closeAllMenus();
  };

  const changeRate = (rate: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = rate;
    setPlaybackRate(rate);
    closeAllMenus();
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      if (playing) { setShowControls(false); closeAllMenus(); }
    }, 3500);
  };

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const MenuPopup: React.FC<{ show: boolean; children: React.ReactNode }> = ({ show, children }) => (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.9 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-full right-0 mb-3 bg-background/90 backdrop-blur-2xl border border-border/40 rounded-2xl p-2 min-w-[160px] shadow-2xl shadow-background/50"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const menuItemClass = (active: boolean) =>
    `w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
      active
        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
        : 'text-foreground/80 hover:bg-foreground/8 hover:text-foreground'
    }`;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-background rounded-2xl overflow-hidden glow-lg group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { if (playing) { setShowControls(false); closeAllMenus(); } }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button, input, [data-menu]')) return;
        closeAllMenus();
      }}
      onDoubleClick={(e) => {
        if ((e.target as HTMLElement).closest('button, input, [data-menu]')) return;
        toggleFullscreen();
      }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-background cursor-pointer"
        playsInline
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          togglePlay();
        }}
      />

      {/* Loading */}
      <AnimatePresence>
        {loading && !error && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-background/50 pointer-events-none"
          >
            <div className="w-14 h-14 rounded-2xl bg-card/80 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-background/85 gap-4"
          >
            <AlertTriangle className="w-10 h-10 text-destructive" />
            <p className="text-sm text-muted-foreground text-center px-6">{error}</p>
            <button
              onClick={(e) => { e.stopPropagation(); initPlayer(); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Qayta urinish
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <AnimatePresence>
        {showControls && !error && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col justify-between pointer-events-none"
          >
            {/* Top bar */}
            <div className="bg-gradient-to-b from-background/70 via-background/20 to-transparent p-4 md:p-5 flex items-center gap-3 pointer-events-auto">
              {channelLogo && (
                <img src={channelLogo} alt="" className="w-9 h-9 rounded-lg object-cover border border-border/30" />
              )}
              <div className="min-w-0">
                <span className="font-display font-bold text-sm text-foreground truncate block">
                  {channelName}
                </span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/90 text-destructive-foreground text-[10px] font-bold uppercase tracking-wider">
                  <Radio className="w-3 h-3 animate-pulse-glow" />
                  Jonli
                </span>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="bg-gradient-to-t from-background/85 via-background/30 to-transparent p-4 md:p-5 pointer-events-auto">
              <div className="flex items-center gap-2 md:gap-3">
                {/* Play/Pause */}
                <button onClick={togglePlay} className="p-2 rounded-full hover:bg-foreground/10 transition-colors text-foreground" title={playing ? 'Pauza (K)' : "Ijro (K)"}>
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>

                {/* Volume */}
                <div className="flex items-center gap-1 group/vol">
                  <button onClick={toggleMute} className="p-1.5 rounded-full hover:bg-foreground/10 transition-colors text-foreground" title="Ovoz (M)">
                    <VolumeIcon className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={muted ? 0 : volume}
                    onChange={e => changeVolume(Number(e.target.value))}
                    className="w-0 group-hover/vol:w-20 h-1 accent-primary transition-all duration-200 cursor-pointer overflow-hidden"
                  />
                </div>

                <div className="flex-1" />

                {/* Playback speed */}
                <div className="relative hidden md:block" data-menu>
                  <button
                    onClick={(e) => { e.stopPropagation(); closeAllMenus(); setShowRateMenu(!showRateMenu); }}
                    className="px-2.5 py-1.5 rounded-lg hover:bg-foreground/10 transition-colors text-foreground text-xs font-bold"
                    title="Tezlik"
                  >
                    {playbackRate}x
                  </button>
                  <MenuPopup show={showRateMenu}>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                      <button
                        key={rate}
                        onClick={(e) => { e.stopPropagation(); changeRate(rate); }}
                        className={menuItemClass(playbackRate === rate)}
                      >
                        {rate}x {rate === 1 && '(Normal)'}
                      </button>
                    ))}
                  </MenuPopup>
                </div>

                {/* Quality */}
                {qualityLevels.length > 1 && (
                  <div className="relative" data-menu>
                    <button
                      onClick={(e) => { e.stopPropagation(); closeAllMenus(); setShowQualityMenu(!showQualityMenu); }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-foreground/10 transition-colors text-foreground text-xs font-semibold"
                      title="Sifat"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {currentQuality === -1 ? 'Avto' : `${qualityLevels[currentQuality]?.label}`}
                      </span>
                    </button>
                    <MenuPopup show={showQualityMenu}>
                      <button
                        onClick={(e) => { e.stopPropagation(); switchQuality(-1); }}
                        className={menuItemClass(currentQuality === -1)}
                      >
                        Avto
                      </button>
                      {[...qualityLevels].sort((a, b) => b.height - a.height).map(q => (
                        <button
                          key={q.id}
                          onClick={(e) => { e.stopPropagation(); switchQuality(q.id); }}
                          className={menuItemClass(currentQuality === q.id)}
                        >
                          {q.label}
                          {q.height >= 1080 && <span className="ml-1 text-[9px] text-accent font-bold">HD</span>}
                        </button>
                      ))}
                    </MenuPopup>
                  </div>
                )}

                {/* Audio tracks */}
                {audioTracks.length > 1 && (
                  <div className="relative" data-menu>
                    <button
                      onClick={(e) => { e.stopPropagation(); closeAllMenus(); setShowAudioMenu(!showAudioMenu); }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-foreground/10 transition-colors text-foreground text-xs font-semibold"
                      title="Til"
                    >
                      <Languages className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{audioTracks[currentAudioTrack]?.label || 'Til'}</span>
                    </button>
                    <MenuPopup show={showAudioMenu}>
                      {audioTracks.map((track) => (
                        <button
                          key={track.id}
                          onClick={(e) => { e.stopPropagation(); switchAudioTrack(track.id); }}
                          className={menuItemClass(currentAudioTrack === track.id)}
                        >
                          {track.label}
                        </button>
                      ))}
                    </MenuPopup>
                  </div>
                )}

                {/* PiP */}
                {'pictureInPictureEnabled' in document && (
                  <button
                    onClick={togglePiP}
                    className="p-1.5 rounded-lg hover:bg-foreground/10 transition-colors text-foreground hidden md:flex"
                    title="Kichik oyna"
                  >
                    <PictureInPicture2 className="w-4 h-4" />
                  </button>
                )}

                {/* Fullscreen */}
                <button onClick={toggleFullscreen} className="p-2 rounded-full hover:bg-foreground/10 transition-colors text-foreground" title="To'liq ekran (F)">
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              </div>

              {/* Keyboard hints */}
              <div className="hidden md:flex items-center gap-3 mt-2 text-[10px] text-foreground/30">
                <span>K — Ijro/Pauza</span>
                <span>M — Ovoz</span>
                <span>F — To'liq ekran</span>
                <span>↑↓ — Ovoz balandligi</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
