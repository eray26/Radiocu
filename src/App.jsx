import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { X, Shield, Trash2, Ban, PencilLine } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

// Components (always needed)
import Header from './components/Header';
import PlayerBar from './components/PlayerBar';

// Pages — lazy loaded to reduce initial bundle
const HomePage = lazy(() => import('./pages/HomePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const StationPage = lazy(() => import('./pages/StationPage'));

// Slug helper
const toSlug = (name) => name
    .toLowerCase()
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
    .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

// Suspense fallback
const PageLoader = () => (
    <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#ff7eeb] border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-400 text-sm">Yükleniyor...</span>
        </div>
    </div>
);


// --- FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyC2D7XXawsp9QapGKZx86QO2sdbvqhwVow",
    authDomain: "radiocu-5be49.firebaseapp.com",
    projectId: "radiocu-5be49",
    storageBucket: "radiocu-5be49.firebasestorage.app",
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

// --- API TAB (ayrı component: hooks kuralı) ---
const ApiTabContent = ({ countries, blockedIds, onBlockStation, onUnblockStation }) => {
    const [apiSearch, setApiSearch] = useState('');
    const [apiCountry, setApiCountry] = useState('TR');
    const [apiStations, setApiStations] = useState([]);
    const [apiLoading, setApiLoading] = useState(false);

    const fetchApiStations = useCallback(async (countryCode) => {
        setApiLoading(true);
        setApiStations([]);
        for (const mirror of API_MIRRORS) {
            try {
                const res = await fetch(`${mirror}/json/stations/bycountrycodeexact/${countryCode}?limit=100&order=votes&reverse=true&hidebroken=true`);
                if (res.ok) {
                    const data = await res.json();
                    setApiStations(data.filter(s => s.url_resolved));
                    break;
                }
            } catch { continue; }
        }
        setApiLoading(false);
    }, []);

    useEffect(() => { fetchApiStations(apiCountry); }, [apiCountry, fetchApiStations]);

    const apiFiltered = apiSearch
        ? apiStations.filter(s => s.name.toLowerCase().includes(apiSearch.toLowerCase()))
        : apiStations;

    return (
        <div className="space-y-3">
            <div className="text-xs text-slate-400 bg-blue-950/30 border border-blue-900/30 rounded-xl p-3">
                🌐 API radyolarına ülke seçerek göz atın. <strong className="text-blue-400">Gizle</strong> ile sitede gösterilmesini engelleyebilirsiniz.
            </div>
            <div className="flex gap-2">
                <select value={apiCountry} onChange={e => setApiCountry(e.target.value)}
                    className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:border-teal-500 outline-none flex-1">
                    {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                </select>
                <button onClick={() => fetchApiStations(apiCountry)} className="px-3 py-2 bg-teal-900/30 text-teal-400 rounded-lg text-xs border border-teal-700/30 hover:bg-teal-900/50 transition">↻</button>
            </div>
            <input type="text" placeholder="Radyo ara..." value={apiSearch} onChange={e => setApiSearch(e.target.value)}
                className="w-full bg-gray-800 p-2.5 rounded-lg text-white text-sm border border-white/10 focus:border-teal-500 outline-none" />
            {apiLoading ? (
                <div className="text-center py-6 text-slate-500 text-sm">Yükleniyor...</div>
            ) : (
                <>
                    <p className="text-xs text-slate-500">{apiFiltered.length} radyo</p>
                    <div className="space-y-2">
                        {apiFiltered.slice(0, 50).map(s => {
                            const isBlocked = blockedIds.includes(s.stationuuid);
                            return (
                                <div key={s.stationuuid} className={`flex items-center gap-3 p-3 rounded-xl border transition ${isBlocked ? 'bg-red-950/20 border-red-900/30 opacity-60' : 'bg-gray-800/50 border-white/5 hover:border-white/10'}`}>
                                    {s.favicon ? <img src={s.favicon} alt="" className="w-8 h-8 rounded-lg object-cover bg-gray-700 shrink-0" onError={e => e.target.style.display = 'none'} /> : <div className="w-8 h-8 rounded-lg bg-gray-700 shrink-0 flex items-center justify-center text-xs">📻</div>}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            {isBlocked
                                                ? <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-900/60 text-red-400 border border-red-700/30">Gizlendi</span>
                                                : <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-400 border border-blue-700/30">API</span>}
                                        </div>
                                        <p className="text-white text-sm font-medium truncate">{s.name}</p>
                                        <p className="text-slate-500 text-xs truncate">{s.countrycode}{s.tags ? ` • ${s.tags.split(',')[0]}` : ''}</p>
                                    </div>
                                    <button onClick={() => isBlocked ? onUnblockStation(s.stationuuid) : onBlockStation(s)}
                                        className={`px-2 py-1 rounded-lg text-xs font-bold transition shrink-0 ${isBlocked ? 'text-green-400 hover:bg-green-400/10' : 'text-red-400 hover:bg-red-400/10'}`}>
                                        {isBlocked ? '✓ Göster' : '🚫 Gizle'}
                                    </button>
                                </div>
                            );
                        })}
                        {apiFiltered.length > 50 && <p className="text-xs text-slate-500 text-center">Daha fazlası için arama yapın ({apiFiltered.length - 50} daha var)</p>}
                    </div>
                </>
            )}
        </div>
    );
};

// --- ADMİN PANELİ MODALI ---
const AdminModal = ({ isOpen, onClose, user, countries, allStations = [], blockedIds = [], onBlockStation, onUnblockStation }) => {
    const [activeTab, setActiveTab] = useState('list');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newStation, setNewStation] = useState({ name: '', url: '', logo: '', country: 'TR', tag: '', slug: '', seoTitle: '', seoDescription: '', seoKeywords: '' });
    const [newCountry, setNewCountry] = useState({ code: '', name: '', flag: '' });
    const [dbStations, setDbStations] = useState([]);
    const [msg, setMsg] = useState('');
    const [msgType, setMsgType] = useState('success');
    const [editingId, setEditingId] = useState(null);
    const [filterCountry, setFilterCountry] = useState('ALL');
    const [loading, setLoading] = useState(false);

    const showMsg = (text, type = 'success') => { setMsg(text); setMsgType(type); setTimeout(() => setMsg(''), 3000); };

    const fetchStations = async () => {
        if (!user || !db) return;
        setLoading(true);
        try {
            const q = query(collection(db, "stations"));
            const snap = await getDocs(q);
            setDbStations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => {
        if (user && isOpen) fetchStations();
    }, [user, isOpen]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!auth) { showMsg("Veritabanı bağlantısı yok.", 'error'); return; }
        try { await signInWithEmailAndPassword(auth, email, password); showMsg("Giriş yapıldı!"); } catch (err) {
            console.error("Firebase auth error:", err.code, err.message);
            showMsg("Hata: " + err.code, 'error');
        }
    };

    const handleStationSubmit = async (e) => {
        e.preventDefault();
        try {
            const slug = newStation.slug || toSlug(newStation.name);
            const stationData = { ...newStation, slug, is_manual: true };
            if (editingId) {
                await updateDoc(doc(db, "stations", editingId), stationData);
                showMsg("✅ Güncellendi.");
            } else {
                await addDoc(collection(db, "stations"), stationData);
                showMsg("✅ Radyo eklendi.");
            }
            setNewStation({ name: '', url: '', logo: '', country: 'TR', tag: '', slug: '', seoTitle: '', seoDescription: '', seoKeywords: '' });
            setEditingId(null);
            fetchStations();
            setActiveTab('list');
        } catch (e) { showMsg("Hata: " + e.message, 'error'); }
    };

    const handleStationDelete = async (id, name) => {
        if (window.confirm(`"${name}" silinsin mi?`)) {
            await deleteDoc(doc(db, "stations", id));
            showMsg("🗑️ Silindi.");
            fetchStations();
        }
    };

    const handleStationEdit = (s) => {
        setNewStation({
            name: s.name, url: s.url, logo: s.logo || '', country: s.country || 'TR', tag: s.tag || '',
            slug: s.slug || toSlug(s.name),
            seoTitle: s.seoTitle || '', seoDescription: s.seoDescription || '', seoKeywords: s.seoKeywords || ''
        });
        setEditingId(s.id);
        setActiveTab('add');
    };

    const handleCountrySubmit = async (e) => {
        e.preventDefault();
        try { await addDoc(collection(db, "countries"), newCountry); showMsg("Ülke eklendi!"); setNewCountry({ code: '', name: '', flag: '' }); } catch (e) { showMsg("Hata: " + e.message, 'error'); }
    };
    const handleCountryDelete = async (id) => { if (window.confirm("Emin misiniz?")) { await deleteDoc(doc(db, "countries", id)); showMsg("Ülke silindi."); } };

    const filteredStations = filterCountry === 'ALL' ? dbStations : dbStations.filter(s => s.country === filterCountry);
    const stationCountries = [...new Set(dbStations.map(s => s.country).filter(Boolean))].sort();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2 md:p-4 overflow-y-auto">
            <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl relative flex flex-col max-h-[95vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Shield className="text-teal-500 w-5 h-5" /> Yönetici Paneli
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"><X className="w-5 h-5" /></button>
                </div>

                {!user ? (
                    <form onSubmit={handleLogin} className="p-6 space-y-4">
                        <input type="email" placeholder="E-posta" className="w-full bg-gray-800 p-3 rounded-xl text-white border border-white/10 focus:border-teal-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} />
                        <input type="password" placeholder="Şifre" className="w-full bg-gray-800 p-3 rounded-xl text-white border border-white/10 focus:border-teal-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} />
                        <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white p-3 rounded-xl font-bold transition">Giriş Yap</button>
                        {msg && <p className="text-red-400 text-sm text-center">{msg}</p>}
                    </form>
                ) : (
                    <div className="flex flex-col flex-1 overflow-hidden">
                        {/* Tabs */}
                        <div className="flex border-b border-white/10 shrink-0 px-2">
                            {[['list', '📋 Manuel'], ['api', '🌐 API'], ['add', editingId ? '✏️ Düzenle' : '➕ Ekle'], ['countries', '🌍 Ülkeler']].map(([key, label]) => (
                                <button key={key} onClick={() => { setActiveTab(key); if (key !== 'add') { setEditingId(null); setNewStation({ name: '', url: '', logo: '', country: 'TR', tag: '' }); } }}
                                    className={`flex-1 py-3 text-[11px] font-bold transition-colors ${activeTab === key ? 'text-teal-400 border-b-2 border-teal-400' : 'text-slate-500 hover:text-slate-300'}`}>
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* STATIONS LIST TAB */}
                            {activeTab === 'list' && (
                                <>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <div className="flex-1 text-sm text-slate-400">
                                            <span className="text-white font-bold">{dbStations.length}</span> manuel •
                                            <span className="text-red-400 font-bold ml-1">{blockedIds.length}</span> gizlenmiş
                                        </div>
                                        <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
                                            className="bg-gray-800 text-white text-xs rounded-lg px-3 py-1.5 border border-white/10 focus:border-teal-500 outline-none">
                                            <option value="ALL">🌍 Tüm Ülkeler</option>
                                            {stationCountries.map(c => {
                                                const country = countries.find(co => co.code === c);
                                                return <option key={c} value={c}>{country?.flag || ''} {country?.name || c} ({dbStations.filter(s => s.country === c).length})</option>;
                                            })}
                                        </select>
                                        <button onClick={fetchStations} className="text-xs text-teal-400 hover:text-teal-300 px-2 py-1.5 bg-teal-900/20 rounded-lg border border-teal-600/20">
                                            ↻ Yenile
                                        </button>
                                    </div>

                                    {/* Manuel Stations */}
                                    {loading ? (
                                        <div className="text-center py-8 text-slate-500 text-sm">Yükleniyor...</div>
                                    ) : (
                                        <div className="space-y-2">
                                            {filteredStations.length === 0 && blockedIds.length === 0 && (
                                                <div className="text-center py-4 text-slate-500 text-sm">Kayıt bulunamadı.</div>
                                            )}

                                            {/* Manuel radyolar (Firebase) */}
                                            {filteredStations.map(s => {
                                                const country = countries.find(c => c.code === s.country);
                                                return (
                                                    <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-white/5 hover:border-white/10 transition group">
                                                        {s.logo ? <img src={s.logo} alt="" className="w-8 h-8 rounded-lg object-cover bg-gray-700 shrink-0" onError={e => e.target.style.display='none'} /> : <div className="w-8 h-8 rounded-lg bg-gray-700 shrink-0 flex items-center justify-center text-xs">📻</div>}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-400 border border-emerald-700/30">Manuel</span>
                                                            </div>
                                                            <p className="text-white text-sm font-medium truncate">{s.name}</p>
                                                            <p className="text-slate-500 text-xs truncate">{country?.flag} {country?.name || s.country} {s.tag ? `• ${s.tag}` : ''}</p>
                                                        </div>
                                                        <div className="flex gap-1 shrink-0">
                                                            <button onClick={() => handleStationEdit(s)} className="p-1.5 text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition" title="Düzenle">
                                                                <PencilLine className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button onClick={() => handleStationDelete(s.id, s.name)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition" title="Sil">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Gizlenmiş API radyoları */}
                                            {blockedIds.length > 0 && (
                                                <>
                                                    <p className="text-xs text-slate-500 pt-2 font-bold uppercase tracking-wider">🚫 Gizlenmiş API Radyoları</p>
                                                    {allStations.filter(s => !s.is_manual && blockedIds.includes(s.stationuuid)).map(s => (
                                                        <div key={s.stationuuid} className="flex items-center gap-3 p-3 bg-red-950/20 rounded-xl border border-red-900/30 transition">
                                                            {s.favicon ? <img src={s.favicon} alt="" className="w-8 h-8 rounded-lg object-cover bg-gray-700 shrink-0" onError={e => e.target.style.display='none'} /> : <div className="w-8 h-8 rounded-lg bg-gray-700 shrink-0 flex items-center justify-center text-xs opacity-40">📻</div>}
                                                            <div className="flex-1 min-w-0 opacity-50">
                                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-900/60 text-red-400 border border-red-700/30">Gizlendi</span>
                                                                </div>
                                                                <p className="text-white text-sm font-medium truncate">{s.name}</p>
                                                                <p className="text-slate-500 text-xs truncate">{s.countrycode} {s.tags ? `• ${s.tags.split(',')[0]}` : ''}</p>
                                                            </div>
                                                            <button onClick={() => onUnblockStation(s.stationuuid)} className="p-1.5 text-green-400 hover:bg-green-400/10 rounded-lg transition shrink-0" title="Engeli Kaldır">
                                                                <span className="text-xs font-bold">✓ Göster</span>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* API RADYOLAR SEKMESI */}
                            {activeTab === 'api' && (
                                <ApiTabContent
                                    countries={countries}
                                    blockedIds={blockedIds}
                                    onBlockStation={onBlockStation}
                                    onUnblockStation={onUnblockStation}
                                />
                            )}

                            {/* ADD / EDIT TAB */}
                            {activeTab === 'add' && (
                                <form onSubmit={handleStationSubmit} className="space-y-3">
                                    {editingId && (
                                        <div className="flex items-center gap-2 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-xl text-yellow-400 text-xs">
                                            <PencilLine className="w-4 h-4 shrink-0" /> Düzenleme modu — değişiklikleri kaydetmek için Güncelle'ye tıklayın.
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs text-slate-400">Radyo Adı *</label>
                                            <input type="text" placeholder="Örn: TRT FM" className="w-full bg-gray-800 p-2.5 rounded-lg text-white text-sm border border-white/10 focus:border-teal-500 outline-none"
                                                value={newStation.name}
                                                onChange={e => {
                                                    const name = e.target.value;
                                                    setNewStation(prev => ({ ...prev, name, slug: prev.slug || toSlug(name) }));
                                                }} required />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs text-slate-400">Ülke *</label>
                                            <select className="w-full bg-gray-800 p-2.5 rounded-lg text-white text-sm border border-white/10 focus:border-teal-500 outline-none" value={newStation.country} onChange={e => setNewStation({ ...newStation, country: e.target.value })}>
                                                {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-400">Yayın Linki (HTTPS) *</label>
                                        <input type="url" placeholder="https://stream.example.com/radio" className="w-full bg-gray-800 p-2.5 rounded-lg text-white text-sm border border-white/10 focus:border-teal-500 outline-none" value={newStation.url} onChange={e => setNewStation({ ...newStation, url: e.target.value })} required />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-400">Logo URL</label>
                                        <input type="url" placeholder="https://example.com/logo.png" className="w-full bg-gray-800 p-2.5 rounded-lg text-white text-sm border border-white/10 focus:border-teal-500 outline-none" value={newStation.logo} onChange={e => setNewStation({ ...newStation, logo: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-400">Etiket / Tür</label>
                                        <input type="text" placeholder="Örn: pop, news, jazz" className="w-full bg-gray-800 p-2.5 rounded-lg text-white text-sm border border-white/10 focus:border-teal-500 outline-none" value={newStation.tag} onChange={e => setNewStation({ ...newStation, tag: e.target.value })} />
                                    </div>

                                    {/* SEO ALANLARI */}
                                    <div className="border-t border-white/10 pt-3">
                                        <p className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2">🔍 SEO Ayarları</p>
                                        <div className="space-y-2">
                                            <div className="space-y-1">
                                                <label className="text-xs text-slate-400">URL Slug <span className="text-slate-600">(sayfa adresi)</span></label>
                                                <div className="flex items-center gap-1 bg-gray-800 rounded-lg border border-white/10 focus-within:border-teal-500 overflow-hidden">
                                                    <span className="text-slate-600 text-xs pl-2.5 whitespace-nowrap">radiocu.com/{(newStation.country || 'TR').toLowerCase()}/</span>
                                                    <input type="text" placeholder="metro-fm" className="flex-1 bg-transparent p-2.5 text-white text-sm outline-none min-w-0"
                                                        value={newStation.slug} onChange={e => setNewStation({ ...newStation, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-slate-400">SEO Başlığı <span className="text-slate-600">(tarayıcı başlığı)</span></label>
                                                <input type="text" placeholder="Metro FM Canlı Dinle | Radiocu" className="w-full bg-gray-800 p-2.5 rounded-lg text-white text-sm border border-white/10 focus:border-teal-500 outline-none"
                                                    value={newStation.seoTitle} onChange={e => setNewStation({ ...newStation, seoTitle: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-slate-400">
                                                    SEO Açıklaması <span className={`text-xs ${newStation.seoDescription.length > 160 ? 'text-red-400' : 'text-slate-600'}`}>({newStation.seoDescription.length}/160)</span>
                                                </label>
                                                <textarea rows={2} placeholder="Metro FM'i ücretsiz canlı dinle. Pop müziğin kalbi Radiocu'da!" className="w-full bg-gray-800 p-2.5 rounded-lg text-white text-sm border border-white/10 focus:border-teal-500 outline-none resize-none"
                                                    value={newStation.seoDescription} onChange={e => setNewStation({ ...newStation, seoDescription: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-slate-400">Anahtar Kelimeler <span className="text-slate-600">(virgülle ayır)</span></label>
                                                <input type="text" placeholder="metro fm, metro fm canlı, metro fm dinle" className="w-full bg-gray-800 p-2.5 rounded-lg text-white text-sm border border-white/10 focus:border-teal-500 outline-none"
                                                    value={newStation.seoKeywords} onChange={e => setNewStation({ ...newStation, seoKeywords: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-1">
                                        <button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-500 text-white p-2.5 rounded-xl text-sm font-bold transition">
                                            {editingId ? '✅ Güncelle' : '➕ Ekle'}
                                        </button>
                                        {editingId && (
                                            <button type="button" onClick={() => { setEditingId(null); setNewStation({ name: '', url: '', logo: '', country: 'TR', tag: '', slug: '', seoTitle: '', seoDescription: '', seoKeywords: '' }); setActiveTab('list'); }}
                                                className="px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm transition flex items-center gap-1">
                                                <Ban className="w-4 h-4" /> İptal
                                            </button>
                                        )}
                                    </div>
                                </form>
                            )}

                            {/* COUNTRIES TAB */}
                            {activeTab === 'countries' && (
                                <>
                                    <div className="p-4 bg-gray-800/50 rounded-xl border border-white/5 space-y-3">
                                        <h3 className="text-sm font-bold text-white">Yeni Ülke Ekle</h3>
                                        <form onSubmit={handleCountrySubmit} className="space-y-3">
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="space-y-1">
                                                    <label className="text-xs text-slate-400">Kod</label>
                                                    <input type="text" placeholder="TR" className="w-full bg-gray-900 p-2 rounded-lg text-white text-sm border border-white/10 focus:border-teal-500 outline-none" value={newCountry.code} onChange={e => setNewCountry({ ...newCountry, code: e.target.value.toUpperCase() })} required maxLength={2} />
                                                </div>
                                                <div className="col-span-2 space-y-1">
                                                    <label className="text-xs text-slate-400">Ülke Adı</label>
                                                    <input type="text" placeholder="Türkiye" className="w-full bg-gray-900 p-2 rounded-lg text-white text-sm border border-white/10 focus:border-teal-500 outline-none" value={newCountry.name} onChange={e => setNewCountry({ ...newCountry, name: e.target.value })} required />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-slate-400">Bayrak Emojisi</label>
                                                <input type="text" placeholder="🇹🇷" className="w-full bg-gray-900 p-2 rounded-lg text-white text-sm border border-white/10 focus:border-teal-500 outline-none" value={newCountry.flag} onChange={e => setNewCountry({ ...newCountry, flag: e.target.value })} required />
                                            </div>
                                            <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white p-2 rounded-lg text-sm font-bold transition">Ekle</button>
                                        </form>
                                    </div>
                                    <div className="space-y-1.5">
                                        {countries.map(c => (
                                            <div key={c.id || c.code} className="flex justify-between items-center p-2.5 hover:bg-gray-800 rounded-lg border border-gray-800/50 transition">
                                                <span className="text-sm text-white">{c.flag} {c.name} <span className="text-slate-500 text-xs">({c.code})</span></span>
                                                {c.id && <button onClick={() => handleCountryDelete(c.id)} className="text-red-400 hover:bg-red-400/10 p-1 rounded-lg transition"><Trash2 className="w-3.5 h-3.5" /></button>}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10 flex items-center justify-between shrink-0">
                            {msg && <p className={`text-xs ${msgType === 'error' ? 'text-red-400' : 'text-teal-400'}`}>{msg}</p>}
                            {!msg && <div />}
                            <button onClick={() => signOut(auth)} className="text-slate-500 hover:text-white text-xs transition">Çıkış Yap</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN APP (Router Shell) ---
export default function App() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Named routes first — static segments take priority over dynamic :slug */}
                <Route path="/:countryCode/search" element={<RadioApp page="search" />} />
                <Route path="/:countryCode/favorites" element={<RadioApp page="favorites" />} />
                <Route path="/:countryCode/about" element={<RadioApp page="about" />} />
                <Route path="/:countryCode/contact" element={<RadioApp page="contact" />} />
                <Route path="/:countryCode/privacy" element={<RadioApp page="privacy" />} />

                {/* SEO Station Pages: radiocu.com/tr/metro-fm */}
                <Route path="/:countryCode/:slug" element={<StationPageWrapper />} />

                <Route path="/:countryCode" element={<RadioApp page="home" />} />
                <Route path="/" element={<RadioApp page="home" />} />
            </Routes>
        </Suspense>
    );
}

// Wrapper for StationPage - provides play context from localStorage
function StationPageWrapper() {
    const [currentStation, setCurrentStation] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const playStation = useCallback((station) => {
        if (!audioRef.current) audioRef.current = new Audio();
        const url = station.url || station.url_resolved;
        if (currentStation?.id === station.id && audioRef.current.src) {
            if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
            else { audioRef.current.play().catch(() => {}); setIsPlaying(true); }
        } else {
            audioRef.current.pause();
            audioRef.current.src = url;
            audioRef.current.play().catch(() => {});
            setCurrentStation(station);
            setIsPlaying(true);
        }
    }, [currentStation, isPlaying]);

    return (
        <Suspense fallback={<PageLoader />}>
            <StationPage onPlayStation={playStation} currentStation={currentStation} isPlaying={isPlaying} />
        </Suspense>
    );
}


function RadioApp({ page }) {
    const { countryCode: urlCountryCode } = useParams();
    const navigate = useNavigate();

    // --- STATE ---
    const [countriesList, setCountriesList] = useState(DEFAULT_COUNTRIES);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    // Initialize selectedCountry from URL immediately so fetchWithFailover runs correctly on first render
    const [selectedCountry, setSelectedCountry] = useState(() => {
        if (urlCountryCode) {
            const upper = urlCountryCode.toUpperCase();
            if (DEFAULT_COUNTRIES.some(c => c.code === upper)) return upper;
        }
        return 'TR';
    });
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
    const audioRef = useRef((() => { const a = new Audio(); a.preload = 'none'; return a; })());
    const [showAdmin, setShowAdmin] = useState(false);
    const [user, setUser] = useState(null);
    const [blockedIds, setBlockedIds] = useState(() => {
        try { return JSON.parse(localStorage.getItem('rs_blocked') || '[]'); } catch { return []; }
    });

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

    // --- FETCH BLOCKED STATIONS ---
    useEffect(() => {
        if (!db) return;
        const fetchBlocked = async () => {
            try {
                const snap = await getDocs(collection(db, "blocked_stations"));
                const ids = snap.docs.map(d => d.data().stationuuid).filter(Boolean);
                setBlockedIds(ids);
                localStorage.setItem('rs_blocked', JSON.stringify(ids));
            } catch (e) { console.error('Blocked fetch error:', e); }
        };
        fetchBlocked();
    }, [showAdmin]);

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
                if (DEFAULT_COUNTRIES.some(c => c.code === upperCode)) {
                    // Country already set via useState initializer — just set language
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
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 3000);
                    try {
                        const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
                        clearTimeout(timeoutId);
                        const data = await res.json();
                        if (data?.country_code) {
                            code = data.country_code;
                            localStorage.setItem('rs_user_country', JSON.stringify({ code, timestamp: Date.now() }));
                        }
                    } catch { clearTimeout(timeoutId); }
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
        if (blockedIds.includes(s.stationuuid)) return false;
        const q = searchQuery.toLowerCase();
        return (s.name.toLowerCase().includes(q) || s.tags?.toLowerCase().includes(q));
    }), [stations, searchQuery, blockedIds]);

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
                    <Suspense fallback={<PageLoader />}>
                        <AboutPage appLang={appLang} onOpenAdmin={() => setShowAdmin(true)} />
                    </Suspense>
                )}
                {page === 'contact' && (
                    <Suspense fallback={<PageLoader />}>
                        <ContactPage appLang={appLang} onOpenAdmin={() => setShowAdmin(true)} />
                    </Suspense>
                )}
                {page === 'privacy' && (
                    <Suspense fallback={<PageLoader />}>
                        <PrivacyPage appLang={appLang} onOpenAdmin={() => setShowAdmin(true)} />
                    </Suspense>
                )}
            </div>

            {showAdmin && <AdminModal
                isOpen={showAdmin}
                onClose={() => setShowAdmin(false)}
                user={user}
                countries={countriesList}
                allStations={stations}
                blockedIds={blockedIds}
                onBlockStation={async (station) => {
                    if (!db) return;
                    try {
                        await addDoc(collection(db, "blocked_stations"), { stationuuid: station.stationuuid, name: station.name, country: station.countrycode || station.country || '' });
                        setBlockedIds(prev => { const next = [...prev, station.stationuuid]; localStorage.setItem('rs_blocked', JSON.stringify(next)); return next; });
                    } catch (e) { console.error(e); }
                }}
                onUnblockStation={async (uuid) => {
                    if (!db) return;
                    try {
                        const snap = await getDocs(collection(db, "blocked_stations"));
                        const toDelete = snap.docs.find(d => d.data().stationuuid === uuid);
                        if (toDelete) await deleteDoc(doc(db, "blocked_stations", toDelete.id));
                        setBlockedIds(prev => { const next = prev.filter(id => id !== uuid); localStorage.setItem('rs_blocked', JSON.stringify(next)); return next; });
                    } catch (e) { console.error(e); }
                }}
            />}
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