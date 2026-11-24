<!DOCTYPE html>
<html lang="en" data-suit="classic">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SpideyFy — Spider-Verse Music Player</title>

  <!-- Google Fonts: Plus Jakarta Sans & Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
          },
          colors: {
            spotify: {
              black: '#000000',
              base: '#121212',
              elevated: '#181818',
              highlight: '#242424',
              hover: '#282828',
              muted: '#B3B3B3',
            },
          },
        },
      },
    };
  </script>

  <style>
    /* ==========================================================================
       SUIT MODE THEME VARIABLES (Classic, Miles Morales, Symbiote)
       ========================================================================== */
    :root,
    html[data-suit="classic"] {
      --accent: #E62429;
      --accent-hover: #FF3B42;
      --accent-secondary: #2563EB;
      --accent-glow: rgba(230, 36, 41, 0.5);
      --accent-soft: rgba(230, 36, 41, 0.16);
      --hero-from: rgba(185, 22, 32, 0.52);
      --hero-mid: rgba(24, 52, 128, 0.28);
      --web-stroke: rgba(255, 255, 255, 0.08);
      --viz-top: #FF4D54;
      --viz-mid: #E62429;
      --viz-bot: #2563EB;
    }

    html[data-suit="miles"] {
      --accent: #FF2A3B;
      --accent-hover: #FF4D5C;
      --accent-secondary: #00D4FF;
      --accent-glow: rgba(255, 42, 59, 0.55);
      --accent-soft: rgba(0, 212, 255, 0.14);
      --hero-from: rgba(220, 24, 52, 0.52);
      --hero-mid: rgba(0, 180, 235, 0.22);
      --web-stroke: rgba(0, 212, 255, 0.1);
      --viz-top: #00D4FF;
      --viz-mid: #FF2A3B;
      --viz-bot: #991B1B;
    }

    html[data-suit="symbiote"] {
      --accent: #A855F7;
      --accent-hover: #C084FC;
      --accent-secondary: #E2E8F0;
      --accent-glow: rgba(168, 85, 247, 0.55);
      --accent-soft: rgba(168, 85, 247, 0.16);
      --hero-from: rgba(110, 40, 190, 0.48);
      --hero-mid: rgba(148, 163, 184, 0.18);
      --web-stroke: rgba(226, 232, 240, 0.09);
      --viz-top: #F8FAFC;
      --viz-mid: #A855F7;
      --viz-bot: #4C1D95;
    }

    /* Smooth theme transitions */
    body, .theme-transition {
      transition: background-color 0.35s ease, border-color 0.35s ease, color 0.25s ease;
    }

    /* Accent utility bindings */
    .bg-accent { background-color: var(--accent); }
    .bg-accent-soft { background-color: var(--accent-soft); }
    .hover-bg-accent:hover { background-color: var(--accent-hover); }
    .text-accent { color: var(--accent); }
    .text-accent-secondary { color: var(--accent-secondary); }
    .border-accent { border-color: var(--accent); }
    .shadow-accent { box-shadow: 0 8px 24px var(--accent-glow); }

    /* Hero gradient with subtle Spider-Verse halftone overlay */
    .hero-surface {
      background: linear-gradient(180deg, var(--hero-from) 0%, var(--hero-mid) 32%, #121212 72%);
    }

    .halftone-overlay {
      background-image: radial-gradient(rgba(255, 255, 255, 0.085) 1px, transparent 1px);
      background-size: 9px 9px;
      mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0) 95%);
      -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0) 95%);
    }

    /* Subtle dark scrollbars */
    ::-webkit-scrollbar { width: 8px; height: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.14); border-radius: 9999px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.28); }

    /* Card hover play button reveal */
    .music-card .card-play-btn {
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.22s ease, transform 0.22s ease, background-color 0.2s ease, scale 0.15s ease;
    }
    .music-card:hover .card-play-btn,
    .music-card.is-playing-card .card-play-btn {
      opacity: 1;
      transform: translateY(0);
    }

    /* Quick Access Pill play button */
    .quick-pill .pill-play-btn {
      opacity: 0;
      transform: scale(0.9);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .quick-pill:hover .pill-play-btn,
    .quick-pill.is-playing-card .pill-play-btn {
      opacity: 1;
      transform: scale(1);
    }

    /* Animated Equalizer Bars for active track */
    .eq-bars {
      display: inline-flex;
      align-items: flex-end;
      gap: 2px;
      height: 14px;
      width: 14px;
    }
    .eq-bars span {
      display: block;
      width: 3px;
      background-color: var(--accent);
      border-radius: 2px;
      animation: eqBounce 0.85s ease-in-out infinite;
    }
    .eq-bars span:nth-child(1) { height: 40%; animation-delay: 0s; }
    .eq-bars span:nth-child(2) { height: 100%; animation-delay: 0.2s; }
    .eq-bars span:nth-child(3) { height: 65%; animation-delay: 0.4s; }
    .eq-bars.paused span { animation-play-state: paused; height: 28%; }

    @keyframes eqBounce {
      0%, 100% { height: 25%; }
      50% { height: 100%; }
    }

    /* ==========================================================================
       CUSTOM WEB-LINE PROGRESS BAR & SPIDER NODE SCRUBBER
       ========================================================================== */
    .web-progress-track {
      position: relative;
      height: 16px;
      display: flex;
      align-items: center;
      cursor: pointer;
      touch-action: none;
    }
    .web-progress-rail {
      position: relative;
      width: 100%;
      height: 4px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.18);
      overflow: visible;
    }
    .web-progress-track:hover .web-progress-rail {
      height: 5px;
    }
    .web-progress-fill {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      border-radius: 9999px;
      background: linear-gradient(90deg, var(--accent-secondary) 0%, var(--accent) 70%, #ffffff 100%);
      box-shadow: 0 0 10px var(--accent-glow);
      pointer-events: none;
    }
    .web-progress-thumb {
      position: absolute;
      top: 50%;
      width: 16px;
      height: 16px;
      transform: translate(-50%, -50%) scale(0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      background: #ffffff;
      color: var(--accent);
      box-shadow: 0 0 12px var(--accent-glow), 0 0 0 2px var(--accent);
      opacity: 0.92;
      transition: transform 0.15s ease, opacity 0.15s ease;
      pointer-events: none;
    }
    .web-progress-track:hover .web-progress-thumb,
    .web-progress-track.dragging .web-progress-thumb {
      transform: translate(-50%, -50%) scale(1.15);
      opacity: 1;
    }

    /* Custom Volume Slider */
    input[type="range"].spidey-range {
      -webkit-appearance: none;
      appearance: none;
      height: 4px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.2);
      outline: none;
      cursor: pointer;
    }
    input[type="range"].spidey-range::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #ffffff;
      border: 2px solid var(--accent);
      box-shadow: 0 0 8px var(--accent-glow);
      cursor: pointer;
      transition: transform 0.15s ease;
    }
    input[type="range"].spidey-range:hover::-webkit-slider-thumb {
      transform: scale(1.2);
    }

    /* Spidey-Sense subtle pulse ring on active play */
    @keyframes spideyPulse {
      0% { box-shadow: 0 0 0 0 var(--accent-glow); }
      70% { box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
      100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
    }
    .pulse-active {
      animation: spideyPulse 2.2s infinite;
    }

    /* Prevent horizontal overflow */
    html, body {
      overflow-x: hidden;
      background-color: #000000;
      color: #ffffff;
    }
  </style>
</head>
<body class="h-screen w-screen overflow-hidden bg-black text-white select-none flex flex-col">

  <!-- Hidden File Input for Local MP3/WAV/OGG Uploads -->
  <input id="audioUploadInput" type="file" accept="audio/*" multiple class="hidden" />

  <!-- ======================================================================
       MAIN 3-PANEL SPOTIFY LAYOUT SHELL
       ====================================================================== -->
  <div class="flex-1 flex min-h-0 gap-2 p-2 pb-0 overflow-hidden relative">

    <!-- Mobile Backdrop for Sidebar / Now Playing Drawer -->
    <div id="mobileBackdrop" class="fixed inset-0 bg-black/70 backdrop-blur-xs z-30 hidden lg:hidden" onclick="closeMobileDrawers()"></div>

    <!-- ====================================================================
         1. LEFT SIDEBAR (Navigation, Actions, User Playlists)
         ==================================================================== -->
    <aside id="leftSidebar" class="fixed lg:static inset-y-2 left-2 z-40 w-[268px] xl:w-[280px] flex flex-col gap-2 transform -translate-x-[110%] lg:translate-x-0 transition-transform duration-300 ease-out shrink-0">

      <!-- Top Brand + Primary Navigation Card -->
      <div class="bg-[#121212] rounded-xl p-4 relative overflow-hidden border border-white/[0.05]">
        <!-- Subtle Corner Cobweb SVG -->
        <svg class="absolute -top-2 -right-2 w-28 h-28 pointer-events-none" viewBox="0 0 120 120" fill="none" aria-hidden="true">
          <g stroke="var(--web-stroke)" stroke-width="1">
            <line x1="120" y1="0" x2="10" y2="10" />
            <line x1="120" y1="0" x2="32" y2="48" />
            <line x1="120" y1="0" x2="68" y2="86" />
            <line x1="120" y1="0" x2="105" y2="112" />
            <path d="M95 0 Q88 20 120 26" />
            <path d="M70 0 Q62 34 86 52 Q104 60 120 58" />
            <path d="M42 0 Q38 46 66 74 Q90 92 120 90" />
          </g>
        </svg>

        <!-- Brand Logo: SpideyFy -->
        <div class="flex items-center justify-between mb-5 relative z-10">
          <button onclick="navigate('home')" class="flex items-center gap-2.5 group focus:outline-none">
            <div class="w-9 h-9 rounded-full bg-accent flex items-center justify-center shadow-accent group-hover:scale-105 transition-transform">
              <!-- Minimalist Spider-Web + Soundwave SVG Icon -->
              <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9.5" stroke-opacity="0.35" />
                <path d="M12 2.5v19M2.5 12h19M5.3 5.3l13.4 13.4M18.7 5.3L5.3 18.7" stroke-opacity="0.3" stroke-width="1.2" />
                <!-- Soundwave spider silhouette center -->
                <path d="M7.5 10.5v3M10 8.5v7M12 6.5v11M14 8.5v7M16.5 10.5v3" stroke="#ffffff" stroke-width="2" />
              </svg>
            </div>
            <div class="text-left">
              <span class="font-display font-extrabold text-lg tracking-tight text-white block leading-none">
                Spidey<span class="text-accent">Fy</span>
              </span>
              <span class="text-[10px] font-medium tracking-widest uppercase text-neutral-400">Earth-616 Audio</span>
            </div>
          </button>

          <button onclick="closeMobileDrawers()" class="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10" aria-label="Close menu">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Primary Navigation Links -->
        <nav class="space-y-1 relative z-10" aria-label="Main navigation">
          <button data-nav="home" onclick="navigate('home')" class="nav-item w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-neutral-300 hover:text-white hover:bg-white/[0.06] transition">
            <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5.5v-6.5h-5V21H4a1 1 0 01-1-1v-9.5z"/></svg>
            <span>Home</span>
          </button>
          <button data-nav="search" onclick="navigate('search')" class="nav-item w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-neutral-300 hover:text-white hover:bg-white/[0.06] transition">
            <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path stroke-linecap="round" d="M20 20l-3.5-3.5"/></svg>
            <span>Search</span>
          </button>
          <button data-nav="library" onclick="navigate('library')" class="nav-item w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-neutral-300 hover:text-white hover:bg-white/[0.06] transition">
            <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 19V5a1 1 0 011-1h2a1 1 0 011 1v14M10 19V7a1 1 0 011-1h2a1 1 0 011 1v12M16 19l2-13 3 .5-2 12.5"/></svg>
            <span>Your Library</span>
          </button>
        </nav>
      </div>

      <!-- Library Actions + Scrollable Playlists Card -->
      <div class="bg-[#121212] rounded-xl flex-1 flex flex-col min-h-0 border border-white/[0.05] overflow-hidden">
        <!-- Quick Actions Header -->
        <div class="p-3 pb-2 space-y-1.5 border-b border-white/[0.06]">
          <div class="flex items-center justify-between px-2 pb-1">
            <span class="text-xs font-bold uppercase tracking-wider text-neutral-400">Your Web Vault</span>
            <button onclick="openCreatePlaylistModal()" title="Create Playlist" class="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.3" viewBox="0 0 24 24"><path stroke-linecap="round" d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>

          <!-- Create Playlist Button -->
          <button onclick="openCreatePlaylistModal()" class="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/[0.06] transition">
            <span class="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center text-white shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" d="M12 5v14M5 12h14"/></svg>
            </span>
            <span class="truncate">Create Playlist</span>
          </button>

          <!-- Liked Songs Button (Custom Spider-Heart Icon) -->
          <button onclick="openPlaylist('liked')" id="sidebarLikedBtn" class="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/[0.06] transition">
            <span class="w-7 h-7 rounded-md flex items-center justify-center shrink-0 shadow-sm" style="background: linear-gradient(135deg, var(--accent) 0%, var(--accent-secondary) 100%);">
              <!-- Spider-Heart SVG -->
              <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                <path d="M12 6.5v11M7.5 10l9 4M16.5 10l-9 4" stroke="rgba(0,0,0,0.35)" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
            </span>
            <div class="flex-1 text-left min-w-0">
              <div class="truncate leading-tight">Liked Songs</div>
              <div id="sidebarLikedCount" class="text-[11px] text-neutral-400">0 songs</div>
            </div>
          </button>

          <!-- Upload Local MP3 Button -->
          <button onclick="triggerAudioUpload()" class="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/[0.06] transition group">
            <span class="w-7 h-7 rounded-md bg-accent-soft border border-white/10 flex items-center justify-center text-accent shrink-0 group-hover:scale-105 transition-transform">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0-12l-4 4m4-4l4 4"/></svg>
            </span>
            <div class="flex-1 text-left min-w-0">
              <div class="truncate leading-tight">Upload MP3</div>
              <div class="text-[11px] text-neutral-400">Play local audio</div>
            </div>
          </button>
        </div>

        <!-- Scrollable Playlist List -->
        <div id="sidebarPlaylistList" class="flex-1 overflow-y-auto p-2 space-y-1">
          <!-- Populated dynamically by JS -->
        </div>
      </div>
    </aside>

    <!-- ====================================================================
         2. MAIN CONTENT VIEW (Top Bar + Dynamic View Container)
         ==================================================================== -->
    <main class="flex-1 bg-[#121212] rounded-xl flex flex-col min-w-0 min-h-0 overflow-hidden border border-white/[0.05] relative">

      <!-- Sticky Top Navigation Bar -->
      <header class="h-16 px-4 md:px-6 flex items-center justify-between gap-3 shrink-0 z-20 bg-[#121212]/80 backdrop-blur-md border-b border-white/[0.04]">
        <div class="flex items-center gap-2 min-w-0">
          <!-- Mobile Sidebar Toggle -->
          <button onclick="toggleLeftSidebar()" class="lg:hidden p-2 rounded-full bg-black/50 hover:bg-white/10 text-neutral-200 transition" aria-label="Open menu">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>

          <!-- History Back / Forward -->
          <div class="hidden sm:flex items-center gap-1.5">
            <button id="btnHistoryBack" onclick="goBack()" class="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-neutral-300 hover:text-white flex items-center justify-center disabled:opacity-35 transition" title="Go back">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button id="btnHistoryForward" onclick="goForward()" class="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-neutral-300 hover:text-white flex items-center justify-center disabled:opacity-35 transition" title="Go forward">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <!-- Compact Top Search Input (Visible in Search View) -->
          <div id="topSearchWrapper" class="hidden
