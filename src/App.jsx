import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Search, Globe, Radio, MapPin, Music, Wifi, AlertCircle, Sparkles, X, Bot, MessageSquare, Loader2, Activity, Zap, Waves, Menu, RefreshCw, Star } from 'lucide-react';

// --- AYARLAR ---
const GOOGLE_AD_CLIENT_ID = "ca-pub-3676498147737928"; // Sizin ID'niz eklendi
const IS_ADSENSE_LIVE = true; // Reklamlar aktif edildi
const apiKey = ""; 

// --- VIP İSTASYONLAR ---
const VIP_STATIONS = {
  TR: [
    { name: "Power Türk", url_resolved: "https://listen.powerapp.com.tr/powerturk/mpeg/icecast.audio", favicon: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Power_T%C3%BCrk_logo.svg", tags: "pop,türkçe" },
    { name: "Power FM", url_resolved: "https://listen.powerapp.com.tr/powerfm/mpeg/icecast.audio", favicon: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Power_FM_logo.svg", tags: "pop,hit" },
    { name: "Metro FM", url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/METRO_FM_SC", favicon: "https://upload.wikimedia.org/wikipedia/tr/f/f7/Metro_FM_logo.png", tags: "pop,yabancı" },
    { name: "Süper FM", url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/SUPER_FM_SC", favicon: "https://upload.wikimedia.org/wikipedia/tr/b/b5/S%C3%BCper_FM_logo.png", tags: "pop,türkçe" },
    { name: "Joy Türk", url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_SC", favicon: "https://upload.wikimedia.org/wikipedia/tr/0/09/Joy_FM_logo.png", tags: "slow,aşk" },
    { name: "Joy FM", url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_FM_SC", favicon: "https://upload.wikimedia.org/wikipedia/en/7/70/Joy_Fm_Logo.jpg", tags: "yabancı,slow" },
    { name: "Fenomen Türk", url_resolved: "https://listen.radyofenomen.com/fenomenturk/256/icecast.audio", favicon: "https://radyofenomen.com/assets/images/logo.png", tags: "pop,hit" },
    { name: "Virgin Radio", url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/VIRGIN_RADIO_SC", favicon: "https://upload.wikimedia.org/wikipedia/tr/9/92/Virgin_Radio_T%C3%BCrkiye_logo.png", tags: "pop,yabancı" },
    { name: "Kafa Radyo", url_resolved: "https://kafaradyo.live/kafaradyo/128/icecast.audio", favicon: "https://kafaradyo.com/assets/img/logo.png", tags: "talk,haber" },
    { name: "Number1 FM", url_resolved: "https://n101.rcs.revma.com/3d095282k2zuv", favicon: "https://www.numberone.com.tr/wp-content/uploads/2018/05/number1-logo-1.png", tags: "hit,dance" }
  ],
  US: [
    { name: "KEXP 90.3", url_resolved: "https://kexp-mp3-128.streamguys1.com/kexp128.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/e/e8/KEXP_logo_black.svg", tags: "rock,alternative" },
    { name: "NPR News", url_resolved: "https://npr-ice.streamguys1.com/live.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/d/d7/National_Public_Radio_logo.svg", tags: "news,talk" },
    { name: "WHTZ - Z100", url_resolved: "https://stream.revma.ihrhls.com/zc1469", favicon: "https://upload.wikimedia.org/wikipedia/commons/5/54/Z100_New_York_logo.png", tags: "pop,top40" },
    { name: "KIIS-FM", url_resolved: "https://stream.revma.ihrhls.com/zc185", favicon: "https://upload.wikimedia.org/wikipedia/commons/2/2e/KIIS-FM_logo.svg", tags: "pop,hits" },
    { name: "Hot 97", url_resolved: "https://ais-sa1.streamon.fm/7008_64k.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/b/b8/WQHT_logo.png", tags: "hiphop,rap" },
    { name: "Jazz24", url_resolved: "https://live.streamguys1.com/JAZZ24.mp3", favicon: "https://upload.wikimedia.org/wikipedia/en/3/33/KPLU_Jazz24_logo.jpg", tags: "jazz" }
  ],
  GB: [
    { name: "BBC Radio 1", url_resolved: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one", favicon: "https://upload.wikimedia.org/wikipedia/commons/0/0a/BBC_Radio_1_2021.svg", tags: "pop,news" },
    { name: "Capital FM", url_resolved: "https://media-ice.musicradio.com/CapitalUKMP3", favicon: "https://upload.wikimedia.org/wikipedia/commons/2/28/Capital_FM_logo.svg", tags: "pop,hits" },
    { name: "Heart UK", url_resolved: "https://media-ice.musicradio.com/HeartUKMP3", favicon: "https://upload.wikimedia.org/wikipedia/en/3/30/Heart_Radio_Logo.png", tags: "pop,adult" },
    { name: "LBC News", url_resolved: "https://media-ice.musicradio.com/LBCUKMP3", favicon: "https://upload.wikimedia.org/wikipedia/commons/7/76/LBC_News_logo_2019.png", tags: "news,talk" },
    { name: "Smooth Radio", url_resolved: "https://media-ice.musicradio.com/SmoothUKMP3", favicon: "https://upload.wikimedia.org/wikipedia/en/7/7a/Smooth_Radio_logo.svg", tags: "relax,oldies" }
  ],
  DE: [
    { name: "1LIVE", url_resolved: "https://wdr-1live-live.icecastssl.wdr.de/wdr/1live/live/mp3/128/stream.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/e/ee/1_Live_Logo.svg", tags: "pop,hits" },
    { name: "Antenne Bayern", url_resolved: "https://s2-webradio.antenne.de/antenne", favicon: "https://upload.wikimedia.org/wikipedia/commons/6/62/Antenne_Bayern_logo.svg", tags: "pop,rock" },
    { name: "WDR 2", url_resolved: "https://wdr-wdr2-rheinruhr.icecastssl.wdr.de/wdr/wdr2/rheinruhr/mp3/128/stream.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/0/01/WDR_2_logo.svg", tags: "news,pop" },
    { name: "BigFM", url_resolved: "https://streams.bigfm.de/bigfm-deutschland-128-mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/1/1a/BigFM_Logo.png", tags: "hiphop,dance" }
  ],
  FR: [
    { name: "NRJ France", url_resolved: "https://scdn.nrjaudio.fm/adwz1/fr/30001/mp3_128.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/6/63/NRJ_logo.svg", tags: "hits,pop" },
    { name: "Skyrock", url_resolved: "https://icecast.skyrock.net/s/natio_mp3_128k", favicon: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Logo_Skyrock.svg", tags: "rap,urban" },
    { name: "France Inter", url_resolved: "https://icecast.radiofrance.fr/franceinter-midfi.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/d/d2/France_Inter_Logo_2005.svg", tags: "news,talk" },
    { name: "FIP", url_resolved: "https://icecast.radiofrance.fr/fip-midfi.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Fip_logo_2005.svg", tags: "eclectic,jazz" }
  ],
  IT: [
    { name: "RTL 102.5", url_resolved: "https://shoutcast.rtl.it/rtl1025", favicon: "https://upload.wikimedia.org/wikipedia/commons/1/10/RTL_102.5_logo.svg", tags: "hits,pop" },
    { name: "Radio Italia", url_resolved: "https://ice08.fluidstream.net/RadioItalia.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Radio_Italia_Solo_Musica_Italiana.png", tags: "italian,pop" },
    { name: "Radio Kiss Kiss", url_resolved: "https://ice07.fluidstream.net/KissKiss.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/0/02/Radio_Kiss_Kiss_logo_2020.png", tags: "pop,fun" }
  ],
  ES: [
    { name: "LOS40", url_resolved: "https://25633.live.streamtheworld.com/LOS40_SC", favicon: "https://upload.wikimedia.org/wikipedia/commons/7/72/LOS40_Logo.svg", tags: "hits,pop" },
    { name: "Cadena SER", url_resolved: "https://22643.live.streamtheworld.com/CADENASER.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Cadena_SER_logo_2006.svg", tags: "news,talk" }
  ],
  NL: [
    { name: "Radio 538", url_resolved: "https://22543.live.streamtheworld.com/RADIO538.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/3/37/Radio_538_logo_2014.svg", tags: "dance,hits" },
    { name: "Qmusic", url_resolved: "https://icecast-qmusicnl-cdp.triple-it.nl/Qmusic_nl_live_96.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/2/29/Qmusic_logo_2015.svg", tags: "pop,top40" }
  ],
  AZ: [
    { name: "Media FM", url_resolved: "https://listen.mediafm.az/stream", favicon: "https://mediafm.az/assets/img/logo.png", tags: "hits,pop" }
  ]
};

// --- API SUNUCULARI ---
const API_MIRRORS = [
  "https://at1.api.radio-browser.info",
  "https://de1.api.radio-browser.info", 
  "https://nl1.api.radio-browser.info",
  "https://fr1.api.radio-browser.info",
  "https://us1.api.radio-browser.info"
];

// --- DİL SÖZLÜĞÜ ---
const TRANSLATIONS = {
  TR: {
    code: "tr",
    searchPlaceholder: "Radyo veya şehir ara...",
    categories: "Kategoriler",
    allRadios: "Tüm Radyolar",
    vipSection: "Editörün Seçimi & Popüler",
    aiBtn: "AI Asistan",
    moodTitle: "Ruh Hali",
    moodDesc: "Şu anki modun nedir?",
    moodInput: "Örn: Çalışıyorum, Hüzünlü...",
    factTitle: "Yerel Bilgi",
    factDesc: "hakkında bilgi al.",
    btnLoad: "Yükleniyor...",
    btnGetInfo: "Bilgi Getir",
    btnNewInfo: "Yeni Bilgi",
    clear: "Temizle",
    live: "CANLI",
    paused: "DURAKLATILDI",
    stations: "İstasyon",
    locationDetected: "Konum Algılandı",
    footerRights: "Tüm Hakları Saklıdır.",
    seoTitle: "Canlı Radyo Dinle",
    seoDesc: "Dünyanın en iyi radyolarını kesintisiz dinleyin.",
    errorMsg: "Radyolar yüklenemedi.",
    retry: "Tekrar Dene",
    playingError: "Yayın açılamadı (Bağlantı/Format).",
    networkError: "Ağ hatası oluştu.",
    srcError: "Kaynak desteklenmiyor."
  },
  EN: { // Varsayılan
    code: "en",
    searchPlaceholder: "Search stations...",
    categories: "Genres",
    allRadios: "All Radios",
    vipSection: "Editor's Choice & Popular",
    aiBtn: "AI Assistant",
    moodTitle: "Current Mood",
    moodDesc: "What is your vibe?",
    moodInput: "Ex: Working, Sad...",
    factTitle: "Local Facts",
    factDesc: "Learn about",
    btnLoad: "Loading...",
    btnGetInfo: "Get Info",
    btnNewInfo: "New Fact",
    clear: "Clear",
    live: "LIVE",
    paused: "PAUSED",
    stations: "Stations",
    locationDetected: "Location Detected",
    footerRights: "All Rights Reserved.",
    seoTitle: "Listen Live Radio",
    seoDesc: "Listen to best radio stations worldwide.",
    errorMsg: "Failed to load.",
    retry: "Retry",
    playingError: "Stream failed.",
    networkError: "Network error.",
    srcError: "Source not supported."
  },
  DE: {
    code: "de",
    searchPlaceholder: "Suche...",
    categories: "Genres",
    allRadios: "Alle Radios",
    vipSection: "Empfohlen & Beliebt",
    aiBtn: "KI-Assistent",
    moodTitle: "Stimmung",
    moodDesc: "Wie fühlst du dich?",
    moodInput: "Z.B.: Arbeiten...",
    factTitle: "Fakten",
    factDesc: "Infos über",
    btnLoad: "Laden...",
    btnGetInfo: "Info",
    btnNewInfo: "Neu",
    clear: "Löschen",
    live: "LIVE",
    paused: "PAUSE",
    stations: "Sender",
    locationDetected: "Standort",
    footerRights: "Rechte vorbehalten.",
    seoTitle: "Radio Hören",
    seoDesc: "Beste Radiosender weltweit.",
    errorMsg: "Laden fehlgeschlagen.",
    retry: "Erneut versuchen",
    playingError: "Stream fehler.",
    networkError: "Netzwerkfehler.",
    srcError: "Quelle nicht unterstützt."
  }
};

const COUNTRIES = [
  { code: 'TR', name: 'Türkiye', flag: '🇹🇷' },
  { code: 'DE', name: 'Deutschland', flag: '🇩🇪' },
  { code: 'US', name: 'USA', flag: '🇺🇸' },
  { code: 'GB', name: 'UK', flag: '🇬🇧' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹' },
  { code: 'ES', name: 'España', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'Korea', flag: '🇰🇷' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'AZ', name: 'Azerbaycan', flag: '🇦🇿' },
];

const GENRES = ['all', 'pop', 'rock', 'jazz', 'news', 'classical', 'dance', 'folk', 'rap', 'electronic', 'lofi', 'arabesque', 'slow'];

// --- SEO ---
const updateSEO = (title, description, langCode) => {
  document.title = title;
  document.documentElement.lang = langCode;
  let metaDesc = document.querySelector("meta[name='description']");
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = "description";
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute("content", description);
};

const callGemini = async (prompt) => {
  if (!apiKey) return "API Error.";
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
    );
    if (!response.ok) throw new Error('API Error');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Error.";
  } catch (error) { return "Unavailable."; }
};

// --- BİLEŞENLER ---
const StationLogo = ({ url, alt, className }) => {
  const [error, setError] = useState(false);
  useEffect(() => { setError(false); }, [url]);
  if (!url || error) return <div className={`w-full h-full flex items-center justify-center bg-slate-800 ${className}`}><Radio className="w-1/2 h-1/2 text-slate-600 opacity-50" /></div>;
  return <img src={url} alt={alt} className={`w-full h-full object-contain p-1 bg-slate-800 ${className}`} onError={() => setError(true)} loading="lazy" referrerPolicy="no-referrer" />;
};

// --- GÜNCELLENMİŞ ADSENSE BİLEŞENİ ---
const AdSenseUnit = ({ slotId, style = {}, label }) => {
  useEffect(() => {
    // Script zaten main useEffect'te yükleniyor, burada sadece push yapıyoruz
    if (IS_ADSENSE_LIVE && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense Push Error:", e);
      }
    }
  }, []);

  if (!IS_ADSENSE_LIVE) {
    return (
      <div className="w-full bg-slate-800/30 border border-slate-700/50 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-500 p-2 my-4 select-none" style={{ ...style, minHeight: style.height || '100px' }}>
        <span className="text-[10px] uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded mb-1 text-slate-400">Reklam</span>
        <p className="text-[10px] opacity-60 font-mono">{label}</p>
      </div>
    );
  }

  return (
    <div className="ad-container my-4 bg-slate-900 flex justify-center items-center text-center">
      {/* Google AdSense Otomatik Reklam Kodu */}
      <ins className="adsbygoogle"
           style={{ display: 'block', ...style }}
           data-ad-client={GOOGLE_AD_CLIENT_ID}
           data-ad-slot={slotId} // Eğer slot ID yoksa (Auto Ads kullanıyorsanız) bu kısmı boş bırakabilirsiniz ama genelde gereklidir.
           data-full-width-responsive="true"></ins>
    </div>
  );
};

// --- ANA UYGULAMA ---
export default function App() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('TR');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [autoLocated, setAutoLocated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // DİL AYARI
  const [appLang, setAppLang] = useState(() => {
    const browserLang = navigator.language.split('-')[0].toUpperCase();
    return TRANSLATIONS[browserLang] ? browserLang : 'EN';
  });
  const t = TRANSLATIONS[appLang] || TRANSLATIONS['EN'];

  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiMoodInput, setAiMoodInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFact, setAiFact] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  
  const [currentStation, setCurrentStation] = useState(null);
  const currentStationRef = useRef(null); 

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('rs_volume')) || 0.8);
  const [error, setError] = useState(null);
  const audioRef = useRef(new Audio());

  // --- API ÇEKME ---
  const fetchWithFailover = async (countryCode) => {
    setLoading(true); setError(null);
    let data = [];
    
    for (const server of API_MIRRORS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(`${server}/json/stations/bycountrycodeexact/${countryCode}?limit=120&order=votes&reverse=true`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) { data = await res.json(); break; }
      } catch (e) {}
    }

    let cleanData = data.filter(s => 
      s.url_resolved && 
      s.name.trim().length > 0 && 
      !s.name.toLowerCase().includes("test") &&
      !s.url_resolved.includes(".m3u8") // HLS Filtresi
    );

    const vipList = VIP_STATIONS[countryCode] || [];
    cleanData = cleanData.filter(s => !vipList.some(v => v.name.toLowerCase() === s.name.toLowerCase()));
    
    const finalData = [
        ...vipList.map(v => ({ ...v, stationuuid: `vip-${v.name}`, is_vip: true })),
        ...cleanData
    ];

    if (finalData.length > 0) {
      setStations(finalData);
    } else { 
      setError(t.errorMsg); 
    }
    setLoading(false);
  };

  // --- INIT ---
  useEffect(() => {
    const initApp = async () => {
      // 1. ADSENSE SCRIPT ENJEKSİYONU
      if (IS_ADSENSE_LIVE && !document.getElementById('adsense-script')) {
        const script = document.createElement('script');
        script.id = 'adsense-script';
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_AD_CLIENT_ID}`;
        script.crossOrigin = "anonymous";
        document.head.appendChild(script);
      }

      const browserLang = navigator.language.split('-')[0].toUpperCase();
      if (TRANSLATIONS[browserLang]) {
        setAppLang(browserLang);
      }

      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data?.country_code) {
          const code = data.country_code;
          if (COUNTRIES.find(c => c.code === code)) {
            setSelectedCountry(code);
            setAutoLocated(true);
          }
          if (TRANSLATIONS[code]) {
            setAppLang(code);
          }
        }
      } catch (e) { console.log("IP Location failed."); }
    };
    initApp();

    const audio = audioRef.current;
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => { setIsBuffering(false); setIsPlaying(true); setError(null); };
    const onPause = () => setIsPlaying(false);
    
    const onError = (e) => { 
      setIsBuffering(false); 
      setIsPlaying(false);
      
      const err = audio.error;
      const code = err ? err.code : 0;
      console.error(`Audio Error: Code ${code}`);

      const activeStation = currentStationRef.current;
      if (activeStation) {
          const currentSrc = audio.src;
          if (!activeStation.is_vip && currentSrc.startsWith("https://") && activeStation.url_resolved.startsWith("http://")) {
              console.warn("HTTPS fail, fallback to HTTP");
              audio.src = activeStation.url_resolved;
              audio.play().catch(() => setError(t.playingError));
              return;
          }
      }

      let msg = t.playingError;
      if (code === 2) msg = t.networkError;
      if (code === 3) msg = "Decode Error";
      if (code === 4) msg = t.srcError; 

      setError(`${msg} (${code})`); 
    };

    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      audio.pause();
    };
  }, [t]); 

  useEffect(() => {
    fetchWithFailover(selectedCountry);
    setAiFact(null);
  }, [selectedCountry]);

  // --- AUDIO OYNATMA ---
  useEffect(() => {
    currentStationRef.current = currentStation;

    if (currentStation) {
      setError(null); setIsBuffering(true);
      
      let streamUrl = currentStation.url_resolved;
      if (!currentStation.is_vip && streamUrl.startsWith('http://')) {
         streamUrl = streamUrl.replace('http://', 'https://');
      }

      audioRef.current.src = streamUrl;
      audioRef.current.load();
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) { 
        playPromise.catch(err => { 
           if(err.name !== 'AbortError') { 
             console.warn("Auto-play blocked");
             setIsBuffering(false);
             setIsPlaying(false);
           }
        }); 
      }
      updateSEO(`${currentStation.name} - Radiocu`, `${t.live}: ${currentStation.name}. ${t.seoDesc}`, appLang.toLowerCase());
    } else {
      const cName = COUNTRIES.find(c => c.code === selectedCountry)?.name || selectedCountry;
      updateSEO(`Radiocu - ${t.seoTitle}`, `${cName} - ${t.seoDesc}`, appLang.toLowerCase());
    }
  }, [currentStation]);

  useEffect(() => { 
    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);
  
  useEffect(() => { audioRef.current.volume = volume; localStorage.setItem('rs_volume', volume); }, [volume]);

  // --- HANDLERS ---
  const handleMoodSubmit = async (e) => {
    e.preventDefault(); if (!aiMoodInput.trim()) return;
    setAiLoading(true); setAiSuggestion(null);
    const langName = appLang === 'TR' ? 'Türkçe' : (appLang === 'DE' ? 'Deutsch' : 'English');
    const result = await callGemini(`User mood: "${aiMoodInput}". Suggest 3 radio genres (comma separated, English keys). Reply in ${langName}.`);
    if (result) { setSearchQuery(result.replace(/\n/g, '').trim()); setAiSuggestion(`"${aiMoodInput}": ${result}`); }
    setAiLoading(false);
  };

  const handleGetCountryFact = async () => {
    if (aiFact) return; setAiLoading(true);
    const countryName = COUNTRIES.find(c => c.code === selectedCountry)?.name;
    const langName = appLang === 'TR' ? 'Türkçe' : (appLang === 'DE' ? 'Deutsch' : 'English');
    const result = await callGemini(`Tell me a short interesting music fact about ${countryName} in ${langName}.`);
    setAiFact(result); setAiLoading(false);
  };

  const filteredStations = stations.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(q) || s.tags.toLowerCase().includes(q);
    const matchesGenre = selectedGenre === 'all' || s.tags.toLowerCase().includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  const theme = { bgMain: 'bg-slate-950', bgPanel: 'bg-slate-900/95', bgCard: 'bg-slate-800/40', textAccent: 'text-indigo-400', border: 'border-white/5', grad: 'from-indigo-600 to-purple-600' };

  return (
    <div className={`flex flex-col h-screen ${theme.bgMain} text-white font-sans overflow-hidden selection:bg-indigo-500/30`}>
      
      {/* NAVBAR */}
      <header className={`h-16 ${theme.bgPanel} backdrop-blur-md border-b ${theme.border} flex items-center justify-between px-4 z-30 shrink-0`}>
        <div className="flex items-center gap-3 select-none cursor-pointer" onClick={() => {setCurrentStation(null); setSearchQuery('');}}>
          <div className="w-10 h-10 shrink-0 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 bg-white/5 border border-white/10">
             <img src="/logo.png" alt="Radiocu" className="w-full h-full object-cover transform hover:scale-110 transition duration-500" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
             <div className="hidden w-full h-full items-center justify-center bg-indigo-600"><Radio className="text-white w-6 h-6" /></div>
          </div>
          <div className="flex flex-col justify-center h-10">
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">Radiocu</h1>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase leading-none mt-1">Global Player</span>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className={`flex items-center w-full ${theme.bgCard} rounded-lg px-4 py-2 border ${theme.border} focus-within:border-indigo-500/50 transition-colors`}>
                <Search className="text-slate-500 w-4 h-4 mr-2" />
                <input type="text" placeholder={t.searchPlaceholder} className="bg-transparent w-full border-none outline-none text-sm text-white placeholder-slate-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
        </div>

        <div className="flex items-center gap-2">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-400 hover:text-white"><Menu/></button>
            <button onClick={() => setShowAiPanel(!showAiPanel)} className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition ${showAiPanel ? 'bg-indigo-900 border-indigo-500 text-indigo-400' : 'border-slate-700 text-slate-400 hover:text-white'}`}>
                <Sparkles className="w-4 h-4" /> {t.aiBtn}
            </button>
            <div className={`hidden md:flex items-center gap-2 ${theme.bgCard} px-3 py-1.5 rounded-lg border ${theme.border}`}>
                <MapPin className={`w-4 h-4 ${autoLocated ? theme.textAccent : 'text-slate-500'}`} />
                <select value={selectedCountry} onChange={(e) => { setSelectedCountry(e.target.value); setAutoLocated(false); }} className="bg-transparent outline-none text-sm font-medium cursor-pointer text-slate-300 max-w-[100px]">
                {COUNTRIES.map(c => <option key={c.code} value={c.code} className="bg-slate-900">{c.flag} {c.name}</option>)}
                </select>
            </div>
            <div className="hidden md:flex items-center justify-center w-8 h-8 bg-slate-800 rounded text-xs font-bold text-slate-400 border border-slate-700 uppercase" title="Language">
                {appLang}
            </div>
        </div>
      </header>

      {/* MOBİL MENÜ */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-slate-900 border-b border-slate-800 z-20 p-4 md:hidden animate-in slide-in-from-top-2">
            <div className="mb-4">
                 <select value={selectedCountry} onChange={(e) => { setSelectedCountry(e.target.value); setMobileMenuOpen(false); }} className="w-full bg-slate-800 p-3 rounded-lg text-white border border-slate-700">
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                 </select>
            </div>
            <button onClick={() => { setShowAiPanel(true); setMobileMenuOpen(false); }} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-bold flex items-center justify-center gap-2"><Sparkles className="w-4 h-4"/> {t.aiBtn}</button>
        </div>
      )}

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden relative">
        <aside className={`w-64 ${theme.bgPanel} border-r ${theme.border} hidden md:flex flex-col backdrop-blur-xl`}>
          <div className="p-6 overflow-y-auto flex-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2"><Waves className="w-3 h-3"/> {t.categories}</h3>
            <div className="space-y-1">
              {GENRES.map(g => (
                <button key={g} onClick={() => { setSelectedGenre(g); setSearchQuery(''); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-3 ${selectedGenre === g ? `bg-indigo-500/10 ${theme.textAccent} border border-indigo-500/20` : `text-slate-400 hover:text-white hover:bg-white/5`}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedGenre === g ? 'bg-indigo-400' : 'bg-slate-700'}`}></span>
                  <span className="capitalize">{g === 'all' ? t.allRadios : g}</span>
                </button>
              ))}
            </div>
            <div className="mt-8"><AdSenseUnit slotId="sidebar-ad" label="Sidebar" style={{ height: '250px' }} /></div>
          </div>
          <div className="p-6 border-t border-slate-800 text-center flex flex-col gap-1"><p className="text-xs text-slate-600 font-mono">© 2024 Radiocu</p></div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-40">
           <div className="max-w-6xl mx-auto">
              <AdSenseUnit slotId="header-ad" label="Header Leaderboard" style={{ height: '90px' }} />
              <div className="mb-6 mt-6 border-b border-white/5 pb-4">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                            <span className="text-3xl">{COUNTRIES.find(c => c.code === selectedCountry)?.flag}</span>
                            {COUNTRIES.find(c => c.code === selectedCountry)?.name}
                        </h1>
                        <p className="text-sm text-slate-400 mt-2 flex items-center gap-2">
                            {autoLocated && <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded text-xs border border-indigo-500/20 flex items-center gap-1"><Zap className="w-3 h-3"/> {t.locationDetected}</span>}
                            <span className="bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700">{filteredStations.length} {t.stations}</span>
                        </p>
                    </div>
                    <button onClick={() => fetchWithFailover(selectedCountry)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition self-end md:self-auto"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
                 </div>
              </div>

              <div className="md:hidden mb-6">
                <div className={`flex items-center w-full ${theme.bgCard} rounded-lg px-4 py-3 border ${theme.border}`}><Search className="text-slate-500 w-4 h-4 mr-2" /><input type="text" placeholder={t.searchPlaceholder} className="bg-transparent w-full border-none outline-none text-sm text-white placeholder-slate-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
              </div>

              {aiSuggestion && <div className="mb-6 p-4 rounded-xl bg-indigo-900/20 border border-indigo-500/30 flex justify-between items-center animate-in fade-in"><div className="flex items-center gap-3"><Bot className="w-5 h-5 text-indigo-400" /><span className="text-indigo-200 text-sm">{aiSuggestion}</span></div><button onClick={() => { setSearchQuery(''); setAiSuggestion(null); }} className="text-xs text-indigo-400 hover:text-white underline">{t.clear}</button></div>}

              {error && (
                  <div className="mb-6 p-6 bg-red-500/10 border border-red-500/20 rounded-xl flex flex-col items-center justify-center text-center gap-3 animate-in fade-in">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                      <p className="text-red-200 text-sm">{error}</p>
                      <button onClick={() => fetchWithFailover(selectedCountry)} className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg text-sm transition flex items-center gap-2"><RefreshCw className="w-4 h-4"/> {t.retry}</button>
                  </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                 {loading ? [...Array(8)].map((_, i) => <div key={i} className={`h-24 ${theme.bgCard} rounded-xl animate-pulse border ${theme.border}`}></div>) : 
                  filteredStations.map((s, idx) => (
                    <React.Fragment key={s.stationuuid}>
                        {idx > 0 && idx % 12 === 0 && <div className="col-span-full"><AdSenseUnit slotId="feed-ad" label="Feed Ads" style={{ height: '90px' }} /></div>}
                        <div onClick={() => setCurrentStation(s)} className={`group relative ${theme.bgCard} hover:bg-slate-800 rounded-xl p-3 transition-all cursor-pointer border ${currentStation?.stationuuid === s.stationuuid ? 'border-indigo-500 bg-indigo-500/10' : theme.border} hover:shadow-lg hover:-translate-y-0.5`}>
                            {/* VIP etiketi kaldırıldı, doğal liste görünümü */}
                            <div className="flex items-center gap-3">
                                <div className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 relative bg-slate-900 border ${theme.border}`}>
                                    <StationLogo url={s.favicon} alt={s.name} />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Play className="w-6 h-6 text-white fill-current"/></div>
                                    {currentStation?.stationuuid === s.stationuuid && isPlaying && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Activity className="w-6 h-6 text-indigo-400 animate-pulse" /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-bold truncate text-sm ${currentStation?.stationuuid === s.stationuuid ? 'text-indigo-400' : 'text-slate-200'}`}>{s.name}</h3>
                                    <p className="text-xs text-slate-500 truncate mt-0.5">{s.tags ? s.tags.split(',').slice(0, 2).join(', ') : 'Radyo'}</p>
                                    <div className="flex items-center mt-1.5 gap-2"><span className="text-[10px] bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">{s.bitrate || 128}k</span></div>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                  ))
                 }
              </div>
              <div className="mt-12 mb-8"><AdSenseUnit slotId="footer-ad" label="Footer" style={{ height: '120px' }} /></div>
           </div>
        </main>

        <div className={`fixed inset-y-0 right-0 w-full sm:w-96 ${theme.bgPanel} backdrop-blur-xl border-l ${theme.border} shadow-2xl transform transition-transform duration-300 z-50 ${showAiPanel ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full p-6">
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4"><h2 className="text-lg font-bold text-indigo-400 flex items-center gap-2"><Sparkles className="w-4 h-4"/> {t.aiBtn}</h2><button onClick={() => setShowAiPanel(false)}><X className="w-5 h-5 text-slate-500 hover:text-white"/></button></div>
                <div className="space-y-6 flex-1 overflow-y-auto">
                    <div className="p-5 rounded-xl border border-indigo-500/20 bg-indigo-500/5"><p className="text-xs text-slate-400 mb-2 font-bold uppercase">{t.moodTitle}</p><form onSubmit={handleMoodSubmit} className="relative"><input type="text" value={aiMoodInput} onChange={(e) => setAiMoodInput(e.target.value)} placeholder={t.moodInput} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none" /><button type="submit" disabled={aiLoading} className="absolute right-2 top-2 p-1.5 bg-indigo-600 rounded text-white">{aiLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Zap className="w-4 h-4"/>}</button></form></div>
                    <div className="p-5 rounded-xl border border-slate-700 bg-slate-800/20"><p className="text-xs text-slate-400 mb-2 font-bold uppercase">{t.factTitle}</p><p className="text-xs text-slate-500 mb-4">{t.factDesc} {COUNTRIES.find(c => c.code === selectedCountry)?.name}</p>{!aiFact ? ( <button onClick={handleGetCountryFact} disabled={aiLoading} className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-bold text-slate-300 transition">{aiLoading ? t.btnLoad : t.btnGetInfo}</button> ) : ( <div className="animate-in fade-in"><p className="text-sm text-slate-300 italic mb-3">"{aiFact}"</p><button onClick={() => setAiFact(null)} className="text-xs text-indigo-400 underline">{t.btnNewInfo}</button></div> )}</div>
                </div>
            </div>
        </div>
      </div>

      <div className={`h-24 ${theme.bgPanel} border-t ${theme.border} fixed bottom-0 w-full flex items-center px-4 md:px-8 z-40 shadow-[0_-5px_30px_rgba(0,0,0,0.5)]`}>
         <div className="w-1/3 flex items-center gap-4">
            {currentStation ? (
                <>
                    <div className={`w-14 h-14 rounded-xl border ${theme.border} bg-slate-900 hidden sm:block relative overflow-hidden`}>
                         <StationLogo url={currentStation.favicon} alt={currentStation.name} />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm line-clamp-1">{currentStation.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            {isBuffering ? <span className="text-xs text-yellow-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> {t.btnLoad}</span> : <span className={`text-[10px] font-mono uppercase tracking-wide flex items-center gap-1 ${isPlaying ? 'text-green-400' : 'text-slate-500'}`}><span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></span>{isPlaying ? t.live : t.paused}</span>}
                        </div>
                    </div>
                </>
            ) : <div className="text-slate-500 text-xs flex items-center gap-2"><Radio className="w-4 h-4"/> {appLang === 'TR' ? 'İstasyon seçin...' : 'Select station...'}</div>}
         </div>
         <div className="w-1/3 flex justify-center gap-4 sm:gap-6 items-center">
             <button className="text-slate-500 hover:text-white transition"><SkipBack className="w-5 h-5"/></button>
             <button 
               onClick={() => {
                 if (currentStation) {
                   if (isPlaying) {
                     audioRef.current.pause();
                   } else {
                     if (audioRef.current.error || error) {
                        console.log("Hata sonrası yeniden yükleniyor...");
                        audioRef.current.load();
                     }
                     audioRef.current.play().catch(e => {
                        console.error("Manual play error:", e);
                        if(e.name !== 'AbortError') setError(t.playingError);
                     });
                   }
                 }
               }}
               disabled={!currentStation || isBuffering} 
               className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${!currentStation ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 text-white hover:scale-105 hover:bg-indigo-500'}`}
             >
                {isBuffering ? <Loader2 className="w-6 h-6 animate-spin"/> : (isPlaying ? <Pause className="w-5 h-5 fill-current"/> : <Play className="w-5 h-5 fill-current ml-1"/>)}
             </button>
             <button className="text-slate-500 hover:text-white transition"><SkipForward className="w-5 h-5"/></button>
         </div>
         <div className="w-1/3 flex justify-end items-center gap-3"><button onClick={() => setVolume(v => v === 0 ? 0.8 : 0)} className="text-slate-400 hover:text-white transition hidden sm:block">{volume === 0 ? <VolumeX className="w-5 h-5"/> : <Volume2 className="w-5 h-5"/>}</button><input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-20 sm:w-28 h-1 bg-slate-700 rounded-full cursor-pointer accent-indigo-500" /></div>
      </div>
    </div>
  );
}