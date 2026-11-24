import { useState, useEffect, useRef } from 'react';

const SUITS = {
  classic: {
    name: 'Classic Suit',
    primary: '#e62429',
    secondary: '#1d4ed8',
    gradient: 'linear-gradient(180deg, rgba(230,36,41,0.42) 0%, rgba(29,78,216,0.18) 45%, #121212 100%)',
    badge: 'EARTH-616',
  },
  miles: {
    name: 'Miles Morales',
    primary: '#ef4444',
    secondary: '#06b6d4',
    gradient: 'linear-gradient(180deg, rgba(6,182,212,0.38) 0%, rgba(239,68,68,0.2) 45%, #121212 100%)',
    badge: 'EARTH-1610',
  },
  symbiote: {
    name: 'Symbiote',
    primary: '#a855f7',
    secondary: '#e2e8f0',
    gradient: 'linear-gradient(180deg, rgba(168,85,247,0.4) 0%, rgba(39,39,42,0.3) 45%, #121212 100%)',
    badge: 'SYMBIOTE-800',
  },
};

const INITIAL_TRACKS = [
  { id: 1, title: 'Sunflower (Spider-Verse Edit)', artist: 'Post Malone, Swae Lee', album: 'Into the Spider-Verse', duration: 158, baseFreq: 196, cover: '🕷️' },
  { id: 2, title: 'What’s Up Danger', artist: 'Blackway & Black Caviar', album: 'Into the Spider-Verse', duration: 222, baseFreq: 220, cover: '⚡' },
  { id: 3, title: 'Am I Dreaming', artist: 'Metro Boomin, A$AP Rocky', album: 'Across the Spider-Verse', duration: 256, baseFreq: 174.61, cover: '🌀' },
  { id: 4, title: 'Annihilate', artist: 'Metro Boomin, Swae Lee', album: 'Across the Spider-Verse', duration: 231, baseFreq: 146.83, cover: '🕸️' },
  { id: 5, title: 'Calling', artist: 'Metro Boomin, NAV', album: 'Across the Spider-Verse', duration: 219, baseFreq: 246.94, cover: '🌃' },
  { id: 6, title: 'Self Love', artist: 'Metro Boomin, Coi Leray', album: 'Across the Spider-Verse', duration: 189, baseFreq: 261.63, cover: '💜' },
  { id: 7, title: 'Queens Midnight Swing', artist: 'Peter Parker Sessions', album: 'Daily Bugle Tapes', duration: 164, baseFreq: 293.66, cover: '🏙️' },
  { id: 8, title: 'Venom Symbiote Surge', artist: 'Eddie Brock Mix', album: 'Black Suit OST', duration: 194, baseFreq: 130.81, cover: '🖤' },
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
  const [tab, setTab] = useState('all'); // 'all' | 'liked'
  const [likedIds, setLikedIds] = useState([1, 2, 3]);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);
  const audioElRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const theme = SUITS[suit];
  const currentTrack = tracks.find((t) => t.id === currentId) || tracks[0];

  const visibleTracks = tracks.filter((t) => {
    const q = search.toLowerCase();
    const matchQ =
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.album.toLowerCase().includes(q);
    const matchTab = tab === 'liked' ? likedIds.includes(t.id) : true;
    return matchQ && matchTab;
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
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
        if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
        stopSynth();

        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = suit === 'symbiote' ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(currentTrack.baseFreq || 220, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.025, audioCtxRef.current.currentTime);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        oscRef.current = osc;
        gainRef.current = gain;
      } catch {}
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
      if (isPlaying) el.play().catch(() => {});
      else el.pause();
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
    } catch {}
  }

  function selectTrack(id, autoPlay = true) {
    setCurrentId(id);
    setProgress(0);
    if (autoPlay) setIsPlaying(true);
  }

  function handleNext() {
    const idx = tracks.findIndex((t) => t.id === currentId);
    const next = tracks[(idx + 1) % tracks.length];
    selectTrack(next.id, isPlaying);
  }

  function handlePrev() {
    const idx = tracks.findIndex((t) => t.id === currentId);
    const prev = tracks[(idx - 1 + tracks.length) % tracks.length];
    selectTrack(prev.id, isPlaying);
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
      album: 'Uploaded Tracks',
      duration: 180,
      baseFreq: 220,
      cover: '🎵',
      audioUrl: url,
    };
    setTracks((prev) => [newTrack, ...prev]);
    setCurrentId(newTrack.id);
    setProgress(0);
    setIsPlaying(true);
  }

  function handleSeek(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newSec = Math.floor(ratio * (currentTrack?.duration || 1));
    setProgress(newSec);
    if (audioElRef.current && audioElRef.current.src) {
      audioElRef.current.currentTime = newSec;
    }
  }

  const pct = Math.min(100, (progress / (currentTrack?.duration || 1)) * 100);

  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '100vw',
        maxWidth: '100%',
        height: '100dvh',
        backgroundColor: '#000000',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: isMobile ? '0' : '8px',
        gap: isMobile ? '0' : '8px',
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

      {/* BODY: SIDEBAR + MAIN VIEW */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          gap: '8px',
          overflow: 'hidden',
        }}
      >
        {/* SIDEBAR (Desktop) */}
        {!isMobile && (
          <aside
            style={{
              width: '260px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {/* Brand & Nav */}
            <div
              style={{
                backgroundColor: '#121212',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: theme.primary,
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 900,
                    fontSize: '16px',
                  }}
                >
                  🕷️
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '17px', letterSpacing: '-0.3px' }}>
                    SpideyFy
                  </div>
                  <div style={{ fontSize: '10px', color: theme.secondary, fontWeight: 700 }}>
                    {theme.badge}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTab('all')}
                style={{
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  color: tab === 'all' ? '#ffffff' : '#a7a7a7',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                🏠 Home / Semua Lagu
              </button>

              <button
                type="button"
                onClick={() => setTab('liked')}
                style={{
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  color: tab === 'liked' ? '#ffffff' : '#a7a7a7',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                ❤️ Liked Songs ({likedIds.length})
              </button>
            </div>

            {/* Library & Upload */}
            <div
              style={{
                flex: 1,
                backgroundColor: '#121212',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                overflowY: 'auto',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#a7a7a7' }}>
                YOUR SPIDER-LIBRARY
              </div>

              <label
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '10px',
                  borderRadius: '999px',
                  backgroundColor: '#242424',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                + Tambah MP3 Lokal
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleUpload}
                  style={{ display: 'none' }}
                />
              </label>

              <div style={{ fontSize: '12px', color: '#71717a', marginTop: '4px' }}>
                Pilih Suit Mode:
              </div>
              {Object.entries(SUITS).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSuit(key)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: suit === key ? `1px solid ${item.primary}` : '1px solid transparent',
                    backgroundColor: suit === key ? '#1f1f23' : '#18181b',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* MAIN CONTENT AREA */}
        <main
          style={{
            flex: 1,
            minWidth: 0,
            backgroundColor: '#121212',
            borderRadius: isMobile ? '0' : '10px',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            backgroundImage: theme.gradient,
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 340px',
          }}
        >
          {/* Sticky Top Search & Suit Switcher */}
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              padding: '14px 20px',
              backgroundColor: 'rgba(18, 18, 18, 0.78)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <input
              type="text"
              placeholder="Apa yang ingin kamu dengarkan?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                boxSizing: 'border-box',
                width: isMobile ? '100%' : '290px',
                padding: '9px 14px',
                borderRadius: '999px',
                border: '1px solid #2a2a2a',
                backgroundColor: '#242424',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none',
              }}
            />

            {isMobile && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', width: '100%' }}>
                {Object.entries(SUITS).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSuit(key)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '999px',
                      border: 'none',
                      backgroundColor: suit === key ? item.primary : '#242424',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {item.name}
                  </button>
                ))}
                <label
                  style={{
                    padding: '5px 10px',
                    borderRadius: '999px',
                    backgroundColor: '#242424',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  + MP3
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Spotify Playlist Hero Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: isMobile ? 'center' : 'flex-end',
              gap: '20px',
              padding: '16px 20px 20px',
            }}
          >
            <div
              style={{
                width: isMobile ? '84px' : '150px',
                height: isMobile ? '84px' : '150px',
                flexShrink: 0,
                borderRadius: '8px',
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                boxShadow: '0 12px 32px rgba(0,0,0,0.55)',
                display: 'grid',
                placeItems: 'center',
                fontSize: isMobile ? '40px' : '64px',
              }}
            >
              🕷️
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px' }}>
                PLAYLIST • {theme.badge}
              </div>
              <h1
                style={{
                  margin: '4px 0 8px',
                  fontSize: isMobile ? '24px' : '42px',
                  fontWeight: 900,
                  lineHeight: 1.1,
                }}
              >
                Spider-Verse Mix
              </h1>
              <div style={{ fontSize: '13px', color: '#d4d4d8' }}>
                SpideyFy • {visibleTracks.length} lagu • {theme.name}
              </div>
            </div>
          </div>

          {/* Action Bar (Big Play Button + Filter Tabs) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '0 20px 16px',
            }}
          >
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: theme.primary,
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
              }}
            >
              {isPlaying ? '❚❚' : '▶'}
            </button>

            <button
              type="button"
              onClick={() => setTab('all')}
              style={{
                padding: '7px 14px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: tab === 'all' ? '#ffffff' : '#242424',
                color: tab === 'all' ? '#000000' : '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Semua ({tracks.length})
            </button>

            <button
              type="button"
              onClick={() => setTab('liked')}
              style={{
                padding: '7px 14px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: tab === 'liked' ? '#ffffff' : '#242424',
                color: tab === 'liked' ? '#000000' : '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Disukai ({likedIds.length})
            </button>
          </div>

          {/* Spotify Track Table */}
          <div style={{ padding: '0 12px 24px' }}>
            {visibleTracks.map((track, idx) => {
              const active = track.id === currentTrack?.id;
              const liked = likedIds.includes(track.id);
              return (
                <div
                  key={track.id}
   
