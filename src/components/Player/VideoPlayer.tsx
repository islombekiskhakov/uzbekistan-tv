import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2, AlertTriangle, Languages, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioTrack {
  id: number;
  name: string;
  lang: string;
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
  if (n.includes('uz') || l.includes('uz')) return 'O\'zbekcha';
  if (n.includes('ru') || l.includes('ru') || l === 'rus') return 'Русский';
  if (n.includes('en') || l.includes('en') || l === 'eng') return 'Inglizcha';
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
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAudioMenu, setShowAudioMenu] = useState(false);

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
        const tracks = hls.audioTracks.map((t, i) => ({
          id: i,
          name: t.name || '',
          lang: t.lang || '',
          label: getAudioLabel(t, i),
        }));
        setAudioTracks(tracks);
        setCurrentAudioTrack(hls.audioTrack);
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
            setError('Tarmoq xatosi. Internet aloqangizni tekshiring.');
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            setError('Ijro xatosi. Qaytadan urinib ko\'ring.');
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
      setError('Ushbu brauzerda HLS qo\'llab-quvvatlanmaydi.');
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    initPlayer();
    return () => {
      hlsRef.current?.destroy();
    };
  }, [initPlayer]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => setLoading(false);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
    };
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

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

  const switchAudioTrack = (index: number) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = index;
      setCurrentAudioTrack(index);
    }
    setShowAudioMenu(false);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-background rounded-xl overflow-hidden glow-lg group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button, input')) return;
        setShowAudioMenu(false);
      }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain bg-background"
        playsInline
      />

      {/* Loading overlay */}
      <AnimatePresence>
        {loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-background/60"
          >
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error overlay */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 gap-4"
          >
            <AlertTriangle className="w-10 h-10 text-destructive" />
            <p className="text-sm text-muted-foreground text-center px-4">{error}</p>
            <button
              onClick={(e) => { e.stopPropagation(); initPlayer(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <AnimatePresence>
        {showControls && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex flex-col justify-between"
          >
            {/* Top gradient */}
            <div className="bg-gradient-to-b from-background/70 to-transparent p-4 flex items-center gap-3">
              {channelLogo && (
                <img src={channelLogo} alt="" className="w-8 h-8 rounded-md object-cover" />
              )}
              <span className="font-display font-semibold text-sm text-foreground truncate">
                {channelName}
              </span>
              <span className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/90 text-destructive-foreground text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-pulse-glow" />
                Live
              </span>
            </div>

            {/* Bottom gradient */}
            <div className="bg-gradient-to-t from-background/80 to-transparent p-4 flex items-center gap-3">
              {/* Play/Pause */}
              <button onClick={togglePlay} className="p-2 rounded-full hover:bg-foreground/10 transition-colors text-foreground">
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 group/vol">
                <button onClick={toggleMute} className="p-1.5 rounded-full hover:bg-foreground/10 transition-colors text-foreground">
                  {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={e => changeVolume(Number(e.target.value))}
                  className="w-20 h-1 accent-primary opacity-0 group-hover/vol:opacity-100 transition-opacity cursor-pointer"
                />
              </div>

              <div className="flex-1" />

              {/* Audio tracks */}
              {audioTracks.length > 1 && (
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowAudioMenu(!showAudioMenu); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors text-foreground text-xs font-medium"
                  >
                    <Languages className="w-3.5 h-3.5" />
                    {audioTracks[currentAudioTrack]?.label || 'Audio'}
                  </button>

                  <AnimatePresence>
                    {showAudioMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute bottom-full right-0 mb-2 glass rounded-lg p-1 min-w-[120px]"
                      >
                        {audioTracks.map((track) => (
                          <button
                            key={track.id}
                            onClick={(e) => { e.stopPropagation(); switchAudioTrack(track.id); }}
                            className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                              currentAudioTrack === track.id
                                ? 'bg-primary text-primary-foreground'
                                : 'text-foreground hover:bg-foreground/10'
                            }`}
                          >
                            {track.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="p-2 rounded-full hover:bg-foreground/10 transition-colors text-foreground">
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
