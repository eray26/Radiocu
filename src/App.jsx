import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { X, Shield, Settings, Trash2, Ban } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

// Components
import Header from './components/Header';
import PlayerBar from './components/PlayerBar';

// Pages
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import FavoritesPage from './pages/FavoritesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';

// --- FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyDlXxF8mKj3ahMvXqPwmSWE0GlB7EC5w6I",
    authDomain: "radiocu-com.firebaseapp.com",
    projectId: "radiocu-com",
    storageBucket: "radiocu-com.firebasestorage.app",
    messagingSenderId: "838585565724",
    appId: "1:838585565724:web:c60a08c1d75fc04c6295d9",
    measurementId: "G-K7D85VHH4V"
};

let db, auth;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
} catch (e) {
    console.warn("Firebase hatası:", e);
}

// --- ÜLKE -> DİL EŞLEŞTİRME ---
const COUNTRY_LANG_MAP = {
    'TR': 'TR', 'AZ': 'AZ',
    'US': 'EN', 'GB': 'EN', 'CA': 'EN', 'AU': 'EN',
    'DE': 'DE', 'AT': 'DE', 'CH': 'DE',
    'FR': 'FR', 'BE': 'FR',
    'ES': 'ES', 'MX': 'ES', 'AR': 'ES',
    'IT': 'IT', 'NL': 'NL',
    'BR': 'PT', 'PT': 'PT',
    'RU': 'RU', 'UA': 'RU', 'KZ': 'RU',
    'CN': 'ZH', 'SG': 'ZH', 'TW': 'ZH',
    'IN': 'HI', 'JP': 'JA', 'KR': 'KO',
    'SA': 'AR', 'AE': 'AR', 'EG': 'AR'
};

const TRANSLATIONS = {
    TR: { code: "tr", errorMsg: "Liste alınamadı.", playingError: "Yayın açılmadı." },
    EN: { code: "en", errorMsg: "Failed to load.", playingError: "Stream failed." },
    DE: { code: "de", errorMsg: "Fehler.", playingError: "Fehler." },
};

// --- VIP LİSTESİ ---
const VIP_STATIONS_DEFAULT = {
    TR: [
        { name: "TRT Radyo 1", url: "https://trthls.cdn.radyotvonline.com/trthls/trks_radyo1.smil/playlist.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/TRT_Radyo_1.svg/1200px-TRT_Radyo_1.svg.png", site: "trt.net.tr", tag: "news" },
        { name: "TRT FM", url: "https://trthls.cdn.radyotvonline.com/trthls/trks_trtfm.smil/playlist.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/TRT_FM_logo.svg/1200px-TRT_FM_logo.svg.png", site: "trt.net.tr", tag: "pop" }
    ]
};

// --- ÜLKE LİSTESİ ---
const DEFAULT_COUNTRIES = [
    { code: 'TR', name: 'Türkiye', flag: '🇹🇷' }, { code: 'DE', name: 'Deutschland', flag: '🇩🇪' },
    { code: 'US', name: 'USA', flag: '🇺🇸' }, { code: 'GB', name: 'UK', flag: '🇬🇧' },
    { code: 'FR', name: 'France', flag: '🇫🇷' }, { code: 'IT', name: 'Italia', flag: '🇮🇹' },
    { code: 'ES', name: 'España', flag: '🇪🇸' }, { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'AZ', name: 'Azerbaycan', flag: '🇦🇿' }, { code: 'RU', name: 'Russia', flag: '🇷🇺' },
    { code: 'BR', name: 'Brasil', flag: '🇧🇷' }, { code: 'CN', name: 'China', flag: '🇨🇳' },
    { code: 'IN', name: 'India', flag: '🇮🇳' }, { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'KR', name: 'Korea', flag: '🇰🇷' }, { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' }
];

const API_MIRRORS = ["https://at1.api.radio-browser.info", "https://de1.api.radio-browser.info"];
const GENRES = ['all', 'pop', 'rock', 'jazz', 'news', 'classical', 'dance', 'folk', 'rap', 'arabesque'];

// --- ÇEREZ UYARISI ---
const CookieConsent = () => {
    const [show, setShow] = useState(() => !localStorage.getItem('cookie_consent'));
    
    if (!show) return null;
    return (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 glass-card p-4 rounded-2xl border border-white/10 shadow-2xl animate-slide-up">
            <p className="text-xs text-slate-300 mb-3">
                🍪 Bu site çerezleri kullanır. Devam ederek çerez kullanımını kabul etmiş olursunuz.
            </p>
            <button onClick={() => { localStorage.setItem('cookie_consent', 'true'); setShow(false); }} className="w-full bg-teal-600 hover:bg-teal-500 text-white py-2 rounded-xl text-xs font-bold transition">
                Kabul Et
            </button>
        </div>
    );
};

// --- ADMİN PANELİ MODALI ---
const AdminModal = ({ isOpen, onClose, user, countries }) => {
    const [activeTab, setActiveTab] = useState('stations');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newStation, setNewStation] = useState({ name: '', url: '', logo: '', country: 'TR', tag: '' });
    const [newCountry, setNewCountry] = useState({ code: '', name: '', flag: '' });
    const [dbStations, setDbStations] = useState([]);
    const [msg, setMsg] = useState('');
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        let isMounted = true;
        if (user && isOpen && db) {
            const fetchDb = async () => {
                try {
                    const q = query(collection(db, "stations"));
                    const snap = await getDocs(q);
                    if (isMounted) setDbStations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                } catch (e) { console.error(e); }
            };
            fetchDb();
        }
        return () => { isMounted = false; };
    }, [user, isOpen]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!auth) { setMsg("Veritabanı bağlantısı yok."); return; }
        try { await signInWithEmailAndPassword(auth, email, password); setMsg(""); } catch { setMsg("Giriş başarısız."); }
    };
    const handleStationSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) { await updateDoc(doc(db, "stations", editingId), newStation); setMsg("Güncellendi."); }
            else { await addDoc(collection(db, "stations"), newStation); setMsg("Eklendi."); }
            setNewStation({ name: '', url: '', logo: '', country: 'TR', tag: '' });
            setEditingId(null);
        } catch (e) { setMsg("Hata: " + e.message); }
    };
    const handleStationDelete = async (id) => { if (window.confirm("Silinsin mi?")) { await deleteDoc(doc(db, "stations", id)); setMsg("Silindi."); } };
    const handleStationEdit = (s) => { setNewStation(s); setEditingId(s.id); };
    const handleCountrySubmit = async (e) => {
        e.preventDefault();
        try { await addDoc(collection(db, "countries"), newCountry); setMsg("Ülke eklendi!"); setNewCountry({ code: '', name: '', flag: '' }); } catch (e) { setMsg("Hata: " + e.message); }
    };
    const handleCountryDelete = async (id) => { if (window.confirm("Emin misiniz?")) { await deleteDoc(doc(db, "countries", id)); setMsg("Ülke silindi."); } };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X /></button>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Shield className="text-teal-500" /> Yönetici</h2>
                {!user ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input type="email" placeholder="E-posta" className="w-full bg-gray-800 p-3 rounded-xl text-white border border-white/10" value={email} onChange={e => setEmail(e.target.value)} />
                        <input type="password" placeholder="Şifre" className="w-full bg-gray-800 p-3 rounded-xl text-white border border-white/10" value={password} onChange={e => setPassword(e.target.value)} />
                        <button type="submit" className="w-full bg-teal-600 text-white p-3 rounded-xl font-bold">Giriş Yap</button>
                        {msg && <p className="text-red-400 text-sm text-center">{msg}</p>}
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="flex border-b border-white/10">
                            <button onClick={() => setActiveTab('stations')} className={`flex-1 pb-2 text-sm font-bold ${activeTab === 'stations' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-slate-500'}`}>Radyolar</button>
                            <button onClick={() => setActiveTab('countries')} className={`flex-1 pb-2 text-sm font-bold ${activeTab === 'countries' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-slate-500'}`}>Ülkeler</button>
                        </div>
                        {activeTab === 'stations' && (
                            <>
                                <div className={`p-4 rounded-xl border ${editingId ? 'bg-teal-900/20 border-teal-500/50' : 'bg-gray-800/50 border-white/5'}`}>
                                    <h3 className="text-sm font-bold text-white mb-3">{editingId ? "Düzenle" : "Yeni Ekle"}</h3>
                                    <form onSubmit={handleStationSubmit} className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <input type="text" placeholder="Ad" className="bg-gray-900 p-2 rounded-lg text-white text-sm border border-white/10" value={newStation.name} onChange={e => setNewStation({ ...newStation, name: e.target.value })} required />
                                            <select className="bg-gray-900 p-2 rounded-lg text-white text-sm border border-white/10" value={newStation.country} onChange={e => setNewStation({ ...newStation, country: e.target.value })}>{countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}</select>
                                        </div>
                                        <input type="url" placeholder="Link (HTTPS)" className="w-full bg-gray-900 p-2 rounded-lg text-white text-sm border border-white/10" value={newStation.url} onChange={e => setNewStation({ ...newStation, url: e.target.value })} required />
                                        <input type="url" placeholder="Logo Linki" className="w-full bg-gray-900 p-2 rounded-lg text-white text-sm border border-white/10" value={newStation.logo} onChange={e => setNewStation({ ...newStation, logo: e.target.value })} />
                                        <div className="flex gap-2">
                                            <button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-500 text-white p-2 rounded-lg text-sm font-bold">{editingId ? "Güncelle" : "Kaydet"}</button>
                                            {editingId && <button type="button" onClick={() => { setEditingId(null); setNewStation({ name: '', url: '', logo: '', country: 'TR', tag: '' }) }} className="px-3 bg-gray-700 text-white rounded-lg"><Ban className="w-4 h-4" /></button>}
                                        </div>
                                    </form>
                                </div>
                                <div className="max-h-40 overflow-y-auto">
                                    {dbStations.map(s => (
                                        <div key={s.id} className="flex justify-between items-center p-2 hover:bg-gray-800 rounded border-b border-gray-800/50 group">
                                            <span className="text-xs text-white truncate w-2/3">{s.name} ({s.country})</span>
                                            <div className="flex gap-1 opacity-60 group-hover:opacity-100">
                                                <button onClick={() => handleStationEdit(s)} className="p-1 text-yellow-400 hover:bg-gray-700 rounded"><Settings className="w-3 h-3" /></button>
                                                <button onClick={() => handleStationDelete(s.id)} className="p-1 text-red-400 hover:bg-gray-700 rounded"><Trash2 className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {activeTab === 'countries' && (
                            <>
                                <div className="p-4 bg-gray-800/50 rounded-xl border border-white/5">
                                    <form onSubmit={handleCountrySubmit} className="space-y-3">
                                        <div className="grid grid-cols-3 gap-2">
                                            <input type="text" placeholder="Kod (FR)" className="bg-gray-900 p-2 rounded-lg text-white text-sm border border-white/10" value={newCountry.code} onChange={e => setNewCountry({ ...newCountry, code: e.target.value.toUpperCase() })} required maxLength={2} />
                                            <input type="text" placeholder="Ad" className="bg-gray-900 p-2 rounded-lg text-white text-sm border border-white/10 col-span-2" value={newCountry.name} onChange={e => setNewCountry({ ...newCountry, name: e.target.value })} required />
                                        </div>
                                        <input type="text" placeholder="Bayrak (🇫🇷)" className="w-full bg-gray-900 p-2 rounded-lg text-white text-sm border border-white/10" value={newCountry.flag} onChange={e => setNewCountry({ ...newCountry, flag: e.target.value })} required />
                                        <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white p-2 rounded-lg text-sm font-bold">Ekle</button>
                                    </form>
                                </div>
                                <div className="max-h-40 overflow-y-auto">
                                    {countries.map(c => (
                                        <div key={c.id || c.code} className="flex justify-between items-center p-2 hover:bg-gray-800 rounded border-b border-gray-800/50">
                                            <span className="text-xs text-white">{c.flag} {c.name} ({c.code})</span>
                                            {c.id && <button onClick={() => handleCountryDelete(c.id)} className="text-red-400 hover:bg-gray-700 p-1 rounded"><Trash2 className="w-3 h-3" /></button>}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {msg && <p className="text-teal-400 text-xs text-center">{msg}</p>}
                        <button onClick={() => signOut(auth)} className="w-full p-2 text-slate-500 hover:text-white text-sm">Çıkış</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN APP (Router Shell) ---
export default function App() {
    return (
        <Routes>
            <Route path="/:countryCode/search" element={<RadioApp page="search" />} />
            <Route path="/:countryCode/favorites" element={<RadioApp page="favorites" />} />
            <Route path="/:countryCode/about" element={<RadioApp page="about" />} />
            <Route path="/:countryCode/contact" element={<RadioApp page="contact" />} />
            <Route path="/:countryCode/privacy" element={<RadioApp page="privacy" />} />
            <Route path="/:countryCode" element={<RadioApp page="home" />} />
            <Route path="/" element={<RadioApp page="home" />} />
        </Routes>
    );
}

function RadioApp({ page }) {
    const { countryCode: urlCountryCode } = useParams();
    const navigate = useNavigate();

    // --- STATE ---
    const [countriesList, setCountriesList] = useState(DEFAULT_COUNTRIES);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState('TR');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [appLang, setAppLang] = useState('EN');
    const [autoLocated, setAutoLocated] = useState(false);
    const [currentStation, setCurrentStation] = useState(null);
    const currentStationRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('rs_volume')) || 0.8);
    const [error, setError] = useState(null);
    const audioRef = useRef(new Audio());
    const [showAdmin, setShowAdmin] = useState(false);
    const [user, setUser] = useState(null);

    // --- FAVORITES (localStorage) ---
    const [favorites, setFavorites] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('rs_favorites') || '[]');
        } catch { return []; }
    });

    const toggleFavorite = useCallback((station) => {
        setFavorites(prev => {
            const exists = prev.some(f => f.stationuuid === station.stationuuid);
            const next = exists
                ? prev.filter(f => f.stationuuid !== station.stationuuid)
                : [...prev, { ...station, countrycode: selectedCountry }];
            localStorage.setItem('rs_favorites', JSON.stringify(next));
            return next;
        });
    }, [selectedCountry]);

    const clearFavorites = useCallback(() => {
        setFavorites([]);
        localStorage.removeItem('rs_favorites');
    }, []);

    const t = TRANSLATIONS[appLang] || TRANSLATIONS['EN'];

    // --- AUTH ---
    useEffect(() => { if (auth) return onAuthStateChanged(auth, (u) => setUser(u)); }, []);

    // --- FETCH COUNTRIES ---
    useEffect(() => {
        const fetchCountries = async () => {
            if (db) {
                try {
                    const q = query(collection(db, "countries"), orderBy("name"));
                    const snapshot = await getDocs(q);
                    if (!snapshot.empty) {
                        const dynamicCountries = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                        const combined = [...DEFAULT_COUNTRIES, ...dynamicCountries.filter(dc => !DEFAULT_COUNTRIES.some(def => def.code === dc.code))];
                        setCountriesList(combined);
                    }
                } catch (e) { console.error("Ülke çekme hatası", e); }
            }
        };
        fetchCountries();
    }, [showAdmin]);

    // --- FETCH STATIONS ---
    const fetchWithFailover = useCallback(async (countryCode) => {
        setLoading(true); setError(null);
        const cacheKey = `rs_stations_${countryCode}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Date.now() - parsed.timestamp < 3600000) {
                    setStations(parsed.data);
                    setLoading(false);
                    return;
                }
            } catch { localStorage.removeItem(cacheKey); }
        }

        let data = [];
        let manualStations = [];
        if (db) {
            try {
                const q = query(collection(db, "stations"));
                const snapshot = await getDocs(q);
                manualStations = snapshot.docs
                    .map(d => ({ ...d.data(), stationuuid: d.id, is_manual: true }))
                    .filter(s => s.country === countryCode);
            } catch (e) { console.error(e); }
        }

        if (manualStations.length === 0) {
            const hardcoded = VIP_STATIONS_DEFAULT[countryCode] || [];
            manualStations = hardcoded.map(s => ({ stationuuid: `manual-${s.name}`, name: s.name, url_resolved: s.url, favicon: s.logo, homepage: s.site, tags: s.tag, is_manual: true }));
        }

        for (const server of API_MIRRORS) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3500);
                const res = await fetch(`${server}/json/stations/bycountrycodeexact/${countryCode}?limit=200&order=votes&reverse=true`, { signal: controller.signal });
                clearTimeout(timeoutId);
                if (res.ok) { data = await res.json(); break; }
            } catch { /* ignore */ }
        }

        let cleanApiData = data.filter(s => s.url_resolved && s.name.trim().length > 0 && !s.name.toLowerCase().includes("test") && s.url_resolved.startsWith("https") && !s.url_resolved.includes(".m3u8"));
        cleanApiData = cleanApiData.filter(s => !manualStations.some(m => m.name.toLowerCase() === s.name.toLowerCase()));

        const finalData = [...manualStations, ...cleanApiData];
        if (finalData.length > 0) {
            setStations(finalData);
            localStorage.setItem(cacheKey, JSON.stringify({ data: finalData, timestamp: Date.now() }));
        } else { setError(t.errorMsg); }
        setLoading(false);
    }, [t.errorMsg]);

    // --- INIT APP ---
    useEffect(() => {
        const initApp = async () => {
            audioRef.current.crossOrigin = "anonymous";
            const browserLang = navigator.language.split('-')[0].toUpperCase();

            if (urlCountryCode) {
                const upperCode = urlCountryCode.toUpperCase();
                if (countriesList.find(c => c.code === upperCode)) {
                    setSelectedCountry(upperCode);
                    setAppLang(COUNTRY_LANG_MAP[upperCode] || (TRANSLATIONS[browserLang] ? browserLang : 'EN'));
                    return;
                }
            }

            try {
                const ipCache = localStorage.getItem('rs_user_country');
                let code = null;
                if (ipCache) {
                    const parsed = JSON.parse(ipCache);
                    if (Date.now() - parsed.timestamp < 86400000) code = parsed.code;
                }
                if (!code) {
                    const res = await fetch("https://ipapi.co/json/");
                    const data = await res.json();
                    if (data?.country_code) {
                        code = data.country_code;
                        localStorage.setItem('rs_user_country', JSON.stringify({ code, timestamp: Date.now() }));
                    }
                }
                if (code) {
                    if (countriesList.find(c => c.code === code)) {
                        setSelectedCountry(code);
                        setAutoLocated(true);
                        navigate(`/${code.toLowerCase()}/`, { replace: true });
                    }
                    setAppLang(COUNTRY_LANG_MAP[code] || (TRANSLATIONS[browserLang] ? browserLang : 'EN'));
                }
            } catch {
                setAppLang(TRANSLATIONS[browserLang] ? browserLang : 'EN');
            }
        };
        initApp();

        const audio = audioRef.current;
        const onWaiting = () => setIsBuffering(true);
        const onPlaying = () => { setIsBuffering(false); setIsPlaying(true); setError(null); };
        const onPause = () => setIsPlaying(false);
        const onError = () => { setIsBuffering(false); setIsPlaying(false); setError(t.playingError); };
        audio.addEventListener('waiting', onWaiting);
        audio.addEventListener('playing', onPlaying);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('error', onError);
        return () => { audio.removeEventListener('waiting', onWaiting); audio.removeEventListener('playing', onPlaying); audio.removeEventListener('pause', onPause); audio.removeEventListener('error', onError); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [countriesList, t.playingError, urlCountryCode]);

    useEffect(() => { fetchWithFailover(selectedCountry); }, [selectedCountry, fetchWithFailover]);

    // --- PLAYER ---
    const playStation = useCallback((station) => {
        setCurrentStation(station);
        if (station) {
            setIsBuffering(true);
            setError(null);
            let streamUrl = station.url_resolved || station.url;
            if (streamUrl && streamUrl.startsWith('http://')) streamUrl = streamUrl.replace('http://', 'https://');
            audioRef.current.src = streamUrl;
            audioRef.current.load();
            audioRef.current.play().catch(err => {
                if (err.name !== 'AbortError') { setIsBuffering(false); setIsPlaying(false); }
            });
        } else { setIsPlaying(false); setIsBuffering(false); }
    }, []);

    useEffect(() => { currentStationRef.current = currentStation; }, [currentStation]);
    useEffect(() => { if (isPlaying) audioRef.current.play().catch(() => { }); else audioRef.current.pause(); }, [isPlaying]);
    useEffect(() => { audioRef.current.volume = volume; localStorage.setItem('rs_volume', volume); }, [volume]);

    const handlePlayPause = useCallback(() => {
        if (currentStation) {
            if (isPlaying) audioRef.current.pause();
            else {
                if (audioRef.current.error) audioRef.current.load();
                audioRef.current.play().catch(console.error);
            }
        }
    }, [currentStation, isPlaying]);

    // --- FILTERS ---
    const filteredStations = useMemo(() => stations.filter(s => {
        const q = searchQuery.toLowerCase();
        return (s.name.toLowerCase().includes(q) || s.tags?.toLowerCase().includes(q));
    }), [stations, searchQuery]);

    // --- COUNTRY CHANGE ---
    const handleCountryChange = useCallback((code) => {
        setSelectedCountry(code);
        const lang = COUNTRY_LANG_MAP[code];
        if (lang) setAppLang(lang);
        // Navigate preserving current page
        const suffix = page === 'search' ? '/search' : page === 'favorites' ? '/favorites' : '';
        navigate(`/${code.toLowerCase()}${suffix}`, { replace: false });
        // Google Analytics
        if (window.gtag) window.gtag('event', 'page_view', { page_path: `/${code.toLowerCase()}${suffix}` });
    }, [navigate, page]);

    // --- RENDER ---
    return (
        <div className="flex flex-col h-screen bg-gray-950 text-white overflow-hidden">
            <Header
                countriesList={countriesList}
                selectedCountry={selectedCountry}
                onCountryChange={handleCountryChange}
                autoLocated={autoLocated}
                appLang={appLang}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                showSearch={page === 'search'}
            />

            <div className="flex-1 overflow-y-auto pb-20 bg-atmosphere">
                {page === 'home' && (
                    <HomePage
                        stations={stations}
                        filteredStations={filteredStations}
                        loading={loading}
                        error={error}
                        selectedCountry={selectedCountry}
                        countriesList={countriesList}
                        currentStation={currentStation}
                        isPlaying={isPlaying}
                        favorites={favorites}
                        appLang={appLang}
                        autoLocated={autoLocated}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        onPlayStation={playStation}
                        onToggleFavorite={toggleFavorite}
                        onRefresh={() => fetchWithFailover(selectedCountry)}
                        onOpenAdmin={() => setShowAdmin(true)}
                        genres={GENRES}
                        selectedGenre={selectedGenre}
                        setSelectedGenre={setSelectedGenre}
                    />
                )}
                {page === 'search' && (
                    <SearchPage
                        filteredStations={filteredStations}
                        loading={loading}
                        selectedCountry={selectedCountry}
                        currentStation={currentStation}
                        isPlaying={isPlaying}
                        favorites={favorites}
                        appLang={appLang}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        onPlayStation={playStation}
                        onToggleFavorite={toggleFavorite}
                        genres={GENRES}
                        onOpenAdmin={() => setShowAdmin(true)}
                    />
                )}
                {page === 'favorites' && (
                    <FavoritesPage
                        favorites={favorites}
                        currentStation={currentStation}
                        isPlaying={isPlaying}
                        appLang={appLang}
                        onPlayStation={playStation}
                        onToggleFavorite={toggleFavorite}
                        onClearFavorites={clearFavorites}
                        selectedCountry={selectedCountry}
                        onOpenAdmin={() => setShowAdmin(true)}
                    />
                )}
                {page === 'about' && (
                    <AboutPage appLang={appLang} onOpenAdmin={() => setShowAdmin(true)} />
                )}
                {page === 'contact' && (
                    <ContactPage appLang={appLang} onOpenAdmin={() => setShowAdmin(true)} />
                )}
                {page === 'privacy' && (
                    <PrivacyPage appLang={appLang} onOpenAdmin={() => setShowAdmin(true)} />
                )}
            </div>

            {showAdmin && <AdminModal isOpen={showAdmin} onClose={() => setShowAdmin(false)} user={user} countries={countriesList} />}
            <CookieConsent />

            <PlayerBar
                currentStation={currentStation}
                isPlaying={isPlaying}
                isBuffering={isBuffering}
                volume={volume}
                setVolume={setVolume}
                onPlayPause={handlePlayPause}
                onNext={() => {
                    const idx = filteredStations.findIndex(s => s.stationuuid === currentStation?.stationuuid);
                    if (idx >= 0 && idx < filteredStations.length - 1) playStation(filteredStations[idx + 1]);
                }}
                onPrev={() => {
                    const idx = filteredStations.findIndex(s => s.stationuuid === currentStation?.stationuuid);
                    if (idx > 0) playStation(filteredStations[idx - 1]);
                }}
                appLang={appLang}
            />
        </div>
    );
}