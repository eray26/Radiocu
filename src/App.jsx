import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Search, Globe, Radio, MapPin, Music, Wifi, AlertCircle, Sparkles, X, Bot, MessageSquare, Loader2, Activity, Zap, Waves, ExternalLink, Info, Share2, Menu, RefreshCw } from 'lucide-react';

// --- AYARLAR ---
const GOOGLE_AD_CLIENT_ID = "ca-pub-XXXXXXXXXXXXXXXX"; 
const IS_ADSENSE_LIVE = false; 
const apiKey = ""; 

// --- API SUNUCULARI ---
const API_MIRRORS = [
  "https://de1.api.radio-browser.info", 
  "https://nl1.api.radio-browser.info",
  "https://at1.api.radio-browser.info",
  "https://fr1.api.radio-browser.info",
  "https://us1.api.radio-browser.info"
];
const IP_API_URL = "https://ipapi.co/json/";

// --- ÇOKLU DİL SÖZLÜĞÜ (LOCALIZATION) ---
const TRANSLATIONS = {
  TR: {
    searchPlaceholder: "Radyo veya şehir ara...",
    categories: "Müzik Türleri",
    allRadios: "Tümü",
    aiBtn: "AI Asistan",
    moodTitle: "Ruh Hali",
    moodDesc: "Şu an ne yapıyorsun?",
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
    seoDesc: "Dünyanın en iyi radyolarını kesintisiz dinleyin."
  },
  EN: { // Varsayılan (Global)
    searchPlaceholder: "Search stations or cities...",
    categories: "Genres",
    allRadios: "All",
    aiBtn: "AI Assistant",
    moodTitle: "Current Mood",
    moodDesc: "What are you doing?",
    moodInput: "Ex: Working, Sad, Party...",
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
    seoDesc: "Listen to the best radio stations worldwide uninterrupted."
  },
  DE: { // Almanca
    searchPlaceholder: "Suche Sender oder Städte...",
    categories: "Genres",
    allRadios: "Alle",
    aiBtn: "KI-Assistent",
    moodTitle: "Stimmung",
    moodDesc: "Was machst du gerade?",
    moodInput: "Z.B.: Arbeiten, Traurig...",
    factTitle: "Lokale Fakten",
    factDesc: "Lerne über",
    btnLoad: "Laden...",
    btnGetInfo: "Info Abrufen",
    btnNewInfo: "Neue Info",
    clear: "Löschen",
    live: "LIVE",
    paused: "PAUSIERT",
    stations: "Sender",
    locationDetected: "Standort Erkannt",
    footerRights: "Alle Rechte vorbehalten.",
    seoTitle: "Live Radio Hören",
    seoDesc: "Hören Sie die besten Radiosender weltweit ohne Unterbrechung."
  },
  FR: { // Fransızca
    searchPlaceholder: "Rechercher radios ou villes...",
    categories: "Genres",
    allRadios: "Tous",
    aiBtn: "Assistant IA",
    moodTitle: "Humeur",
    moodDesc: "Que faites-vous ?",
    moodInput: "Ex: Travail, Triste...",
    factTitle: "Infos Locales",
    factDesc: "En savoir plus sur",
    btnLoad: "Chargement...",
    btnGetInfo: "Obtenir Info",
    btnNewInfo: "Nouvelle Info",
    clear: "Effacer",
    live: "EN DIRECT",
    paused: "PAUSE",
    stations: "Stations",
    locationDetected: "Localisation Détectée",
    footerRights: "Tous droits réservés.",
    seoTitle: "Écouter la Radio",
    seoDesc: "Écoutez les meilleures stations de radio du monde entier."
  },
  ES: { // İspanyolca
    searchPlaceholder: "Buscar emisoras o ciudades...",
    categories: "Géneros",
    allRadios: "Todos",
    aiBtn: "Asistente IA",
    moodTitle: "Estado de Ánimo",
    moodDesc: "¿Qué estás haciendo?",
    moodInput: "Ej: Trabajando, Triste...",
    factTitle: "Datos Locales",
    factDesc: "Aprende sobre",
    btnLoad: "Cargando...",
    btnGetInfo: "Obtener Info",
    btnNewInfo: "Nuevo Dato",
    clear: "Borrar",
    live: "EN VIVO",
    paused: "PAUSADO",
    stations: "Emisoras",
    locationDetected: "Ubicación Detectada",
    footerRights: "Todos los derechos reservados.",
    seoTitle: "Escuchar Radio en Vivo",
    seoDesc: "Escucha las mejores emisoras de radio del mundo sin interrupciones."
  }
};

const COUNTRIES = [
  { code: 'TR', name: 'Türkiye', flag: '🇹🇷' },
  { code: 'US', name: 'USA', flag: '🇺🇸' },
  { code: 'GB', name: 'UK', flag: '🇬🇧' },
  { code: 'DE', name: 'Deutschland', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹' },
  { code: 'ES', name: 'España', flag: '🇪🇸' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'Korea', flag: '🇰🇷' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'AZ', name: 'Azerbaijan', flag: '🇦🇿' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
];

const GENRES = ['all', 'pop', 'rock', 'jazz', 'news', 'classical', 'dance', 'folk', 'rap', 'electronic', 'lofi', 'arabesque', 'slow'];

// --- SEO YÖNETİCİSİ (Dil Destekli) ---
const updateSEO = (title, description, langCode) => {
  document.title = title;
  document.documentElement.lang = langCode.toLowerCase(); // <html lang="de"> yapar
  
  let metaDesc = document.querySelector("meta[name='description']");
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = "description";
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute("content", description);

  // JSON-LD Yapısal Veri (Google'a "Bu bir Radyo Uygulamasıdır" der)
  let script = document.querySelector("#schema-struct");
  if(!script) {
      script = document.createElement('script');
      script.id = "schema-struct";
      script.type = "application/ld+json";
      document.head.appendChild(script);
  }
  script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "RadioStation",
      "name": "Radiocu",
      "url": "https://radiocu.com",
      "description": description,
      "address": { "@type": "PostalAddress", "addressCountry": langCode }
  });
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
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Connection error.";
  } catch (error) { return "Service unavailable."; }
};

// --- BİLEŞENLER ---
const StationLogo = ({ url, alt, className }) => {
  const [error, setError] = useState(false);
  useEffect(() => { setError(false); }, [url]);
  if (!url || error) return <div className={`w-full h-full flex items-center justify-center bg-slate-800 ${className}`}><Radio className="w-1/2 h-1/2 text-slate-600 opacity-50" /></div>;
  return <img src={url} alt={alt} className={`w-full h-full object-contain p-1 bg-slate-800 ${className}`} onError={() => setError(true)} loading="lazy" referrerPolicy="no-referrer" />;
};

const AdSenseUnit = ({ slotId, style = {}, label }) => {
  useEffect(() => { if (IS_ADSENSE_LIVE && window.adsbygoogle) try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {} }, []);
  if (!IS_ADSENSE_LIVE) return <div className="w-full bg-slate-800/30 border border-slate-700/50 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-500 p-2 my-4 select-none" style={{ ...style, minHeight: style.height || '100px' }}><span className="text-[10px] uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded mb-1 text-slate-400">Reklam</span><p className="text-[10px] opacity-60 font-mono">{label}</p></div>;
  return <div className="ad-container my-4 bg-slate-900 flex justify-center items-center"><ins className="adsbygoogle" style={{ display: 'block', ...style }} data-ad-client={GOOGLE_AD_CLIENT_ID} data-ad-slot={slotId} data-full-width-responsive="true"></ins></div>;
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
  const [activeServer, setActiveServer] = useState(null);
  
  // DİL AYARI (Varsayılan İngilizce, sonra algılayacak)
  const [appLang, setAppLang] = useState('EN'); 
  const t = TRANSLATIONS[appLang] || TRANSLATIONS['EN']; // Seçili dilin metinlerini al

  // AI & Player State
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiMoodInput, setAiMoodInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFact, setAiFact] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('rs_volume')) || 0.8);
  const [error, setError] = useState(null);
  const audioRef = useRef(new Audio());

  const fetchWithFailover = async (countryCode) => {
    setLoading(true); setError(null);
    let data = null; let successServer = null;
    for (const server of API_MIRRORS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(`${server}/json/stations/bycountrycodeexact/${countryCode}?limit=100&order=votes&reverse=true`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) { data = await res.json(); successServer = server; break; }
      } catch (e) {}
    }
    if (data && data.length > 0) {
      const cleanData = data.filter(s => s.url_resolved && s.url_resolved.startsWith('http') && s.name.trim().length > 0 && !s.name.toLowerCase().includes("test"));
      setStations(cleanData); setActiveServer(successServer);
    } else { setError(appLang === 'TR' ? "Radyolar yüklenemedi." : "Failed to load radios."); }
    setLoading(false);
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        const res = await fetch(IP_API_URL);
        const data = await res.json();
        if (data?.country_code) {
          const code = data.country_code;
          
          // 1. Konumu Ayarla (Listedeyse)
          if (COUNTRIES.find(c => c.code === code)) {
            setSelectedCountry(code);
            setAutoLocated(true);
          }

          // 2. Dili Ayarla (Çeviri varsa o dili seç, yoksa İngilizce)
          if (TRANSLATIONS[code]) {
            setAppLang(code);
          } else {
            setAppLang('EN'); // Desteklenmeyen ülke için İngilizce
          }
        }
      } catch (e) { setAppLang('EN'); }
    };
    initApp();

    const audio = audioRef.current;
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => { setIsBuffering(false); setIsPlaying(true); setError(null); };
    const onPause = () => setIsPlaying(false);
    const onError = (e) => { setIsBuffering(false); setIsPlaying(false); setError(appLang === 'TR' ? "Yayın hatası." : "Stream error."); };

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
  }, []); // Dil değişimi için appLang dependency'ye eklenmedi çünkü init'te yapıyoruz

  useEffect(() => {
    fetchWithFailover(selectedCountry);
    setAiFact(null);
  }, [selectedCountry]);

  // SEO & Title Update
  useEffect(() => {
    const countryName = COUNTRIES.find(c => c.code === selectedCountry)?.name || selectedCountry;
    if (currentStation) {
      updateSEO(`${currentStation.name} - Radiocu`, `${t.live}: ${currentStation.name}. ${t.seoDesc}`, appLang);
    } else {
      updateSEO(`Radiocu - ${t.seoTitle} (${countryName})`, `${countryName} - ${t.seoDesc}`, appLang);
    }
  }, [currentStation, selectedCountry, appLang]);

  useEffect(() => { isPlaying ? audioRef.current.play().catch(() => {}) : audioRef.current.pause(); }, [isPlaying]);
  useEffect(() => { audioRef.current.volume = volume; localStorage.setItem('rs_volume', volume); }, [volume]);

  const handleMoodSubmit = async (e) => {
    e.preventDefault();
    if (!aiMoodInput.trim()) return;
    setAiLoading(true); setAiSuggestion(null);
    const promptLang = appLang === 'TR' ? 'Türkçe' : 'English';
    const result = await callGemini(`User mood: "${aiMoodInput}". Suggest 3 radio genres (comma separated, in English). Reply in ${promptLang}.`);
    if (result) { setSearchQuery(result.replace(/\n/g, '').trim()); setAiSuggestion(`"${aiMoodInput}": ${result}`); }
    setAiLoading(false);
  };

  const handleGetCountryFact = async () => {
    if (aiFact) return;
    setAiLoading(true);
    const countryName = COUNTRIES.find(c => c.code === selectedCountry)?.name;
    const promptLang = appLang === 'TR' ? 'Türkçe' : (appLang === 'DE' ? 'Deutsch' : 'English');
    const result = await callGemini(`Tell me a very short interesting fact about music culture in ${countryName}. Write in ${promptLang}.`);
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
            {/* Dil Göstergesi */}
            <div className="hidden md:flex items-center justify-center w-8 h-8 bg-slate-800 rounded text-xs font-bold text-slate-400 border border-slate-700">
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

      {/* MAIN LAYOUT */}
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
            <div className="mt-8"><AdSenseUnit slotId="sidebar-ad" label="Sidebar Reklam" style={{ height: '250px' }} /></div>
          </div>
          <div className="p-6 border-t border-slate-800 text-center flex flex-col gap-1">
             <p className="text-xs text-slate-600 font-mono">© 2024 Radiocu</p>
             <p className="text-[9px] text-slate-700">{t.footerRights}</p>
          </div>
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
                <div className={`flex items-center w-full ${theme.bgCard} rounded-lg px-4 py-3 border ${theme.border}`}>
                    <Search className="text-slate-500 w-4 h-4 mr-2" />
                    <input type="text" placeholder={t.searchPlaceholder} className="bg-transparent w-full border-none outline-none text-sm text-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>

              {aiSuggestion && (
                 <div className="mb-6 p-4 rounded-xl bg-indigo-900/20 border border-indigo-500/30 flex justify-between items-center animate-in fade-in">
                    <div className="flex items-center gap-3"><Bot className="w-5 h-5 text-indigo-400" /><span className="text-indigo-200 text-sm">{aiSuggestion}</span></div>
                    <button onClick={() => { setSearchQuery(''); setAiSuggestion(null); }} className="text-xs text-indigo-400 hover:text-white underline">{t.clear}</button>
                 </div>
              )}

              {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-300 text-sm"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                 {loading ? [...Array(8)].map((_, i) => <div key={i} className={`h-24 ${theme.bgCard} rounded-xl animate-pulse border ${theme.border}`}></div>) : 
                  filteredStations.map((s, idx) => (
                    <React.Fragment key={s.stationuuid}>
                        {idx > 0 && idx % 12 === 0 && <div className="col-span-full"><AdSenseUnit slotId="feed-ad" label="Feed Ads" style={{ height: '90px' }} /></div>}
                        <div onClick={() => setCurrentStation(s)} className={`group relative ${theme.bgCard} hover:bg-slate-800 rounded-xl p-3 transition-all cursor-pointer border ${currentStation?.stationuuid === s.stationuuid ? 'border-indigo-500 bg-indigo-500/10' : theme.border} hover:shadow-lg hover:-translate-y-0.5`}>
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
              <div className="mt-12 mb-8"><AdSenseUnit slotId="footer-ad" label="Footer Reklam" style={{ height: '120px' }} /></div>
           </div>
        </main>

        <div className={`fixed inset-y-0 right-0 w-full sm:w-96 ${theme.bgPanel} backdrop-blur-xl border-l ${theme.border} shadow-2xl transform transition-transform duration-300 z-50 ${showAiPanel ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full p-6">
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                    <h2 className="text-lg font-bold text-indigo-400 flex items-center gap-2"><Sparkles className="w-4 h-4"/> {t.aiBtn}</h2>
                    <button onClick={() => setShowAiPanel(false)}><X className="w-5 h-5 text-slate-500 hover:text-white"/></button>
                </div>
                <div className="space-y-6 flex-1 overflow-y-auto">
                    <div className="p-5 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                        <p className="text-xs text-slate-400 mb-2 font-bold uppercase">{t.moodTitle}</p>
                        <p className="text-[10px] text-slate-500 mb-2">{t.moodDesc}</p>
                        <form onSubmit={handleMoodSubmit} className="relative">
                            <input type="text" value={aiMoodInput} onChange={(e) => setAiMoodInput(e.target.value)} placeholder={t.moodInput} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none" />
                            <button type="submit" disabled={aiLoading} className="absolute right-2 top-2 p-1.5 bg-indigo-600 rounded text-white">{aiLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Zap className="w-4 h-4"/>}</button>
                        </form>
                    </div>
                    <div className="p-5 rounded-xl border border-slate-700 bg-slate-800/20">
                        <p className="text-xs text-slate-400 mb-2 font-bold uppercase">{t.factTitle}</p>
                        <p className="text-xs text-slate-500 mb-4">{t.factDesc} {COUNTRIES.find(c => c.code === selectedCountry)?.name}</p>
                        {!aiFact ? ( <button onClick={handleGetCountryFact} disabled={aiLoading} className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-bold text-slate-300 transition">{aiLoading ? t.btnLoad : t.btnGetInfo}</button> ) : ( <div className="animate-in fade-in"><p className="text-sm text-slate-300 italic mb-3">"{aiFact}"</p><button onClick={() => setAiFact(null)} className="text-xs text-indigo-400 underline">{t.btnNewInfo}</button></div> )}
                    </div>
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
             <button onClick={() => currentStation && (isPlaying ? audioRef.current.pause() : audioRef.current.play())} disabled={!currentStation || isBuffering} className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${!currentStation ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 text-white hover:scale-105 hover:bg-indigo-500'}`}>{isBuffering ? <Loader2 className="w-6 h-6 animate-spin"/> : (isPlaying ? <Pause className="w-5 h-5 fill-current"/> : <Play className="w-5 h-5 fill-current ml-1"/>)}</button>
             <button className="text-slate-500 hover:text-white transition"><SkipForward className="w-5 h-5"/></button>
         </div>
         <div className="w-1/3 flex justify-end items-center gap-3">
             <button onClick={() => setVolume(v => v === 0 ? 0.8 : 0)} className="text-slate-400 hover:text-white transition hidden sm:block">{volume === 0 ? <VolumeX className="w-5 h-5"/> : <Volume2 className="w-5 h-5"/>}</button>
             <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-20 sm:w-28 h-1 bg-slate-700 rounded-full cursor-pointer accent-indigo-500" />
         </div>
      </div>
    </div>
  );
}