import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Music, Volume2, ListMusic, Search, Loader2 } from 'lucide-react';

// p5js skill not needed here, using standard fetch
const DEFAULT_SONGS = [
  { id: 1, title: 'Music One', artist: 'Artist A', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'Music Two', artist: 'Artist B', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
];

export default function MusicPlayer() {
  const [songs, setSongs] = useState(DEFAULT_SONGS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const audioRef = useRef(null);

  const searchMusic = async (e) => {
    if (e.key !== 'Enter' || !searchQuery.trim()) return;
    setIsSearching(true);
    
    try {
      // Menggunakan Piped API (gratis, tanpa API Key)
      const response = await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(searchQuery)}&filter=music`);
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const topResult = data.items[0];
        const newSong = {
          id: topResult.url,
          title: topResult.title,
          artist: topResult.uploader,
          // Piped stream URL - real playback needs a direct stream extractor or player
          url: `https://piped-stream.kavin.rocks/videoplayback?id=${topResult.url.split('/')[2]}` 
        };
        setSongs([newSong, ...songs]);
        setCurrentIdx(0);
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Gagal cari lagu:", err);
    } finally {
      setIsSearching(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [currentIdx, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const skip = (dir) => {
    let next = currentIdx + dir;
    if (next < 0) next = songs.length - 1;
    if (next >= songs.length) next = 0;
    setCurrentIdx(next);
  };

  const onTimeUpdate = () => {
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    setProgress((cur / dur) * 100 || 0);
    setDuration(dur);
  };

  const changeProgress = (e) => {
    const newTime = (e.target.value / 100) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setProgress(e.target.value);
  };

  const formatTime = (time) => {
    if (!time) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-black text-white p-4 font-sans pt-10">
      <div className="bg-zinc-900 p-6 rounded-3xl shadow-2xl w-full max-w-sm flex flex-col gap-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text"
            placeholder="Cari lagu di sini..."
            className="w-full bg-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={searchMusic}
          />
          {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 animate-spin" size={16} />}
        </div>

        {/* Album Art */}
        <div className="aspect-square bg-gradient-to-br from-zinc-700 to-zinc-800 rounded-2xl flex items-center justify-center shadow-inner relative group">
          <Music size={80} className="text-zinc-500 group-hover:scale-110 transition-transform" />
          {isPlaying && (
            <div className="absolute bottom-4 right-4 flex gap-1 items-end h-8">
              <div className="w-1 bg-white animate-[bounce_1s_infinite] h-4"></div>
              <div className="w-1 bg-white animate-[bounce_1.2s_infinite] h-8"></div>
              <div className="w-1 bg-white animate-[bounce_0.8s_infinite] h-6"></div>
            </div>
          )}
        </div>
        
        {/* Info */}
        <div>
          <h2 className="text-xl font-bold truncate">{songs[currentIdx].title}</h2>
          <p className="text-zinc-400 text-sm font-medium">{songs[currentIdx].artist}</p>
        </div>

        <audio 
          ref={audioRef} 
          src={songs[currentIdx].url} 
          onTimeUpdate={onTimeUpdate}
          onEnded={() => skip(1)}
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
        />

        {/* Progress Bar */}
        <div>
          <input 
            type="range" 
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-white"
            value={progress}
            onChange={changeProgress}
          />
          <div className="flex justify-between text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">
            <span>{formatTime(audioRef.current ? audioRef.current.currentTime : 0)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-2">
          <button onClick={() => skip(-1)} className="hover:text-white text-zinc-400 transition-colors">
            <SkipBack size={28} fill="currentColor" />
          </button>
          
          <button 
            onClick={togglePlay} 
            className="bg-white text-black p-4 rounded-full hover:scale-105 transition-transform shadow-xl"
          >
            {isPlaying ? <Pause size={28} fill="black" /> : <Play size={28} fill="black" className="ml-1" />}
          </button>
          
          <button onClick={() => skip(1)} className="hover:text-white text-zinc-400 transition-colors">
            <SkipForward size={28} fill="currentColor" />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3 text-zinc-500 px-1">
          <Volume2 size={16} />
          <input 
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="h-1 flex-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-400"
          />
        </div>

        {/* Playlist */}
        <div className="mt-2 border-t border-zinc-800 pt-4">
          <div className="flex items-center gap-2 mb-3 text-zinc-400 text-xs font-bold uppercase tracking-widest">
            <ListMusic size={14} />
            <span>Playlist</span>
          </div>
          <div className="max-h-40 overflow-y-auto pr-1 space-y-1 scrollbar-hide">
            {songs.map((song, idx) => (
              <button 
                key={song.id}
                onClick={() => {
                  setCurrentIdx(idx);
                  setIsPlaying(true);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors group ${
                  currentIdx === idx ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold truncate max-w-[180px]">{song.title}</span>
                  <span className="text-[10px] opacity-60">{song.artist}</span>
                </div>
                {currentIdx === idx && isPlaying && (
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
