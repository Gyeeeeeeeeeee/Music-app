import { useState, useEffect, useRef } from 'react';

const SUITS = {
  classic: {
    name: 'Classic Suit',
    primary: '#e62429',
    secondary: '#1d4ed8',
    glow: 'rgba(230, 36, 41, 0.45)',
    badge: 'PETER-616',
  },
  miles: {
    name: 'Miles Morales',
    primary: '#ef4444',
    secondary: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.45)',
    badge: 'EARTH-1610',
  },
  symbiote: {
    name: 'Symbiote Suit',
    primary: '#a855f7',
    secondary: '#e2e8f0',
    glow: 'rgba(168, 85, 247, 0.45)',
    badge: 'VENOM-CORE',
  },
};

const INITIAL_TRACKS = [
  { id: 1, title: 'Queens Midnight Swing', artist: 'Spidey Beats', genre: 'Synthwave', duration: 154, baseFreq: 196, color: '#e62429' },
  { id: 2, title: 'Brooklyn Neon Pulse', artist: 'Miles Lab', genre: 'Electro', duration: 182, baseFreq: 220, color: '#06b6d4' },
  { id: 3, title: 'Abyssal Tendril', artist: 'Symbiote Sound', genre: 'Dark Bass', duration: 168, baseFreq: 146.83, color: '#a855f7' },
  { id: 4, title: 'Daily Bugle Rush', artist: 'Web-Head Studio', genre: 'Lo-Fi', duration: 141, baseFreq: 261.63, color: '#f59e0b' },
  { id: 5, title: 'Skyline Web Zip', artist: 'Manhattan FM', genre: 'Synthwave', duration: 195, baseFreq: 246.94, color: '#3b82f6' },
  { id: 6, title: 'Spider-Sense Echo', artist: 'Multiverse Mix', genre: 'Ambient', duration: 210, baseFreq: 174.61, color: '#10b981' },
];

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function SpideyFy() {
  const [suit, setSuit] = useState('classic');
  const [tracks, setTracks] = useState(INITIAL_TRACKS);
  const [currentId, setCurrentId] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [search, setSearch] = useState('');
  const [likedIds, setLikedIds] = useState([1, 2]);
  const [showLikedOnly, setShowLikedOnly] = useState(false);

  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);
  const audioElRef = useRef(null);

  const theme = SUITS[suit];
  const currentTrack = tracks.find((t) => t.id === currentId) || tracks[0];

  const filteredTracks = tracks.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.genre.toLowerCase().includes(q);
    const matchLiked = showLikedOnly ? likedIds.includes(t.id) : true;
    return matchSearch && matchLiked;
  });

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (audioElRef.current && audioElRef.current.src) {
          return audioElRef.current.currentTime || 0;
        }
        if (prev + 1 >= currentTrack.duration) {
          handleNext();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    const hasCustomAudio = Boolean(currentTrack?.audioUrl);

    if (isPlaying && !hasCustomAudio) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContext();
        }
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }

        stopSynth();

        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = suit === 'symbiote' ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(currentTrack.baseFreq || 220, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.03, audioCtxRef.current.currentTime);

        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();

        oscRef.current = osc;
        gainRef.current = gain;
      } catch {
        // Aman jika browser memblokir audio sebelum interaksi
      }
    } else {
      stopSynth();
    }

    return () => stopSynth();
  }, [isPlaying, currentId, suit]);

  useEffect(() => {
    const el = audioElRef.current;
    if (!el) return;
    if (currentTrack?.audioUrl) {
      el.src = currentTrack.audioUrl;
      el.currentTime = progress;
      if (isPlaying) {
        el.play().catch(() => {});
      } else {
        el.pause();
      }
    } else {
      el.pause();
      el.removeAttribute('src');
    }
  }, [currentId, isPlaying]);

  function stopSynth() {
    try {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      if (gainRef.current) {
        gainRef.current.disconnect();
        gainRef.current = null;
      }
    } catch {
      // Abaikan error saat stop oscillator
    }
  }

  function selectTrack(id, autoPlay = true) {
    setCurrentId(id);
    setProgress(0);
    if (autoPlay) setIsPlaying(true);
  }

  function handleNext() {
    const idx = tracks.findIndex((t) => t.id === currentId);
    const nextIdx = (idx + 1) % tracks.length;
    selectTrack(tracks[nextIdx].id, isPlaying);
  }

  function handlePrev() {
    const idx = tracks.findIndex((t) => t.id === currentId);
    const prevIdx = (idx - 1 + tracks.length) % tracks.length;
    selectTrack(tracks[prevIdx].id, isPlaying);
  }

  function toggleLike(id) {
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const newTrack = {
      id: Date.now(),
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Local MP3',
      genre: 'Custom File',
      duration: 180,
      baseFreq: 220,
      color: theme.primary,
      audioUrl: url,
    };
    setTracks((prev) => [newTrack, ...prev]);
    setCurrentId(newTrack.id);
    setProgress(0);
    setIsPlaying(true);
  }

  const pct = Math.min(100, Math.round((progress / (currentTrack?.duration || 1)) * 100));

  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '100vw',
        minHeight: '100dvh',
        backgroundColor: '#09090b',
        color: '#f4f4f5',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'clip',
      }}
    >
      <audio
        ref={audioElRef}
        onLoadedMetadata={(e) => {
          if (Number.isFinite(e.currentTarget.duration) && e.currentTarget.duration > 0) {
            const dur = Math.floor(e.currentTarget.duration);
            setTracks((prev) =>
              prev.map((t) => (t.id === currentTrack.id ? { ...t, duration: dur } : t))
            );
          }
        }}
        onEnded={handleNext}
      />

      {/* Top Bar */}
      <header
        style={{
          boxSizing: 'border-box',
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          padding: '12px 16px',
          borderBottom: '1px solid #27272a',
          backgroundColor: '#111115',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <span
            style={{
              width: '11px',
              height: '11px',
              flexShrink: 0,
              borderRadius: '999px',
              backgroundColor: theme.primary,
              boxShadow: `0 0 12px ${theme.primary}`,
            }}
          />
          <strong style={{ fontSize: '18px', letterSpacing: '0.4px' }}>SpideyFy</strong>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: '#18181b',
              border: `1px solid ${theme.secondary}`,
              color: theme.secondary,
              whiteSpace: 'nowrap',
            }}
          >
            {theme.badge}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxWidth: '100%' }}>
          {Object.entries(SUITS).map(([key, item]) => {
            const active = suit === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSuit(key)}
                style={{
                  boxSizing: 'border-box',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  border: active ? `1px solid ${item.primary}` : '1px solid #27272a',
                  backgroundColor: active ? item.primary : '#18181b',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          boxSizing: 'border-box',
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '16px',
          padding: '16px',
          maxWidth: '1160px',
          width: '100%',
          margin: '0 auto',
          alignItems: 'start',
        }}
      >
        {/* Left Panel */}
        <section
          style={{
            boxSizing: 'border-box',
            width: '100%',
            minWidth: 0,
            backgroundColor: '#111115',
            border: '1px solid #27272a',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <input
            type="text"
            placeholder="Cari judul, artis, atau genre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              boxSizing: 'border-box',
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #27272a',
              backgroundColor: '#09090b',
              color: '#ffffff',
              fontSize: '14px',
              outline: 'none',
            }}
          />

          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <button
              type="button"
              onClick={() => setShowLikedOnly(false)}
              style={{
                boxSizing: 'border-box',
                flex: 1,
                minWidth: 0,
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #27272a',
                backgroundColor: !showLikedOnly ? theme.secondary : '#18181b',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Semua ({tracks.length})
            </button>
            <button
              type="button"
              onClick={() => setShowLikedOnly(true)}
              style={{
                boxSizing: 'border-box',
                flex: 1,
                minWidth: 0,
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #27272a',
                backgroundColor: showLikedOnly ? theme.primary : '#18181b',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Disukai ({likedIds.length})
            </button>
          </div>

          <label
            style={{
              boxSizing: 'border-box',
              width: '100%',
              display: 'block',
              textAlign: 'center',
              padding: '10px 12px',
              borderRadius: '8px',
              border: `1px dashed ${theme.secondary}`,
              color: '#e4e4e7',
              fontSize: '13px',
              cursor: 'pointer',
              backgroundColor: '#0d0d11',
            }}
          >
            + Upload MP3 Lokal
            <input
              type="file"
              accept="audio/*"
              onChange={handleUpload}
              style={{ display: 'none' }}
            />
          </label>
        </section>

        {/* Right Panel: Track List */}
        <section
          style={{
            boxSizing: 'border-box',
            width: '100%',
            minWidth: 0,
            backgroundColor: '#111115',
            border: '1px solid #27272a',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <h2 style={{ margin: '0 0 6px', fontSize: '16px', color: '#ffffff' }}>Daftar Lagu</h2>
          {filteredTracks.length === 0 ? (
            <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px' }}>
              Tidak ada lagu yang cocok.
            </p>
          ) : (
            filteredTracks.map((track, index) => {
              const active = track.id === currentTrack?.id;
              const isLiked = likedIds.includes(track.id);
              return (
                <div
                  key={track.id}
                  onClick={() => selectTrack(track.id, true)}
                  style={{
                    boxSizing: 'border-box',
                    width: '100%',
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    backgroundColor: active ? '#1d1d24' : '#0d0d11',
                    border: active ? `1px solid ${theme.primary}` : '1px solid #1f1f25',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '14px',
                        color: active ? theme.primary : '#ffffff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {index + 1}. {track.title}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#a1a1aa',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {track.artist} • {track.genre}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexShrink: 0,
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track.id);
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: isLiked ? theme.primary : '#71717a',
                        fontSize: '16px',
                        cursor: 'pointer',
                        padding: '2px 4px',
                      }}
                      aria-label="Suka"
                    >
                      {isLiked ? '♥' : '♡'}
                    </button>
                    <span style={{ fontSize: '12px', color: '#a1a1aa' }}>
                      {formatTime(track.duration)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

      {/* Bottom Player Bar */}
      <footer
        style={{
          boxSizing: 'border-box',
          width: '100%',
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#111115',
          borderTop: '1px solid #27272a',
          padding: '12px 16px',
          boxShadow: `0 -6px 24px ${theme.glow}`,
        }}
      >
        <div
          style={{
            boxSizing: 'border-box',
            maxWidth: '1160px',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ minWidth: 0, flex: '1 1 160px' }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: '14px',
                color: '#ffffff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentTrack?.title}
            </div>
            <div style={{ fontSize: '12px', color: '#a1a1aa' }}>{currentTrack?.artist}</div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={handlePrev}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #27272a',
                backgroundColor: '#18181b',
                color: '#ffffff',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              style={{
                padding: '8px 18px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: theme.primary,
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              type="button"
              onClick={handleNext}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #27272a',
                backgroundColor: '#18181b',
                color: '#ffffff',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Next
            </button>
          </div>

          <div style={{ minWidth: '150px', flex: '1 1 220px', maxWidth: '300px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#a1a1aa',
                marginBottom: '4px',
              }}
            >
              <span>{formatTime(progress)}</span>
              <span>{formatTime(currentTrack?.duration)}</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '999px',
                backgroundColor: '#272>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setShowLikedOnly(false)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #27272a',
                background: !showLikedOnly ? theme.secondary : '#18181b',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Semua ({tracks.length})
            </button>
            <button
              type="button"
              onClick={() => setShowLikedOnly(true)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #27272a',
                background: showLikedOnly ? theme.primary : '#18181b',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Disukai ({likedIds.length})
            </button>
          </div>

          <label
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '10px',
              borderRadius: '8px',
              border: `1px dashed ${theme.secondary}`,
              color: '#e4e4e7',
              fontSize: '13px',
              cursor: 'pointer',
              background: '#0d0d11',
            }}
          >
            + Upload MP3 Lokal
            <input
              type="file"
              accept="audio/*"
              onChange={handleUpload}
              style={{ display: 'none' }}
            />
          </label>
        </section>

        <section
          style={{
            background: '#111115',
            border: '1px solid #27272a',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <h2 style={{ margin: '0 0 8px', fontSize: '16px' }}>Daftar Lagu</h2>
          {filteredTracks.length === 0 ? (
            <p style={{ color: '#a1a1aa', fontSize: '14px' }}>Tidak ada lagu yang cocok.</p>
          ) : (
            filteredTracks.map((track, index) => {
              const active = track.id === currentTrack?.id;
              const isLiked = likedIds.includes(track.id);
              return (
                <div
                  key={track.id}
                  onClick={() => selectTrack(track.id, true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    background: active ? '#1d1d24' : '#0d0d11',
                    border: active ? `1px solid ${theme.primary}` : '1px solid #1f1f25',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '14px',
                        color: active ? theme.primary : '#fff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {index + 1}. {track.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                      {track.artist} • {track.genre}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track.id);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: isLiked ? theme.primary : '#71717a',
                        fontSize: '16px',
                        cursor: 'pointer',
                      }}
                      aria-label="Suka"
                    >
                      {isLiked ? '♥' : '♡'}
                    </button>
                    <span style={{ fontSize: '12px', color: '#a1a1aa' }}>
                      {formatTime(track.duration)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

      <footer
        style={{
          position: 'sticky',
          bottom: 0,
          background: '#111115',
          borderTop: '1px solid #27272a',
          padding: '12px 20px',
          boxShadow: `0 -6px 24px ${theme.glow}`,
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>{currentTrack?.title}</div>
            <div style={{ fontSize: '12px', color: '#a1a1aa' }}>{currentTrack?.artist}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handlePrev}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #27272a',
                background: '#18181b',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              style={{
                padding: '8px 18px',
                borderRadius: '999px',
                border: 'none',
                background: theme.primary,
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              type="button"
              onClick={handleNext}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #27272a',
                background: '#18181b',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Next
            </button>
          </div>

          <div style={{ minWidth: '160px', flex: '0 1 240px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#a1a1aa',
                marginBottom: '4px',
              }}
            >
              <span>{formatTime(progress)}</span>
              <span>{formatTime(currentTrack?.duration)}</span>
            </div>
            <div
              style={{
                height: '6px',
                borderRadius: '999px',
                background: '#27272a',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: theme.secondary,
                  transition: 'width 0.25s linear',
                }}
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
