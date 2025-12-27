import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Search, Globe as GlobeIcon, Radio, MapPin, Music, Wifi, AlertCircle, Sparkles, X, Bot, MessageSquare, Loader2, Activity, Zap, Waves, Menu, RefreshCw, Star, Info, Shield, FileText, Mail, HelpCircle, ChevronRight, BookOpen, Headphones, Signal, Smartphone, Lock, LogIn, Plus, Trash2 } from 'lucide-react';

// FIREBASE İMPORTLARI
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

// --- GLOBAL AYARLAR ---
const GOOGLE_AD_CLIENT_ID = "ca-pub-3676498147737928"; 
const IS_ADSENSE_LIVE = true; 
const apiKey = ""; 

// --- FIREBASE AYARLARI ---
const firebaseConfig = {
  apiKey: "AIzaSyC2D7XXawsp9QapGKZx86QO2sdbvqhwVow",
  authDomain: "radiocu-5be49.firebaseapp.com",
  projectId: "radiocu-5be49",
  storageBucket: "radiocu-5be49.firebasestorage.app",
  messagingSenderId: "838585565724",
  appId: "1:838585565724:web:c60a08c1d75fc04c6295d9",
  measurementId: "G-K7D85VHH4V"
};

// Firebase Başlatma
let db, auth;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
} catch (e) {
    console.warn("Firebase hatası:", e);
}

// --- SABİT LİSTELER (Yedek Veritabanı) ---
const VIP_STATIONS_DEFAULT = {
  TR: [
    { name: "Power Türk", url: "https://listen.powerapp.com.tr/powerturk/mpeg/icecast.audio", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Power_T%C3%BCrk_logo.svg", site: "https://powerapp.com.tr", tag: "pop,türkçe" },
    { name: "Power FM", url: "https://listen.powerapp.com.tr/powerfm/mpeg/icecast.audio", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Power_FM_logo.svg", site: "https://powerapp.com.tr", tag: "pop,hit" },
    { name: "Metro FM", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/METRO_FM_SC", logo: "https://upload.wikimedia.org/wikipedia/tr/f/f7/Metro_FM_logo.png", site: "https://karnaval.com", tag: "pop,yabancı" },
    { name: "Süper FM", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/SUPER_FM_SC", logo: "https://upload.wikimedia.org/wikipedia/tr/b/b5/S%C3%BCper_FM_logo.png", site: "https://karnaval.com", tag: "pop,türkçe" },
    { name: "Joy Türk", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_SC", logo: "https://upload.wikimedia.org/wikipedia/tr/0/09/Joy_FM_logo.png", site: "https://karnaval.com", tag: "slow,aşk" },
    { name: "Kafa Radyo", url: "https://kafaradyo.live/kafaradyo/128/icecast.audio", logo: "https://kafaradyo.com/assets/img/logo.png", site: "https://kafaradyo.com", tag: "talk" },
    { name: "Alem FM", url: "https://turkmedya.radyotvonline.net/alemfm", logo: "https://upload.wikimedia.org/wikipedia/tr/6/62/Alem_FM_logo.png", site: "https://alemfm.com", tag: "pop,türkçe" }
  ]
};

const API_MIRRORS = ["https://at1.api.radio-browser.info", "https://de1.api.radio-browser.info"];
const TRANSLATIONS = {
  TR: { code: "tr", admin: "Yönetici", addStation: "Radyo Ekle", logout: "Çıkış", login: "Giriş", email: "E-posta", pass: "Şifre", searchPlaceholder: "Radyo ara...", categories: "Kategoriler", allRadios: "Tüm Radyolar", btnLoad: "Yükleniyor...", live: "CANLI", paused: "DURAKLATILDI", stations: "İstasyon", locationDetected: "Konum Algılandı", footerRights: "Tüm Hakları Saklıdır.", errorMsg: "Liste alınamadı.", retry: "Tekrar Dene", playingError: "Yayın açılmadı.", seoTitle: "Canlı Radyo Dinle", seoDesc: "Kesintisiz radyo keyfi." },
  EN: { code: "en", admin: "Admin", addStation: "Add Station", logout: "Logout", login: "Login", email: "Email", pass: "Password", searchPlaceholder: "Search...", categories: "Genres", allRadios: "All Radios", btnLoad: "Loading...", live: "LIVE", paused: "PAUSED", stations: "Stations", locationDetected: "Location", footerRights: "All Rights Reserved.", errorMsg: "Failed load.", retry: "Retry", playingError: "Stream failed.", seoTitle: "Listen Live Radio", seoDesc: "Listen online radio." }
};
const COUNTRIES = [{ code: 'TR', name: 'Türkiye', flag: '🇹🇷' }, { code: 'DE', name: 'Deutschland', flag: '🇩🇪' }, { code: 'US', name: 'USA', flag: '🇺🇸' }, { code: 'GB', name: 'UK', flag: '🇬🇧' }, { code: 'FR', name: 'France', flag: '🇫🇷' }, { code: 'IT', name: 'Italia', flag: '🇮🇹' }, { code: 'ES', name: 'España', flag: '🇪🇸' }, { code: 'NL', name: 'Netherlands', flag: '🇳🇱' }, { code: 'BR', name: 'Brasil', flag: '🇧🇷' }, { code: 'AZ', name: 'Azerbaycan', flag: '🇦🇿' }];
const GENRES = ['all', 'pop', 'rock', 'jazz', 'news', 'classical', 'dance', 'folk', 'rap', 'arabesque'];

// --- BİLEŞENLER ---
const BrandLogo = ({ className }) => (<div className={className}><svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><rect width="24" height="24" rx="6" fill="url(#brand_grad)" /><path d="M7 7H11C13.2 7 15 8.8 15 11V11C15 13.2 13.2 15 11 15H7V7Z" stroke="white" strokeWidth="2"/><path d="M7 15L11.5 20" stroke="white" strokeWidth="2"/><defs><linearGradient id="brand_grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stopColor="#4f46e5" /><stop offset="1" stopColor="#9333ea" /></linearGradient></defs></svg></div>);

const StationLogo = ({ url, alt, homepage, className }) => {
  const [imgSrc, setImgSrc] = useState(url);
  useEffect(() => { 
    if (!url || url.startsWith('http://')) { 
      if (homepage) { setImgSrc(`https://www.google.com/s2/favicons?domain=${homepage}&sz=128`); } 
    } else { setImgSrc(url); } 
  }, [url, homepage]);
  return <img src={imgSrc} alt={alt} className={`object-contain bg-white/5 p-1 ${className}`} onError={() => { if (homepage && !imgSrc.includes('google.com')) { setImgSrc(`https://www.google.com/s2/favicons?domain=${homepage}&sz=128`); } }} loading="lazy" referrerPolicy="no-referrer" />;
};

const AdSenseUnit = ({ slotId }) => { 
  useEffect(() => { if (IS_ADSENSE_LIVE && window.adsbygoogle) try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {} }, []); 
  if (!IS_ADSENSE_LIVE) return <div className="w-full h-24 bg-slate-800/30 border border-dashed border-slate-700/50 flex items-center justify-center text-slate-500 text-xs">Reklam</div>; 
  return <div className="ad-container my-4 flex justify-center"><ins className="adsbygoogle" style={{display:'block'}} data-ad-client={GOOGLE_AD_CLIENT_ID} data-ad-slot={slotId} data-full-width-responsive="true"></ins></div>; 
};

// --- EKSİK OLAN İÇERİK BİLEŞENLERİ (HATAYI ÇÖZEN KISIM) ---
const FeaturesSection = ({ lang }) => {
    const content = {
        TR: [ { icon: <Wifi className="w-6 h-6"/>, title: "Kesintisiz", desc: "Donmayan altyapı." }, { icon: <Headphones className="w-6 h-6"/>, title: "HD Kalite", desc: "Yüksek ses kalitesi." }, { icon: <GlobeIcon className="w-6 h-6"/>, title: "Global", desc: "Binlerce radyo." }, { icon: <Smartphone className="w-6 h-6"/>, title: "Mobil", desc: "%100 mobil uyumlu." } ],
        EN: [ { icon: <Wifi className="w-6 h-6"/>, title: "Uninterrupted", desc: "Stable streaming." }, { icon: <Headphones className="w-6 h-6"/>, title: "High Quality", desc: "HD audio." }, { icon: <GlobeIcon className="w-6 h-6"/>, title: "Global", desc: "Thousands of stations." }, { icon: <Smartphone className="w-6 h-6"/>, title: "Mobile", desc: "Fully responsive." } ]
    };
    const features = content[lang] || content['EN'];
    return (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 mb-12">{features.map((f, i) => (<div key={i} className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl flex flex-col items-center text-center hover:bg-slate-800/50 transition"><div className="mb-3 p-3 bg-indigo-500/10 rounded-full text-indigo-400">{f.icon}</div><h4 className="text-white font-bold mb-1">{f.title}</h4><p className="text-xs text-slate-400">{f.desc}</p></div>))}</div>);
};

const BlogSection = ({ lang }) => {
  const articles = {
    TR: [ { title: "Dijital Radyo", date: "24.11", c: "Radyolar artık dijital dünyada." }, { title: "Neden Online?", d: "20.11", c: "Cızırtı yok, internetin olduğu her yerde." }, { title: "Müzik ve Psikoloji", d: "15.11", c: "Müziğin insan üzerindeki etkisi." }].map((a, i) => (<div key={i} className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800/60 hover:border-indigo-500/30 transition"><div className="text-xs text-indigo-400 mb-2 font-mono">{a.d}</div><h3 className="text-lg font-bold text-slate-200 mb-2">{a.title}</h3><p className="text-sm text-slate-500">{a.c}</p></div>)),
    EN: [ { title: "Digital Radio", date: "Nov 24", c: "Digital streams replace FM." }, { title: "Why Online?", d: "Nov 20", c: "CD-quality sound everywhere." }, { title: "Music & Mood", d: "Nov 15", c: "Music impacts psychology." }].map((a, i) => (<div key={i} className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800/60 hover:border-indigo-500/30 transition"><div className="text-xs text-indigo-400 mb-2 font-mono">{a.date}</div><h3 className="text-lg font-bold text-slate-200 mb-2">{a.title}</h3><p className="text-sm text-slate-500">{a.c}</p></div>))
  };
  return (<div className="mt-12 mb-12"><h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-500"/> Blog</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{articles[lang] || articles['EN']}</div></div>);
};

const FAQSection = ({ lang }) => {
  const faqs = {
    TR: [ { q: "Ücretli mi?", a: "Hayır, tamamen ücretsizdir." }, { q: "Mobil uygulama?", a: "Mobil uyumludur." } ],
    EN: [ { q: "Is it free?", a: "Yes, completely free." }, { q: "Mobile app?", a: "Mobile ready." } ]
  };
  const list = faqs[lang] || faqs['EN'];
  return (<div className="mt-8 mb-12"><h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-indigo-500"/> Sıkça Sorulan Sorular</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{list.map((item, i) => (<div key={i} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition"><h4 className="text-sm font-bold text-slate-200 mb-2">{item.q}</h4><p className="text-xs text-slate-400 leading-relaxed">{item.a}</p></div>))}</div></div>);
};

const SeoContent = ({ country, lang }) => { const cName = COUNTRIES.find(c => c.code === country)?.name || country; const t = TRANSLATIONS[lang] || TRANSLATIONS['EN']; return (<div className="mt-12 mb-8 p-6 bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 text-sm"><h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><GlobeIcon className="w-5 h-5 text-indigo-500"/> {t.seoTitle} {cName}</h2><p>{t.seoDesc} {cName}.</p></div>); };

const Footer = ({ onOpenAdmin, lang }) => {
    return (<footer className="mt-16 py-12 border-t border-slate-800 bg-slate-950/50"><div className="max-w-6xl mx-auto px-4 text-center"><p className="text-slate-500 text-xs mb-4">&copy; 2024 Radiocu.com</p><div className="flex justify-center gap-4 text-xs text-slate-500 mb-4"><a href="/hakkimizda.html" className="hover:text-white">Hakkımızda</a><a href="/gizlilik-politikasi.html" className="hover:text-white">Gizlilik</a><a href="mailto:info@radiocu.com" className="hover:text-white">İletişim</a></div><button onClick={onOpenAdmin} className="text-[10px] text-slate-700 hover:text-indigo-500 transition flex items-center justify-center gap-1 mx-auto"><Lock className="w-3 h-3"/> Yönetici Girişi</button></div></footer>);
};

// --- ADMİN PANELİ ---
const AdminModal = ({ isOpen, onClose, user }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newStation, setNewStation] = useState({ name: '', url: '', logo: '', country: 'TR', tag: '' });
    const [dbStations, setDbStations] = useState([]);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (user && isOpen && db) {
            const fetchDb = async () => {
                try {
                    const q = query(collection(db, "stations"));
                    const querySnapshot = await getDocs(q);
                    setDbStations(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                } catch(e) { console.error(e); }
            };
            fetchDb();
        }
    }, [user, isOpen, msg]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try { await signInWithEmailAndPassword(auth, email, password); setMsg(""); } catch (error) { setMsg("Giriş başarısız."); }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newStation.name || !newStation.url) return;
        try {
            await addDoc(collection(db, "stations"), newStation);
            setMsg("Eklendi!");
            setNewStation({ name: '', url: '', logo: '', country: 'TR', tag: '' });
        } catch (e) { setMsg("Hata."); }
    };

    const handleDelete = async (id) => {
        if(window.confirm("Silinsin mi?")) { await deleteDoc(doc(db, "stations", id)); setMsg("Silindi."); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X/></button>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Shield className="text-indigo-500"/> Yönetici Paneli</h2>
                
                {!user ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input type="email" placeholder="E-posta" className="w-full bg-slate-800 p-3 rounded text-white border border-slate-700" value={email} onChange={e=>setEmail(e.target.value)} />
                        <input type="password" placeholder="Şifre" className="w-full bg-slate-800 p-3 rounded text-white border border-slate-700" value={password} onChange={e=>setPassword(e.target.value)} />
                        <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded font-bold">Giriş Yap</button>
                        {msg && <p className="text-red-400 text-sm text-center">{msg}</p>}
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                            <h3 className="text-sm font-bold text-white mb-3 flex gap-2"><Plus className="w-4 h-4"/> Yeni Radyo Ekle</h3>
                            <form onSubmit={handleAdd} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" placeholder="Ad" className="bg-slate-900 p-2 rounded text-white text-sm border border-slate-700" value={newStation.name} onChange={e=>setNewStation({...newStation, name: e.target.value})} required/>
                                    <select className="bg-slate-900 p-2 rounded text-white text-sm border border-slate-700" value={newStation.country} onChange={e=>setNewStation({...newStation, country: e.target.value})}>{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}</select>
                                </div>
                                <input type="url" placeholder="Yayın Linki (HTTPS)" className="w-full bg-slate-900 p-2 rounded text-white text-sm border border-slate-700" value={newStation.url} onChange={e=>setNewStation({...newStation, url: e.target.value})} required/>
                                <input type="url" placeholder="Logo" className="w-full bg-slate-900 p-2 rounded text-white text-sm border border-slate-700" value={newStation.logo} onChange={e=>setNewStation({...newStation, logo: e.target.value})} />
                                <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white p-2 rounded text-sm font-bold">Kaydet</button>
                            </form>
                            {msg && <p className="text-green-400 text-xs mt-2 text-center">{msg}</p>}
                        </div>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Veritabanı</h3>
                            {dbStations.map(s => (
                                <div key={s.id} className="flex justify-between items-center p-2 hover:bg-slate-800 rounded border-b border-slate-800/50">
                                    <span className="text-sm text-white">{s.name} ({s.country})</span>
                                    <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => signOut(auth)} className="w-full p-2 text-slate-500 hover:text-white text-sm">Çıkış</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- APP ---
export default function App() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('TR');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [autoLocated, setAutoLocated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appLang, setAppLang] = useState('EN');
  const t = TRANSLATIONS[appLang] || TRANSLATIONS['EN'];
  const [currentStation, setCurrentStation] = useState(null);
  const currentStationRef = useRef(null); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('rs_volume')) || 0.8);
  const [error, setError] = useState(null);
  const audioRef = useRef(new Audio());
  
  // ADMIN STATE
  const [showAdmin, setShowAdmin] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => { if(auth) return onAuthStateChanged(auth, (u) => setUser(u)); }, []);

  const fetchWithFailover = async (countryCode) => {
    setLoading(true); setError(null);
    let data = [];
    
    // 1. Firebase (Manuel)
    let manualStations = [];
    if (db) {
        try {
            const q = query(collection(db, "stations"));
            const snapshot = await getDocs(q);
            manualStations = snapshot.docs
                .map(doc => ({ ...doc.data(), stationuuid: doc.id, is_manual: true }))
                .filter(s => s.country === countryCode);
        } catch (e) { console.error(e); }
    }
    
    if (manualStations.length === 0) {
        const hardcoded = VIP_STATIONS_DEFAULT[countryCode] || [];
        manualStations = hardcoded.map(s => ({ stationuuid: `manual-${s.name}`, name: s.name, url_resolved: s.url, favicon: s.logo, homepage: s.site, tags: s.tag, is_manual: true }));
    }

    // 2. API (Otomatik)
    for (const server of API_MIRRORS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(`${server}/json/stations/bycountrycodeexact/${countryCode}?limit=200&order=votes&reverse=true`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) { data = await res.json(); break; }
      } catch (e) {}
    }
    
    let cleanApiData = data.filter(s => s.url_resolved && s.name.trim().length > 0 && !s.name.toLowerCase().includes("test") && s.url_resolved.startsWith("https") && !s.url_resolved.includes(".m3u8"));
    cleanApiData = cleanApiData.filter(s => !manualStations.some(m => m.name.toLowerCase() === s.name.toLowerCase()));
    
    const finalData = [...manualStations, ...cleanApiData];
    if (finalData.length > 0) { setStations(finalData); } else { setError(t.errorMsg); }
    setLoading(false);
  };

  useEffect(() => {
    const initApp = async () => {
      audioRef.current.crossOrigin = "anonymous";
      const browserLang = navigator.language.split('-')[0].toUpperCase();
      if (TRANSLATIONS[browserLang]) setAppLang(browserLang);
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data?.country_code) {
          const code = data.country_code;
          if (COUNTRIES.find(c => c.code === code)) { setSelectedCountry(code); setAutoLocated(true); }
          if (TRANSLATIONS[code]) setAppLang(code);
        }
      } catch (e) {}
    };
    initApp();
    const audio = audioRef.current;
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => { setIsBuffering(false); setIsPlaying(true); setError(null); };
    const onPause = () => setIsPlaying(false);
    const onError = () => { setIsBuffering(false); setIsPlaying(false); setError(t.playingError); };
    audio.addEventListener('waiting', onWaiting); audio.addEventListener('playing', onPlaying); audio.addEventListener('pause', onPause); audio.addEventListener('error', onError);
    return () => { audio.removeEventListener('waiting', onWaiting); audio.removeEventListener('playing', onPlaying); audio.removeEventListener('pause', onPause); audio.removeEventListener('error', onError); };
  }, []); 

  useEffect(() => { fetchWithFailover(selectedCountry); }, [selectedCountry]);

  useEffect(() => {
    currentStationRef.current = currentStation;
    if (currentStation) {
      setIsBuffering(true); setError(null);
      let streamUrl = currentStation.url_resolved || currentStation.url;
      if (streamUrl && streamUrl.startsWith('http://')) { streamUrl = streamUrl.replace('http://', 'https://'); }
      audioRef.current.src = streamUrl; audioRef.current.load();
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) { playPromise.catch(err => { if(err.name !== 'AbortError') { setIsBuffering(false); setIsPlaying(false); } }); }
    }
  }, [currentStation]);

  useEffect(() => { if (isPlaying) { audioRef.current.play().catch(e => {}); } else { audioRef.current.pause(); } }, [isPlaying]);
  useEffect(() => { audioRef.current.volume = volume; localStorage.setItem('rs_volume', volume); }, [volume]);

  const filteredStations = stations.filter(s => {
    const q = searchQuery.toLowerCase();
    return (s.name.toLowerCase().includes(q) || s.tags?.toLowerCase().includes(q)) && (selectedGenre === 'all' || s.tags?.toLowerCase().includes(selectedGenre));
  });

  const theme = { bgMain: 'bg-slate-950', bgPanel: 'bg-slate-900/95', bgCard: 'bg-slate-800/40', textAccent: 'text-indigo-400', border: 'border-white/5' };

  return (
    <div className={`flex flex-col h-screen ${theme.bgMain} text-white font-sans overflow-hidden selection:bg-indigo-500/30`}>
      <header className={`h-16 ${theme.bgPanel} backdrop-blur-md border-b ${theme.border} flex items-center justify-between px-4 z-30 shrink-0`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => {setCurrentStation(null); setSearchQuery('');}}>
          <div className="w-10 h-10 shrink-0 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 bg-white/5 border border-white/10"><BrandLogo className="w-full h-full" /></div>
          <div className="flex flex-col justify-center h-10"><h1 className="text-xl font-bold tracking-tight text-white leading-none">Radiocu</h1><span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase leading-none mt-1">Global Player</span></div>
        </div>
        <div className="hidden md:flex flex-1 max-w-md mx-6"><div className={`flex items-center w-full ${theme.bgCard} rounded-lg px-4 py-2 border ${theme.border} focus-within:border-indigo-500/50 transition-colors`}><Search className="text-slate-500 w-4 h-4 mr-2" /><input type="text" placeholder={t.searchPlaceholder} className="bg-transparent w-full border-none outline-none text-sm text-white placeholder-slate-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div></div>
        <div className="flex items-center gap-2">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-400 hover:text-white"><Menu/></button>
            <div className={`hidden md:flex items-center gap-2 ${theme.bgCard} px-3 py-1.5 rounded-lg border ${theme.border}`}><MapPin className={`w-4 h-4 ${autoLocated ? theme.textAccent : 'text-slate-500'}`} /><select value={selectedCountry} onChange={(e) => { setSelectedCountry(e.target.value); setAutoLocated(false); }} className="bg-transparent outline-none text-sm font-medium cursor-pointer text-slate-300 max-w-[100px]">{COUNTRIES.map(c => <option key={c.code} value={c.code} className="bg-slate-900">{c.flag} {c.name}</option>)}</select></div>
            <div className="hidden md:flex items-center justify-center w-8 h-8 bg-slate-800 rounded text-xs font-bold text-slate-400 border border-slate-700 uppercase" title="Language">{appLang}</div>
        </div>
      </header>
      
      {mobileMenuOpen && (<div className="absolute top-16 left-0 w-full bg-slate-900 border-b border-slate-800 z-20 p-4 md:hidden animate-in slide-in-from-top-2"><div className="mb-4"><select value={selectedCountry} onChange={(e) => { setSelectedCountry(e.target.value); setMobileMenuOpen(false); }} className="w-full bg-slate-800 p-3 rounded-lg text-white border border-slate-700">{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}</select></div></div>)}

      <div className="flex flex-1 overflow-hidden relative">
        <aside className={`w-64 ${theme.bgPanel} border-r ${theme.border} hidden md:flex flex-col backdrop-blur-xl`}>
            <div className="p-6 overflow-y-auto flex-1"><h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2"><Waves className="w-3 h-3"/> {t.categories}</h3><div className="space-y-1">{GENRES.map(g => (<button key={g} onClick={() => { setSelectedGenre(g); setSearchQuery(''); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-3 ${selectedGenre === g ? `bg-indigo-500/10 ${theme.textAccent} border border-indigo-500/20` : `text-slate-400 hover:text-white hover:bg-white/5`}`}><span className={`w-1.5 h-1.5 rounded-full ${selectedGenre === g ? 'bg-indigo-400' : 'bg-slate-700'}`}></span><span className="capitalize">{g === 'all' ? t.allRadios : g}</span></button>))}</div><div className="mt-8"><AdSenseUnit slotId="sidebar-ad" /></div></div>
            <div className="p-6 border-t border-slate-800 text-center flex flex-col gap-1"><p className="text-xs text-slate-600 font-mono">© 2024 Radiocu</p></div>
        </aside>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-40">
           <div className="max-w-6xl mx-auto">
              <AdSenseUnit slotId="header-ad" />
              <div className="mb-6 mt-6 border-b border-white/5 pb-4"><div className="flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3"><span className="text-3xl">{COUNTRIES.find(c => c.code === selectedCountry)?.flag}</span>{COUNTRIES.find(c => c.code === selectedCountry)?.name}</h1><p className="text-sm text-slate-400 mt-2 flex items-center gap-2">{autoLocated && <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded text-xs border border-indigo-500/20 flex items-center gap-1"><Zap className="w-3 h-3"/> {t.locationDetected}</span>}<span className="bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700">{filteredStations.length} {t.stations}</span></p></div><button onClick={() => fetchWithFailover(selectedCountry)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition self-end md:self-auto"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button></div></div>
              <div className="md:hidden mb-6"><div className={`flex items-center w-full ${theme.bgCard} rounded-lg px-4 py-3 border ${theme.border}`}><Search className="text-slate-500 w-4 h-4 mr-2" /><input type="text" placeholder={t.searchPlaceholder} className="bg-transparent w-full border-none outline-none text-sm text-white placeholder-slate-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div></div>
              {error && (<div className="mb-6 p-6 bg-red-500/10 border border-red-500/20 rounded-xl flex flex-col items-center justify-center text-center gap-3 animate-in fade-in"><AlertCircle className="w-8 h-8 text-red-400" /><p className="text-red-200 text-sm">{error}</p><button onClick={() => fetchWithFailover(selectedCountry)} className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg text-sm transition flex items-center gap-2"><RefreshCw className="w-4 h-4"/> {t.retry}</button></div>)}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                 {loading ? [...Array(8)].map((_, i) => <div key={i} className={`h-24 ${theme.bgCard} rounded-xl animate-pulse border ${theme.border}`}></div>) : 
                  filteredStations.map((s, idx) => (
                    <React.Fragment key={s.stationuuid}>
                        {idx > 0 && idx % 12 === 0 && <div className="col-span-full"><AdSenseUnit slotId="feed-ad" /></div>}
                        <div onClick={() => setCurrentStation(s)} className={`group relative ${theme.bgCard} hover:bg-slate-800 rounded-xl p-3 transition-all cursor-pointer border ${currentStation?.stationuuid === s.stationuuid ? 'border-indigo-500 bg-indigo-500/10' : theme.border} hover:shadow-lg hover:-translate-y-0.5`}>
                            {s.is_manual && <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.8)]" title="Manuel Eklendi"></div>}
                            <div className="flex items-center gap-3">
                                <div className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 relative bg-slate-900 border ${theme.border}`}><StationLogo url={s.favicon || s.logo} homepage={s.homepage || s.site} alt={s.name} /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Play className="w-6 h-6 text-white fill-current"/></div>{currentStation?.stationuuid === s.stationuuid && isPlaying && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Activity className="w-6 h-6 text-indigo-400 animate-pulse" /></div>}</div>
                                <div className="flex-1 min-w-0"><h3 className={`font-bold truncate text-sm ${currentStation?.stationuuid === s.stationuuid ? 'text-indigo-400' : 'text-slate-200'}`}>{s.name}</h3><p className="text-xs text-slate-500 truncate mt-0.5">{s.tags ? s.tags.split(',').slice(0, 2).join(', ') : 'Radyo'}</p></div>
                            </div>
                        </div>
                    </React.Fragment>
                  ))
                 }
              </div>
              <FeaturesSection lang={appLang} />
              <BlogSection lang={appLang} />
              <SeoContent country={selectedCountry} lang={appLang} />
              <FAQSection lang={appLang} />
              <Footer onOpenAdmin={() => setShowAdmin(true)} lang={appLang} />
              <div className="mt-12 mb-24"><AdSenseUnit slotId="footer-ad" /></div>
           </div>
        </main>
        
        {/* --- ADMİN MODALI --- */}
        <AdminModal isOpen={showAdmin} onClose={() => setShowAdmin(false)} user={user} />
      </div>
      <div className={`h-24 ${theme.bgPanel} border-t ${theme.border} fixed bottom-0 w-full flex items-center px-4 md:px-8 z-40 shadow-[0_-5px_30px_rgba(0,0,0,0.5)]`}>
         <div className="w-1/3 flex items-center gap-4">
            {currentStation ? (
                <>
                    <div className={`w-14 h-14 rounded-xl border ${theme.border} bg-slate-900 hidden sm:block relative overflow-hidden`}><StationLogo url={currentStation.favicon || currentStation.logo} homepage={currentStation.homepage || currentStation.site} alt={currentStation.name} /></div>
                    <div><h4 className="text-white font-bold text-sm line-clamp-1">{currentStation.name}</h4><div className="flex items-center gap-2 mt-1">{isBuffering ? <span className="text-xs text-yellow-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> {t.btnLoad}</span> : <span className={`text-[10px] font-mono uppercase tracking-wide flex items-center gap-1 ${isPlaying ? 'text-green-400' : 'text-slate-500'}`}><span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></span>{isPlaying ? t.live : t.paused}</span>}</div></div>
                </>
            ) : <div className="text-slate-500 text-xs flex items-center gap-2"><Radio className="w-4 h-4"/> {appLang === 'TR' ? 'İstasyon seçin...' : 'Select station...'}</div>}
         </div>
         <div className="w-1/3 flex justify-center gap-4 sm:gap-6 items-center">
             <button className="text-slate-500 hover:text-white transition"><SkipBack className="w-5 h-5"/></button>
             <button onClick={() => { if (currentStation) { if (isPlaying) { audioRef.current.pause(); } else { if (audioRef.current.error) { audioRef.current.load(); } audioRef.current.play().catch(e => { console.error(e); }); } } }} disabled={!currentStation || isBuffering} className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${!currentStation ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 text-white hover:scale-105 hover:bg-indigo-500'}`}>{isBuffering ? <Loader2 className="w-6 h-6 animate-spin"/> : (isPlaying ? <Pause className="w-5 h-5 fill-current"/> : <Play className="w-5 h-5 fill-current ml-1"/>)}</button>
             <button className="text-slate-500 hover:text-white transition"><SkipForward className="w-5 h-5"/></button>
         </div>
         <div className="w-1/3 flex justify-end items-center gap-3"><button onClick={() => setVolume(v => v === 0 ? 0.8 : 0)} className="text-slate-400 hover:text-white transition hidden sm:block">{volume === 0 ? <VolumeX className="w-5 h-5"/> : <Volume2 className="w-5 h-5"/>}</button><input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-20 sm:w-28 h-1 bg-slate-700 rounded-full cursor-pointer accent-indigo-500" /></div>
      </div>
    </div>
  );
}