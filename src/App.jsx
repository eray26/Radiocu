import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Search, Globe, Radio, MapPin, Music, Wifi, AlertCircle, Sparkles, X, Bot, MessageSquare, Loader2, Activity, Zap, Waves, ExternalLink, Info, Share2, Menu } from 'lucide-react';

// --- AYARLAR VE API ---
const GOOGLE_AD_CLIENT_ID = "ca-pub-XXXXXXXXXXXXXXXX"; // AdSense Pub ID'nizi buraya girin
const IS_ADSENSE_LIVE = false; // Yayına alırken bunu 'true' yapın!
const RADIO_API_BASE = "https://de1.api.radio-browser.info/json/stations";
const IP_API_URL = "https://ipapi.co/json/";
const apiKey = ""; // Gemini API Key

// --- SABİT VERİLER ---
const COUNTRIES = [
  { code: 'TR', name: 'Türkiye', flag: '🇹🇷' },
  { code: 'US', name: 'ABD', flag: '🇺🇸' },
  { code: 'GB', name: 'İngiltere', flag: '🇬🇧' },
  { code: 'DE', name: 'Almanya', flag: '🇩🇪' },
  { code: 'FR', name: 'Fransa', flag: '🇫🇷' },
  { code: 'IT', name: 'İtalya', flag: '🇮🇹' },
  { code: 'ES', name: 'İspanya', flag: '🇪🇸' },
  { code: 'BR', name: 'Brezilya', flag: '🇧🇷' },
  { code: 'JP', name: 'Japonya', flag: '🇯🇵' },
  { code: 'KR', name: 'Güney Kore', flag: '🇰🇷' },
  { code: 'RU', name: 'Rusya', flag: '🇷🇺' },
  { code: 'GR', name: 'Yunanistan', flag: '🇬🇷' },
  { code: 'AZ', name: 'Azerbaycan', flag: '🇦🇿' },
  { code: 'NL', name: 'Hollanda', flag: '🇳🇱' },
];

const GENRES = ['all', 'pop', 'rock', 'jazz', 'news', 'classical', 'dance', 'folk', 'rap', 'electronic', 'lofi', 'arabesque'];

// --- YARDIMCI SERVİSLER ---

// SEO Yönetimi (Radiocu Markası İçin Güncellendi)
const updateSEO = (title, description) => {
  document.title = title;
  let metaDesc = document.querySelector("meta[name='description']");
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = "description";
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute("content", description);
};

// Gemini AI Servisi
const callGemini = async (prompt) => {
  if (!apiKey) return "API Anahtarı eksik. Lütfen yapılandırın.";
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!response.ok) throw new Error('API Hatası');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Bağlantı sorunu.";
  } catch (error) {
    return "Şu anda AI servisine ulaşılamıyor.";
  }
};

// --- BİLEŞENLER ---

// 1. Akıllı İstasyon Logosu
const StationLogo = ({ url, alt, className }) => {
  const [error, setError] = useState(false);
  useEffect(() => { setError(false); }, [url]);

  if (!url || error) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-slate-800 ${className}`}>
        <Radio className="w-1/2 h-1/2 text-slate-600 opacity-50" />
      </div>
    );
  }
  return (
    <img 
      src={url} alt={alt} 
      className={`w-full h-full object-contain p-1 bg-slate-800 ${className}`}
      onError={() => setError(true)} loading="lazy" referrerPolicy="no-referrer"
    />
  );
};

// 2. AdSense Reklam Birimi (Güvenli Mod)
const AdSenseUnit = ({ slotId, style = {}, label }) => {
  useEffect(() => {
    if (IS_ADSENSE_LIVE && window.adsbygoogle) {
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { console.error("AdBlock tespit edildi"); }
    }
  }, []);

  if (!IS_ADSENSE_LIVE) {
    return (
      <div className="w-full bg-slate-800/30 border border-slate-700/50 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-500 p-2 my-4 select-none" style={{ ...style, minHeight: style.height || '100px' }}>
        <span className="text-[10px] uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded mb-1 text-slate-400">Reklam Alanı</span>
        <p className="text-[10px] opacity-60 font-mono">{label}</p>
      </div>
    );
  }

  return (
    <div className="ad-container my-4 overflow-hidden rounded-lg bg-slate-900 flex justify-center items-center">
      <ins className="adsbygoogle" style={{ display: 'block', ...style }} data-ad-client={GOOGLE_AD_CLIENT_ID} data-ad-slot={slotId} data-full-width-responsive="true"></ins>
    </div>
  );
};

// --- ANA UYGULAMA ---
export default function App() {
  // State
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('TR');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [autoLocated, setAutoLocated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // AI
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiMoodInput, setAiMoodInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFact, setAiFact] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  // Player & Audio
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('rs_volume')) || 0.8);
  const [error, setError] = useState(null);
  const audioRef = useRef(new Audio());

  // --- HOOKS ---

  // 1. Başlangıç: Konum ve Hacim Ayarı
  useEffect(() => {
    const initApp = async () => {
      // Konum
      try {
        const res = await fetch(IP_API_URL);
        const data = await res.json();
        if (data?.country_code && COUNTRIES.find(c => c.code === data.country_code)) {
          setSelectedCountry(data.country_code);
          setAutoLocated(true);
        }
      } catch (e) { console.log("Manuel konum modu"); }
    };
    initApp();

    // Audio Event Listeners (Tamponlama ve Hata Yönetimi)
    const audio = audioRef.current;
    
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => { setIsBuffering(false); setIsPlaying(true); setError(null); };
    const onPause = () => setIsPlaying(false);
    const onError = (e) => { 
        setIsBuffering(false); 
        setIsPlaying(false); 
        console.error("Audio Error:", e);
        setError("Yayın bağlantısı kurulamadı (Çevrimdışı veya format desteklenmiyor)."); 
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
  }, []);

  // 2. Radyoları Çek
  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`${RADIO_API_BASE}/bycountrycodeexact/${selectedCountry}?limit=100&order=votes&reverse=true`);
        const data = await res.json();
        const cleanData = data.filter(s => s.url_resolved && s.name.trim().length > 0 && !s.name.includes("test"));
        setStations(cleanData);
      } catch (e) {
        setError("İstasyon listesi alınamadı. İnternet bağlantınızı kontrol edin.");
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
    setAiFact(null);
  }, [selectedCountry]);

  // 3. Oynatma Mantığı
  useEffect(() => {
    if (currentStation) {
      setError(null);
      setIsBuffering(true);
      audioRef.current.src = currentStation.url_resolved;
      audioRef.current.load();
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(err => {
            if(err.name !== 'AbortError') { // Abort hatasını yoksay (hızlı geçişlerde olur)
                setIsBuffering(false);
                setIsPlaying(false);
                setError("Tarayıcı bu yayını otomatik başlatmayı engelledi veya yayın bozuk.");
            }
        });
      }

      // SEO Güncelle (Radiocu Markasıyla)
      const countryName = COUNTRIES.find(c => c.code === selectedCountry)?.name;
      updateSEO(
        `${currentStation.name} Canlı Dinle - Radiocu`, 
        `${currentStation.name} (${countryName}) canlı yayını. Radiocu ile kesintisiz müzik ve radyo keyfi.`
      );
    } else {
        // Varsayılan SEO
        const countryName = COUNTRIES.find(c => c.code === selectedCountry)?.name || "Dünya";
        updateSEO(
            `${countryName} Radyoları - Radiocu`,
            `Radiocu ile ${countryName} ve dünyanın dört bir yanından binlerce radyoyu ücretsiz, kesintisiz dinleyin.`
        );
    }
  }, [currentStation, selectedCountry]);

  // 4. Ses ve Kontroller
  useEffect(() => {
    if (isPlaying) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [isPlaying]);

  useEffect(() => { 
    audioRef.current.volume = volume; 
    localStorage.setItem('rs_volume', volume);
  }, [volume]);


  // --- HANDLERS ---
  const handleMoodSubmit = async (e) => {
    e.preventDefault();
    if (!aiMoodInput.trim()) return;
    setAiLoading(true); setAiSuggestion(null);
    const result = await callGemini(`Kullanıcı durumu: "${aiMoodInput}". Radyo için 3 İngilizce müzik türü (tags) öner. Sadece virgülle ayır. Örn: pop, jazz`);
    if (result) {
      const keywords = result.replace(/\n/g, '').trim();
      setSearchQuery(keywords); setAiSuggestion(`"${aiMoodInput}" modu: ${keywords}`);
    }
    setAiLoading(false);
  };

  const handleGetCountryFact = async () => {
    if (aiFact) return;
    setAiLoading(true);
    const countryName = COUNTRIES.find(c => c.code === selectedCountry)?.name;
    const result = await callGemini(`${countryName} müzik kültürü hakkında 1 cümlelik ilginç bilgi ver. Türkçe.`);
    setAiFact(result); setAiLoading(false);
  };

  const filteredStations = stations.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(q) || s.tags.toLowerCase().includes(q);
    const matchesGenre = selectedGenre === 'all' || s.tags.toLowerCase().includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  const theme = {
    bgMain: 'bg-slate-950', 
    bgPanel: 'bg-slate-900/95', 
    bgCard: 'bg-slate-800/40', 
    textAccent: 'text-indigo-400', // Radiocu için biraz daha modern indigo tonu
    border: 'border-white/5', 
    grad: 'from-indigo-600 to-purple-600'
  };

  return (
    <div className={`flex flex-col h-screen ${theme.bgMain} text-white font-sans overflow-hidden selection:bg-indigo-500/30`}>
      
      {/* NAVBAR */}
      <header className={`h-16 ${theme.bgPanel} backdrop-blur-md border-b ${theme.border} flex items-center justify-between px-4 z-30 shrink-0`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 bg-gradient-to-br ${theme.grad} rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20`}>
{/* Navbar Bölümü - Logo Değişikliği */}
<div className="flex items-center gap-3">
  <div className={`w-10 h-10 bg-gradient-to-br ${theme.grad} rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden`}>
    {/* Burayı Değiştiriyoruz: */}
    <img src="/logo.png" alt="Radiocu Logo" className="w-full h-full object-cover" />
  </div>
  <div>
    <h1 className="text-lg font-bold tracking-tight text-white leading-none">Radiocu</h1>
    <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Global Player</span>
  </div>
</div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">Radiocu</h1>
            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Global Player</span>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className={`flex items-center w-full ${theme.bgCard} rounded-lg px-4 py-2 border ${theme.border} focus-within:border-indigo-500/50 transition-colors`}>
                <Search className="text-slate-500 w-4 h-4 mr-2" />
                <input type="text" placeholder="Radyo veya şehir ara..." className="bg-transparent w-full border-none outline-none text-sm text-white placeholder-slate-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
        </div>

        <div className="flex items-center gap-2">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-400 hover:text-white"><Menu/></button>
            <button onClick={() => setShowAiPanel(!showAiPanel)} className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition ${showAiPanel ? 'bg-indigo-900 border-indigo-500 text-indigo-400' : 'border-slate-700 text-slate-400 hover:text-white'}`}>
                <Sparkles className="w-4 h-4" /> AI
            </button>
            <div className={`hidden md:flex items-center gap-2 ${theme.bgCard} px-3 py-1.5 rounded-lg border ${theme.border}`}>
                <MapPin className={`w-4 h-4 ${autoLocated ? theme.textAccent : 'text-slate-500'}`} />
                <select value={selectedCountry} onChange={(e) => { setSelectedCountry(e.target.value); setAutoLocated(false); }} className="bg-transparent outline-none text-sm font-medium cursor-pointer text-slate-300 max-w-[100px]">
                {COUNTRIES.map(c => <option key={c.code} value={c.code} className="bg-slate-900">{c.flag} {c.name}</option>)}
                </select>
            </div>
        </div>
      </header>

      {/* MOBİL MENÜ (Overlay) */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-slate-900 border-b border-slate-800 z-20 p-4 md:hidden animate-in slide-in-from-top-2">
            <div className="mb-4">
                 <p className="text-xs text-slate-500 mb-2 font-bold uppercase">Ülke Seç</p>
                 <select value={selectedCountry} onChange={(e) => { setSelectedCountry(e.target.value); setMobileMenuOpen(false); }} className="w-full bg-slate-800 p-3 rounded-lg text-white border border-slate-700">
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                 </select>
            </div>
            <div className="mb-4">
                 <p className="text-xs text-slate-500 mb-2 font-bold uppercase">Kategori</p>
                 <div className="flex flex-wrap gap-2">
                    {GENRES.map(g => (
                        <button key={g} onClick={() => { setSelectedGenre(g); setMobileMenuOpen(false); }} className={`px-3 py-1 rounded-full text-xs ${selectedGenre === g ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                            {g}
                        </button>
                    ))}
                 </div>
            </div>
            <button onClick={() => { setShowAiPanel(true); setMobileMenuOpen(false); }} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-bold flex items-center justify-center gap-2"><Sparkles className="w-4 h-4"/> AI Asistanı Aç</button>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar (Desktop) */}
        <aside className={`w-64 ${theme.bgPanel} border-r ${theme.border} hidden md:flex flex-col backdrop-blur-xl`}>
          <div className="p-6 overflow-y-auto flex-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2"><Waves className="w-3 h-3"/> Müzik Türleri</h3>
            <div className="space-y-1">
              {GENRES.map(g => (
                <button key={g} onClick={() => { setSelectedGenre(g); setSearchQuery(''); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-3 ${selectedGenre === g ? `bg-indigo-500/10 ${theme.textAccent} border border-indigo-500/20` : `text-slate-400 hover:text-white hover:bg-white/5`}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedGenre === g ? 'bg-indigo-400' : 'bg-slate-700'}`}></span>
                  <span className="capitalize">{g === 'all' ? 'Tümü' : g}</span>
                </button>
              ))}
            </div>
            <div className="mt-8">
                <AdSenseUnit slotId="sidebar-ad" label="Sidebar Reklam" style={{ height: '250px' }} />
            </div>
          </div>
          <div className="p-6 border-t border-slate-800 text-center">
             <p className="text-xs text-slate-600 font-mono">© 2024 Radiocu</p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-40">
           <div className="max-w-6xl mx-auto">
              
              {/* Header Ad */}
              <AdSenseUnit slotId="header-ad" label="Header Leaderboard" style={{ height: '90px' }} />

              <div className="mb-6 mt-6 border-b border-white/5 pb-4">
                 <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                    <span className="text-3xl">{COUNTRIES.find(c => c.code === selectedCountry)?.flag}</span>
                    {COUNTRIES.find(c => c.code === selectedCountry)?.name} Radyoları
                 </h1>
                 <p className="text-sm text-slate-400 mt-2 flex items-center gap-2">
                    {autoLocated && <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded text-xs border border-indigo-500/20 flex items-center gap-1"><Zap className="w-3 h-3"/> Konum Algılandı</span>}
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700">{filteredStations.length} İstasyon</span>
                 </p>
              </div>

              {/* Mobile Search */}
              <div className="md:hidden mb-6">
                <div className={`flex items-center w-full ${theme.bgCard} rounded-lg px-4 py-3 border ${theme.border}`}>
                    <Search className="text-slate-500 w-4 h-4 mr-2" />
                    <input type="text" placeholder="Radyo ara..." className="bg-transparent w-full border-none outline-none text-sm text-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>

              {/* AI Suggestion */}
              {aiSuggestion && (
                 <div className="mb-6 p-4 rounded-xl bg-indigo-900/20 border border-indigo-500/30 flex justify-between items-center animate-in fade-in">
                    <div className="flex items-center gap-3">
                        <Bot className="w-5 h-5 text-indigo-400" />
                        <span className="text-indigo-200 text-sm">{aiSuggestion}</span>
                    </div>
                    <button onClick={() => { setSearchQuery(''); setAiSuggestion(null); }} className="text-xs text-indigo-400 hover:text-white underline">Temizle</button>
                 </div>
              )}

              {/* Error State */}
              {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-300 text-sm"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                 {loading ? [...Array(8)].map((_, i) => <div key={i} className={`h-24 ${theme.bgCard} rounded-xl animate-pulse border ${theme.border}`}></div>) : 
                  filteredStations.map((s, idx) => (
                    <React.Fragment key={s.stationuuid}>
                        {/* Feed İçi Reklam Örneği */}
                        {idx > 0 && idx % 12 === 0 && <div className="col-span-full"><AdSenseUnit slotId="feed-ad" label="Feed Arası Reklam" style={{ height: '90px' }} /></div>}
                        
                        <div onClick={() => setCurrentStation(s)} className={`group relative ${theme.bgCard} hover:bg-slate-800 rounded-xl p-3 transition-all cursor-pointer border ${currentStation?.stationuuid === s.stationuuid ? 'border-indigo-500 bg-indigo-500/10' : theme.border} hover:shadow-lg hover:-translate-y-0.5`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 relative bg-slate-900 border ${theme.border}`}>
                                    <StationLogo url={s.favicon} alt={s.name} />
                                    {/* Overlay Play Icon */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Play className="w-6 h-6 text-white fill-current"/></div>
                                    {/* Playing Animation */}
                                    {currentStation?.stationuuid === s.stationuuid && isPlaying && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Activity className="w-6 h-6 text-indigo-400 animate-pulse" /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-bold truncate text-sm ${currentStation?.stationuuid === s.stationuuid ? 'text-indigo-400' : 'text-slate-200'}`}>{s.name}</h3>
                                    <p className="text-xs text-slate-500 truncate mt-0.5">{s.tags ? s.tags.split(',').slice(0, 2).join(', ') : 'Radyo'}</p>
                                    <div className="flex items-center mt-1.5 gap-2">
                                        <span className="text-[10px] bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">{s.bitrate || 128}k</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                  ))
                 }
              </div>
              
              <div className="mt-12 mb-8">
                 <AdSenseUnit slotId="footer-ad" label="Footer Reklam" style={{ height: '120px' }} />
              </div>

           </div>
        </main>

        {/* AI Panel (Right Sidebar) */}
        <div className={`fixed inset-y-0 right-0 w-full sm:w-96 ${theme.bgPanel} backdrop-blur-xl border-l ${theme.border} shadow-2xl transform transition-transform duration-300 z-50 ${showAiPanel ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col h-full p-6">
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                    <h2 className="text-lg font-bold text-indigo-400 flex items-center gap-2"><Sparkles className="w-4 h-4"/> AI Asistan</h2>
                    <button onClick={() => setShowAiPanel(false)}><X className="w-5 h-5 text-slate-500 hover:text-white"/></button>
                </div>
                <div className="space-y-6 flex-1 overflow-y-auto">
                    {/* Mood */}
                    <div className="p-5 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                        <p className="text-xs text-slate-400 mb-2 font-bold uppercase">Ruh Hali</p>
                        <form onSubmit={handleMoodSubmit} className="relative">
                            <input type="text" value={aiMoodInput} onChange={(e) => setAiMoodInput(e.target.value)} placeholder="Örn: Çalışıyorum, Hüzünlü..." className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none" />
                            <button type="submit" disabled={aiLoading} className="absolute right-2 top-2 p-1.5 bg-indigo-600 rounded text-white">{aiLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Zap className="w-4 h-4"/>}</button>
                        </form>
                    </div>
                    {/* Fact */}
                    <div className="p-5 rounded-xl border border-slate-700 bg-slate-800/20">
                        <p className="text-xs text-slate-400 mb-2 font-bold uppercase">Yerel Bilgi</p>
                        <p className="text-xs text-slate-500 mb-4">{COUNTRIES.find(c => c.code === selectedCountry)?.name} hakkında bilgi al.</p>
                        {!aiFact ? (
                             <button onClick={handleGetCountryFact} disabled={aiLoading} className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-bold text-slate-300 transition">{aiLoading ? "Yükleniyor..." : "Bilgi Getir"}</button>
                        ) : (
                            <div className="animate-in fade-in">
                                <p className="text-sm text-slate-300 italic mb-3">"{aiFact}"</p>
                                <button onClick={() => setAiFact(null)} className="text-xs text-indigo-400 underline">Yeni Bilgi</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

      </div>

      {/* PLAYER BAR (Fixed Bottom) */}
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
                            {isBuffering ? (
                                <span className="text-xs text-yellow-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Yükleniyor...</span>
                            ) : (
                                <span className={`text-[10px] font-mono uppercase tracking-wide flex items-center gap-1 ${isPlaying ? 'text-green-400' : 'text-slate-500'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></span>
                                    {isPlaying ? 'CANLI' : 'DURAKLATILDI'}
                                </span>
                            )}
                        </div>
                    </div>
                </>
            ) : <div className="text-slate-500 text-xs flex items-center gap-2"><Radio className="w-4 h-4"/> Bir istasyon seçin...</div>}
         </div>

         <div className="w-1/3 flex justify-center gap-4 sm:gap-6 items-center">
             <button className="text-slate-500 hover:text-white transition"><SkipBack className="w-5 h-5"/></button>
             <button 
                onClick={() => currentStation && (isPlaying ? audioRef.current.pause() : audioRef.current.play())}
                disabled={!currentStation || isBuffering}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${!currentStation ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 text-white hover:scale-105 hover:bg-indigo-500'}`}
             >
                {isBuffering ? <Loader2 className="w-6 h-6 animate-spin"/> : (isPlaying ? <Pause className="w-5 h-5 fill-current"/> : <Play className="w-5 h-5 fill-current ml-1"/>)}
             </button>
             <button className="text-slate-500 hover:text-white transition"><SkipForward className="w-5 h-5"/></button>
         </div>

         <div className="w-1/3 flex justify-end items-center gap-3">
             <button onClick={() => setVolume(v => v === 0 ? 0.8 : 0)} className="text-slate-400 hover:text-white transition hidden sm:block">
                {volume === 0 ? <VolumeX className="w-5 h-5"/> : <Volume2 className="w-5 h-5"/>}
             </button>
             <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-20 sm:w-28 h-1 bg-slate-700 rounded-full cursor-pointer accent-indigo-500" />
         </div>
      </div>

    </div>
  );
}