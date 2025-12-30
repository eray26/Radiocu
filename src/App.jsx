import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Search, Globe as GlobeIcon, Radio, MapPin, Music, Wifi, AlertCircle, Sparkles, X, Bot, MessageSquare, Loader2, Activity, Zap, Waves, Menu, RefreshCw, Star, Info, Shield, FileText, Mail, HelpCircle, ChevronRight, BookOpen, Headphones, Signal, Smartphone, Lock, LogIn, Plus, Trash2, Ban, CheckCircle, Compass } from 'lucide-react';

// FIREBASE İMPORTLARI
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, updateDoc } from "firebase/firestore";
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

let db, auth;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
} catch (e) {
    console.warn("Firebase bağlantı hatası:", e);
    // Hata durumunda değişkenleri null bırakıyoruz ki site çökmesin
    db = null;
    auth = null;
}

// --- ÜLKE -> DİL EŞLEŞTİRME TABLOSU ---
const COUNTRY_LANG_MAP = {
    'TR': 'TR', 'AZ': 'AZ',
    'US': 'EN', 'GB': 'EN', 'CA': 'EN', 'AU': 'EN',
    'DE': 'DE', 'AT': 'DE', 'CH': 'DE',
    'FR': 'FR', 'BE': 'FR',
    'ES': 'ES', 'MX': 'ES', 'AR': 'ES',
    'IT': 'IT',
    'NL': 'NL',
    'BR': 'PT', 'PT': 'PT',
    'RU': 'RU', 'UA': 'RU', 'KZ': 'RU',
    'CN': 'ZH', 'SG': 'ZH', 'TW': 'ZH',
    'IN': 'HI',
    'JP': 'JA',
    'KR': 'KO',
    'SA': 'AR', 'AE': 'AR', 'EG': 'AR'
};

// --- SABİT LİSTELER ---
const VIP_STATIONS_DEFAULT = {
  TR: [
    { name: "Power Türk", url: "https://listen.powerapp.com.tr/powerturk/mpeg/icecast.audio", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Power_T%C3%BCrk_logo.svg", site: "https://powerapp.com.tr", tag: "pop,türkçe" },
    { name: "Power FM", url: "https://listen.powerapp.com.tr/powerfm/mpeg/icecast.audio", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Power_FM_logo.svg", site: "https://powerapp.com.tr", tag: "pop,hit" },
    { name: "Metro FM", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/METRO_FM_SC", logo: "https://upload.wikimedia.org/wikipedia/tr/f/f7/Metro_FM_logo.png", site: "https://karnaval.com", tag: "pop,yabancı" }
  ]
};

// --- GENİŞLETİLMİŞ ÜLKE LİSTESİ ---
const DEFAULT_COUNTRIES = [
  { code: 'TR', name: 'Türkiye', flag: '🇹🇷' }, 
  { code: 'DE', name: 'Deutschland', flag: '🇩🇪' }, 
  { code: 'US', name: 'USA', flag: '🇺🇸' }, 
  { code: 'GB', name: 'UK', flag: '🇬🇧' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹' },
  { code: 'ES', name: 'España', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'AZ', name: 'Azerbaycan', flag: '🇦🇿' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'Korea', flag: '🇰🇷' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' }
];

const API_MIRRORS = ["https://at1.api.radio-browser.info", "https://de1.api.radio-browser.info"];

// --- TAM KAPSAMLI DİL SÖZLÜĞÜ ---
const TRANSLATIONS = {
  TR: { 
    code: "tr", mapBtn: "Harita", admin: "Yönetici", addStation: "Radyo Ekle", logout: "Çıkış", login: "Giriş", email: "E-posta", pass: "Şifre", 
    searchPlaceholder: "Radyo ara...", categories: "Kategoriler", allRadios: "Tüm Radyolar", btnLoad: "Yükleniyor...", live: "CANLI", paused: "DURAKLATILDI", 
    locationDetected: "Konum Algılandı", footerRights: "Tüm Hakları Saklıdır.", errorMsg: "Liste alınamadı.", retry: "Tekrar Dene", playingError: "Yayın açılmadı.", 
    seoTitle: "Canlı Radyo Dinle", seoDesc: "Kesintisiz radyo keyfi.", h1Prefix: "Canlı", h1Suffix: "Radyoları"
  },
  EN: { 
    code: "en", mapBtn: "Map", admin: "Admin", addStation: "Add Station", logout: "Logout", login: "Login", email: "Email", pass: "Password", 
    searchPlaceholder: "Search...", categories: "Genres", allRadios: "All Radios", btnLoad: "Loading...", live: "LIVE", paused: "PAUSED", 
    locationDetected: "Location Detected", footerRights: "All Rights Reserved.", errorMsg: "Failed load.", retry: "Retry", playingError: "Stream failed.", 
    seoTitle: "Listen Live Radio", seoDesc: "Listen online radio.", h1Prefix: "Listen Live", h1Suffix: "Radio Stations"
  },
  DE: { 
    code: "de", mapBtn: "Karte", admin: "Admin", addStation: "Sender Hinzufügen", logout: "Abmelden", login: "Anmelden", email: "E-Mail", pass: "Passwort", 
    searchPlaceholder: "Suche...", categories: "Genres", allRadios: "Alle Radios", btnLoad: "Laden...", live: "LIVE", paused: "PAUSIERT", 
    locationDetected: "Standort Erkannt", footerRights: "Rechte vorbehalten.", errorMsg: "Fehler.", retry: "Erneut versuchen", playingError: "Fehler.", 
    seoTitle: "Radio Online Hören", seoDesc: "Kostenlose Online-Radio.", h1Prefix: "Live", h1Suffix: "Radio Hören"
  },
  FR: { 
    code: "fr", mapBtn: "Carte", admin: "Admin", addStation: "Ajouter", logout: "Déconnexion", login: "Connexion", email: "Email", pass: "Mot de passe",
    searchPlaceholder: "Rechercher...", categories: "Genres", allRadios: "Toutes", btnLoad: "Chargement...", live: "EN DIRECT", paused: "PAUSE", 
    locationDetected: "Localisation", footerRights: "Tous droits réservés.", errorMsg: "Erreur.", retry: "Réessayer", playingError: "Erreur.", 
    seoTitle: "Écouter la Radio", seoDesc: "Radio en ligne.", h1Prefix: "Écouter", h1Suffix: "Radio"
  },
  ES: { 
    code: "es", mapBtn: "Mapa", admin: "Admin", addStation: "Añadir", logout: "Salir", login: "Acceso", email: "Email", pass: "Contraseña",
    searchPlaceholder: "Buscar...", categories: "Géneros", allRadios: "Todas", btnLoad: "Cargando...", live: "EN VIVO", paused: "PAUSADO", 
    locationDetected: "Ubicación", footerRights: "Derechos reservados.", errorMsg: "Error.", retry: "Reintentar", playingError: "Error.", 
    seoTitle: "Radio en Vivo", seoDesc: "Radio online gratis.", h1Prefix: "Escuchar", h1Suffix: "Radio"
  },
  ZH: { 
    code: "zh", mapBtn: "地图", admin: "管理员", addStation: "添加电台", logout: "登出", login: "登录", email: "电子邮件", pass: "密码",
    searchPlaceholder: "搜索电台...", categories: "分类", allRadios: "所有电台", btnLoad: "加载中...", live: "直播", paused: "暂停", 
    locationDetected: "位置已检测", footerRights: "保留所有权利。", errorMsg: "加载失败。", retry: "重试", playingError: "无法播放。", 
    seoTitle: "收听在线广播", seoDesc: "免费收听全球广播。", h1Prefix: "收听", h1Suffix: "现场广播"
  },
  HI: { 
    code: "hi", mapBtn: "नक्शा", admin: "एडमिन", addStation: "रेडियो जोड़ें", logout: "लॉग आउट", login: "लॉग इन", email: "ईमेल", pass: "पासवर्ड",
    searchPlaceholder: "रेडियो खोजें...", categories: "श्रेणियाँ", allRadios: "सभी रेडियो", btnLoad: "लोड हो रहा है...", live: "लाइव", paused: "रूका हुआ", 
    locationDetected: "स्थान मिला", footerRights: "सर्वाधिकार सुरक्षित।", errorMsg: "विफल।", retry: "पुनः प्रयास करें", playingError: "त्रुटि।", 
    seoTitle: "लाइव रेडियो सुनें", seoDesc: "मुफ्त ऑनलाइन रेडियो।", h1Prefix: "लाइव सुनें", h1Suffix: "रेडियो"
  },
  JA: { 
    code: "ja", mapBtn: "地図", admin: "管理", addStation: "追加", logout: "ログアウト", login: "ログイン", email: "メール", pass: "パスワード",
    searchPlaceholder: "検索...", categories: "ジャンル", allRadios: "すべて", btnLoad: "読み込み中...", live: "ライブ", paused: "一時停止", 
    locationDetected: "位置検出", footerRights: "全著作権所有。", errorMsg: "エラー。", retry: "再試行", playingError: "再生不可。", 
    seoTitle: "ラジオを聴く", seoDesc: "オンラインラジオ。", h1Prefix: "聴く", h1Suffix: "ラジオ"
  },
  KO: { 
    code: "ko", mapBtn: "지도", admin: "관리자", addStation: "추가", logout: "로그아웃", login: "로그인", email: "이메일", pass: "비밀번호",
    searchPlaceholder: "검색...", categories: "장르", allRadios: "전체", btnLoad: "로딩 중...", live: "라이브", paused: "일시 중지", 
    locationDetected: "위치 감지됨", footerRights: "판권 소유.", errorMsg: "오류.", retry: "재시도", playingError: "오류.", 
    seoTitle: "라디오 듣기", seoDesc: "온라인 라디오.", h1Prefix: "듣기", h1Suffix: "라디오"
  },
  AR: { 
    code: "ar", mapBtn: "خريطة", admin: "مدير", addStation: "إضافة", logout: "خروج", login: "دخول", email: "البريد", pass: "كلمة السر",
    searchPlaceholder: "بحث...", categories: "فئات", allRadios: "الكل", btnLoad: "جار التحميل...", live: "مباشر", paused: "متوقف", 
    locationDetected: "تم تحديد الموقع", footerRights: "جميع الحقوق محفوظة.", errorMsg: "خطأ.", retry: "أعد المحاولة", playingError: "خطأ.", 
    seoTitle: "استمع للراديو", seoDesc: "راديو مباشر.", h1Prefix: "استمع", h1Suffix: "راديو"
  },
  IT: { code: "it", mapBtn: "Mappa", admin: "Admin", addStation: "Aggiungi", logout: "Esci", login: "Login", email: "Email", pass: "Password", searchPlaceholder: "Cerca...", categories: "Generi", allRadios: "Tutte", btnLoad: "Caricamento...", live: "IN DIRETTA", paused: "PAUSA", locationDetected: "Posizione", footerRights: "Diritti riservati.", errorMsg: "Errore.", retry: "Riprova", playingError: "Errore.", seoTitle: "Ascolta Radio", seoDesc: "Radio online.", h1Prefix: "Ascolta", h1Suffix: "Radio" },
  NL: { code: "nl", mapBtn: "Kaart", admin: "Admin", addStation: "Toevoegen", logout: "Uitloggen", login: "Inloggen", email: "E-mail", pass: "Wachtwoord", searchPlaceholder: "Zoeken...", categories: "Genres", allRadios: "Alle", btnLoad: "Laden...", live: "LIVE", paused: "GEPAUZEERD", locationDetected: "Locatie", footerRights: "Rechten voorbehouden.", errorMsg: "Fout.", retry: "Opnieuw", playingError: "Fout.", seoTitle: "Luister Radio", seoDesc: "Online radio.", h1Prefix: "Luister", h1Suffix: "Radio" },
  PT: { code: "pt", mapBtn: "Mapa", admin: "Admin", addStation: "Adicionar", logout: "Sair", login: "Login", email: "Email", pass: "Senha", searchPlaceholder: "Buscar...", categories: "Gêneros", allRadios: "Todas", btnLoad: "Carregando...", live: "AO VIVO", paused: "PAUSADO", locationDetected: "Localização", footerRights: "Direitos reservados.", errorMsg: "Erro.", retry: "Tentar", playingError: "Erro.", seoTitle: "Ouvir Rádio", seoDesc: "Rádio online.", h1Prefix: "Ouvir", h1Suffix: "Rádio" },
  RU: { code: "ru", mapBtn: "Карта", admin: "Админ", addStation: "Добавить", logout: "Выйти", login: "Вход", email: "Email", pass: "Пароль", searchPlaceholder: "Поиск...", categories: "Жанры", allRadios: "Все", btnLoad: "Загрузка...", live: "ЭФИР", paused: "ПАУЗА", locationDetected: "Локация", footerRights: "Все права защищены.", errorMsg: "Ошибка.", retry: "Повторить", playingError: "Ошибка.", seoTitle: "Слушать Радио", seoDesc: "Онлайн радио.", h1Prefix: "Слушать", h1Suffix: "Радио" },
  AZ: { code: "az", mapBtn: "Xəritə", admin: "Admin", addStation: "Əlavə et", logout: "Çıxış", login: "Giriş", email: "E-poçt", pass: "Şifrə", searchPlaceholder: "Axtarış...", categories: "Kateqoriyalar", allRadios: "Hamısı", btnLoad: "Yüklənir...", live: "CANLI", paused: "DAYANDI", locationDetected: "Məkan", footerRights: "Hüquqlar qorunur.", errorMsg: "Xəta.", retry: "Yenidən", playingError: "Xəta.", seoTitle: "Canlı Radio", seoDesc: "Onlayn radio.", h1Prefix: "Canlı", h1Suffix: "Radio" }
};

const GENRES = ['all', 'pop', 'rock', 'jazz', 'news', 'classical', 'dance', 'folk', 'rap', 'arabesque'];

// --- BİLEŞENLER ---
const BrandLogo = ({ className }) => (<div className={className}><svg viewBox="0 0 24 24" fill="none" className="w-full h-full"><rect width="24" height="24" rx="6" fill="url(#brand_grad)" /><path d="M7 7H11C13.2 7 15 8.8 15 11V11C15 13.2 13.2 15 11 15H7V7Z" stroke="white" strokeWidth="2"/><path d="M7 15L11.5 20" stroke="white" strokeWidth="2"/><defs><linearGradient id="brand_grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stopColor="#4f46e5" /><stop offset="1" stopColor="#9333ea" /></linearGradient></defs></svg></div>);
const StationLogo = ({ url, alt, homepage, className }) => {
  const [imgSrc, setImgSrc] = useState(url);
  useEffect(() => { if (!url || url.startsWith('http://')) { if (homepage) { setImgSrc(`https://www.google.com/s2/favicons?domain=${homepage}&sz=128`); } } else { setImgSrc(url); } }, [url, homepage]);
  return <img src={imgSrc} alt={alt} className={`object-contain bg-white/5 p-1 ${className}`} onError={() => { if (homepage && !imgSrc.includes('google.com')) { setImgSrc(`https://www.google.com/s2/favicons?domain=${homepage}&sz=128`); } }} loading="lazy" referrerPolicy="no-referrer" />;
};
const AdSenseUnit = ({ slotId }) => { useEffect(() => { if (IS_ADSENSE_LIVE && window.adsbygoogle) try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {} }, []); if (!IS_ADSENSE_LIVE) return <div className="w-full h-24 bg-slate-800/30 border border-dashed border-slate-700/50 flex items-center justify-center text-slate-500 text-xs">Reklam</div>; return <div className="ad-container my-4 flex justify-center"><ins className="adsbygoogle" style={{display:'block'}} data-ad-client={GOOGLE_AD_CLIENT_ID} data-ad-slot={slotId} data-full-width-responsive="true"></ins></div>; };
const SeoContent = ({ country, lang, countriesList }) => { const cObj = countriesList.find(c => c.code === country); const cName = cObj ? cObj.name : country; const t = TRANSLATIONS[lang] || TRANSLATIONS['EN']; return (<div className="mt-12 mb-8 p-6 bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 text-sm"><h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><GlobeIcon className="w-5 h-5 text-indigo-500"/> {t.seoTitle} {cName}</h2><p>{t.seoDesc} {cName}.</p></div>); };
const Footer = ({ onOpenAdmin, lang }) => {
    const t = TRANSLATIONS[lang] || TRANSLATIONS['EN'];
    return (<footer className="mt-16 py-12 border-t border-slate-800 bg-slate-950/50"><div className="max-w-6xl mx-auto px-4 text-center"><p className="text-slate-500 text-xs mb-4">&copy; 2024 Radiocu.com</p><div className="flex justify-center gap-4 text-xs text-slate-500 mb-4"><a href="/hakkimizda.html" className="hover:text-white">About</a><a href="/gizlilik-politikasi.html" className="hover:text-white">Privacy</a><a href="mailto:info@radiocu.com" className="hover:text-white">Contact</a></div><button onClick={onOpenAdmin} className="text-[10px] text-slate-700 hover:text-indigo-500 transition flex items-center justify-center gap-1 mx-auto"><Lock className="w-3 h-3"/> {t.admin}</button></div></footer>);
};
const FeaturesSection = ({ lang }) => { const t = TRANSLATIONS[lang] || TRANSLATIONS['EN']; return (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 mb-12">{[{ icon: <Wifi className="w-6 h-6"/>, title: "HQ Stream", desc: "No buffer." }, { icon: <Headphones className="w-6 h-6"/>, title: "HD Audio", desc: "Best quality." }, { icon: <GlobeIcon className="w-6 h-6"/>, title: "Global", desc: "Worldwide." }, { icon: <Smartphone className="w-6 h-6"/>, title: "Mobile", desc: "Responsive." }].map((f, i) => (<div key={i} className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl flex flex-col items-center text-center hover:bg-slate-800/50 transition"><div className="mb-3 p-3 bg-indigo-500/10 rounded-full text-indigo-400">{f.icon}</div><h4 className="text-white font-bold mb-1">{f.title}</h4><p className="text-xs text-slate-400">{f.desc}</p></div>))}</div>); };
const BlogSection = ({ lang }) => { return (<div className="mt-12 mb-12"><h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-500"/> Blog</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[{ t: "Digital Radio", d: "24.11", c: "Future of streaming." }, { t: "Why Online?", d: "20.11", c: "Better quality." }, { t: "Music Impact", d: "15.11", c: "Psychology of sound." }].map((a, i) => (<div key={i} className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800/60 hover:border-indigo-500/30 transition"><div className="text-xs text-indigo-400 mb-2 font-mono">{a.d}</div><h3 className="text-lg font-bold text-slate-200 mb-2">{a.t}</h3><p className="text-sm text-slate-500">{a.c}</p></div>))}</div></div>); };
const FAQSection = ({ lang }) => { return (<div className="mt-8 mb-12"><h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-indigo-500"/> FAQ</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[{ q: "Free?", a: "Yes, 100% free." }, { q: "App?", a: "Mobile web app ready." }].map((item, i) => (<div key={i} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition"><h4 className="text-sm font-bold text-slate-200 mb-2">{item.q}</h4><p className="text-xs text-slate-400 leading-relaxed">{item.a}</p></div>))}</div></div>); };

// --- ADMİN PANELİ MODALI ---
const AdminModal = ({ isOpen, onClose, user, countries, setCountries }) => {
    const [activeTab, setActiveTab] = useState('stations');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newStation, setNewStation] = useState({ name: '', url: '', logo: '', country: 'TR', tag: '' });
    const [newCountry, setNewCountry] = useState({ code: '', name: '', flag: '' });
    const [dbStations, setDbStations] = useState([]);
    const [msg, setMsg] = useState('');
    const [editingId, setEditingId] = useState(null);

    // KORUMALI VERİ ÇEKME (CRASH FIX)
    useEffect(() => {
        let isMounted = true;
        if (user && isOpen && db) {
            const fetchDb = async () => {
                try {
                    const q = query(collection(db, "stations"));
                    const snap = await getDocs(q);
                    if(isMounted) setDbStations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                } catch(e) { console.error(e); }
            };
            fetchDb();
        }
        return () => { isMounted = false; };
    }, [user, isOpen]);

    const handleLogin = async (e) => {
        e.preventDefault();
        // GÜVENLİK KONTROLÜ: Auth yoksa çökmesin
        if (!auth) { setMsg("Veritabanı bağlantısı yok."); return; }
        try { await signInWithEmailAndPassword(auth, email, password); setMsg(""); } catch (error) { setMsg("Giriş başarısız."); }
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
    const handleStationDelete = async (id) => { if(window.confirm("Silinsin mi?")) { await deleteDoc(doc(db, "stations", id)); setMsg("Silindi."); } };
    const handleStationEdit = (s) => { setNewStation(s); setEditingId(s.id); };
    const handleCountrySubmit = async (e) => {
        e.preventDefault();
        try { await addDoc(collection(db, "countries"), newCountry); setMsg("Ülke eklendi!"); setNewCountry({ code: '', name: '', flag: '' }); } catch (e) { setMsg("Hata: " + e.message); }
    };
    const handleCountryDelete = async (id) => { if(window.confirm("Emin misiniz?")) { await deleteDoc(doc(db, "countries", id)); setMsg("Ülke silindi."); } };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X/></button>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Shield className="text-indigo-500"/> Yönetici</h2>
                {!user ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input type="email" placeholder="E-posta" className="w-full bg-slate-800 p-3 rounded text-white border border-slate-700" value={email} onChange={e=>setEmail(e.target.value)} />
                        <input type="password" placeholder="Şifre" className="w-full bg-slate-800 p-3 rounded text-white border border-slate-700" value={password} onChange={e=>setPassword(e.target.value)} />
                        <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded font-bold">Giriş Yap</button>
                        {msg && <p className="text-red-400 text-sm text-center">{msg}</p>}
                        {!auth && <p className="text-xs text-orange-400 text-center">Firebase yapılandırılmamış.</p>}
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="flex border-b border-slate-700">
                            <button onClick={() => setActiveTab('stations')} className={`flex-1 pb-2 text-sm font-bold ${activeTab === 'stations' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500'}`}>Radyolar</button>
                            <button onClick={() => setActiveTab('countries')} className={`flex-1 pb-2 text-sm font-bold ${activeTab === 'countries' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500'}`}>Ülkeler</button>
                        </div>
                        {activeTab === 'stations' && (
                            <>
                                <div className={`p-4 rounded-xl border ${editingId ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
                                    <h3 className="text-sm font-bold text-white mb-3">{editingId ? "Düzenle" : "Yeni Ekle"}</h3>
                                    <form onSubmit={handleStationSubmit} className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <input type="text" placeholder="Ad" className="bg-slate-900 p-2 rounded text-white text-sm border border-slate-700" value={newStation.name} onChange={e=>setNewStation({...newStation, name: e.target.value})} required/>
                                            <select className="bg-slate-900 p-2 rounded text-white text-sm border border-slate-700" value={newStation.country} onChange={e=>setNewStation({...newStation, country: e.target.value})}>{countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}</select>
                                        </div>
                                        <input type="url" placeholder="Link (HTTPS)" className="w-full bg-slate-900 p-2 rounded text-white text-sm border border-slate-700" value={newStation.url} onChange={e=>setNewStation({...newStation, url: e.target.value})} required/>
                                        <input type="url" placeholder="Logo Linki" className="w-full bg-slate-900 p-2 rounded text-white text-sm border border-slate-700" value={newStation.logo} onChange={e=>setNewStation({...newStation, logo: e.target.value})} />
                                        <div className="flex gap-2"><button type="submit" className="flex-1 bg-green-600 hover:bg-green-500 text-white p-2 rounded text-sm font-bold">{editingId ? "Güncelle" : "Kaydet"}</button>{editingId && <button type="button" onClick={() => {setEditingId(null); setNewStation({ name: '', url: '', logo: '', country: 'TR', tag: '' })}} className="px-3 bg-slate-700 text-white rounded"><Ban className="w-4 h-4"/></button>}</div>
                                    </form>
                                </div>
                                <div className="max-h-40 overflow-y-auto custom-scrollbar">
                                    {dbStations.map(s => (
                                        <div key={s.id} className="flex justify-between items-center p-2 hover:bg-slate-800 rounded border-b border-slate-800/50 group"><span className="text-xs text-white truncate w-2/3">{s.name} ({s.country})</span><div className="flex gap-1 opacity-60 group-hover:opacity-100"><button onClick={() => handleStationEdit(s)} className="p-1 text-yellow-400 hover:bg-slate-700 rounded"><Settings className="w-3 h-3"/></button><button onClick={() => handleStationDelete(s.id)} className="p-1 text-red-400 hover:bg-slate-700 rounded"><Trash2 className="w-3 h-3"/></button></div></div>
                                    ))}
                                </div>
                            </>
                        )}
                        {activeTab === 'countries' && (
                            <>
                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                    <h3 className="text-sm font-bold text-white mb-3">Yeni Ülke</h3>
                                    <form onSubmit={handleCountrySubmit} className="space-y-3">
                                        <div className="grid grid-cols-3 gap-2">
                                            <input type="text" placeholder="Kod (FR)" className="bg-slate-900 p-2 rounded text-white text-sm border border-slate-700" value={newCountry.code} onChange={e=>setNewCountry({...newCountry, code: e.target.value.toUpperCase()})} required maxLength={2}/>
                                            <input type="text" placeholder="Ad" className="bg-slate-900 p-2 rounded text-white text-sm border border-slate-700 col-span-2" value={newCountry.name} onChange={e=>setNewCountry({...newCountry, name: e.target.value})} required/>
                                        </div>
                                        <input type="text" placeholder="Bayrak (🇫🇷)" className="w-full bg-slate-900 p-2 rounded text-white text-sm border border-slate-700" value={newCountry.flag} onChange={e=>setNewCountry({...newCountry, flag: e.target.value})} required/>
                                        <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white p-2 rounded text-sm font-bold">Ekle</button>
                                    </form>
                                </div>
                                <div className="max-h-40 overflow-y-auto custom-scrollbar">
                                    {countries.map(c => (
                                        <div key={c.id || c.code} className="flex justify-between items-center p-2 hover:bg-slate-800 rounded border-b border-slate-800/50">
                                            <span className="text-xs text-white">{c.flag} {c.name} ({c.code})</span>
                                            {c.id && <button onClick={() => handleCountryDelete(c.id)} className="text-red-400 hover:bg-slate-700 p-1 rounded"><Trash2 className="w-3 h-3"/></button>}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {msg && <p className="text-green-400 text-xs text-center">{msg}</p>}
                        <button onClick={() => signOut(auth)} className="w-full p-2 text-slate-500 hover:text-white text-sm">Çıkış</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- APP ---
export default function App() {
  const [countriesList, setCountriesList] = useState(DEFAULT_COUNTRIES);
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
  
  const [showAdmin, setShowAdmin] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => { if(auth) return onAuthStateChanged(auth, (u) => setUser(u)); }, []);

  // --- ÜLKELERİ GETİR ---
  useEffect(() => {
    const fetchCountries = async () => {
        if(db) {
            try {
                const q = query(collection(db, "countries"), orderBy("name"));
                const snapshot = await getDocs(q);
                if(!snapshot.empty) {
                    const dynamicCountries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    const combined = [...DEFAULT_COUNTRIES, ...dynamicCountries.filter(dc => !DEFAULT_COUNTRIES.some(def => def.code === dc.code))];
                    setCountriesList(combined);
                }
            } catch(e) { console.error("Ülke çekme hatası", e); }
        }
    };
    fetchCountries();
  }, [showAdmin]);

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
      
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data?.country_code) {
          const code = data.country_code;
          
          if (countriesList.find(c => c.code === code)) { 
              setSelectedCountry(code); 
              setAutoLocated(true); 
          }
          
          // --- DİL SEÇİMİ ---
          if (COUNTRY_LANG_MAP[code]) {
              setAppLang(COUNTRY_LANG_MAP[code]);
          } else {
              setAppLang(TRANSLATIONS[browserLang] ? browserLang : 'EN');
          }
        }
      } catch (e) { 
        console.log("IP detection failed"); 
        setAppLang(TRANSLATIONS[browserLang] ? browserLang : 'EN');
      }
    };
    initApp();

    const audio = audioRef.current;
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => { setIsBuffering(false); setIsPlaying(true); setError(null); };
    const onPause = () => setIsPlaying(false);
    const onError = () => { setIsBuffering(false); setIsPlaying(false); setError(t.playingError); };
    audio.addEventListener('waiting', onWaiting); audio.addEventListener('playing', onPlaying); audio.addEventListener('pause', onPause); audio.addEventListener('error', onError);
    return () => { audio.removeEventListener('waiting', onWaiting); audio.removeEventListener('playing', onPlaying); audio.removeEventListener('pause', onPause); audio.removeEventListener('error', onError); };
  }, [countriesList]); 

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
      // SEO
      document.title = `${currentStation.name} - Radiocu`;
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
            <div className={`hidden md:flex items-center gap-2 ${theme.bgCard} px-3 py-1.5 rounded-lg border ${theme.border}`}><MapPin className={`w-4 h-4 ${autoLocated ? theme.textAccent : 'text-slate-500'}`} /><select value={selectedCountry} onChange={(e) => { setSelectedCountry(e.target.value); setAutoLocated(false); }} className="bg-transparent outline-none text-sm font-medium cursor-pointer text-slate-300 max-w-[100px]">{countriesList.map(c => <option key={c.code} value={c.code} className="bg-slate-900">{c.flag} {c.name}</option>)}</select></div>
            <div className="hidden md:flex items-center justify-center w-8 h-8 bg-slate-800 rounded text-xs font-bold text-slate-400 border border-slate-700 uppercase" title="Language">{appLang}</div>
        </div>
      </header>
      
      {mobileMenuOpen && (<div className="absolute top-16 left-0 w-full bg-slate-900 border-b border-slate-800 z-20 p-4 md:hidden animate-in slide-in-from-top-2"><div className="mb-4"><select value={selectedCountry} onChange={(e) => { setSelectedCountry(e.target.value); setMobileMenuOpen(false); }} className="w-full bg-slate-800 p-3 rounded-lg text-white border border-slate-700">{countriesList.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}</select></div></div>)}

      <div className="flex flex-1 overflow-hidden relative">
        <aside className={`w-64 ${theme.bgPanel} border-r ${theme.border} hidden md:flex flex-col backdrop-blur-xl`}>
            <div className="p-6 overflow-y-auto flex-1"><h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2"><Waves className="w-3 h-3"/> {t.categories}</h3><div className="space-y-1">{GENRES.map(g => (<button key={g} onClick={() => { setSelectedGenre(g); setSearchQuery(''); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-3 ${selectedGenre === g ? `bg-indigo-500/10 ${theme.textAccent} border border-indigo-500/20` : `text-slate-400 hover:text-white hover:bg-white/5`}`}><span className={`w-1.5 h-1.5 rounded-full ${selectedGenre === g ? 'bg-indigo-400' : 'bg-slate-700'}`}></span><span className="capitalize">{g === 'all' ? t.allRadios : g}</span></button>))}</div><div className="mt-8"><AdSenseUnit slotId="sidebar-ad" /></div></div>
            <div className="p-6 border-t border-slate-800 text-center flex flex-col gap-1"><p className="text-xs text-slate-600 font-mono">© 2024 Radiocu</p></div>
        </aside>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-40">
           <div className="max-w-6xl mx-auto">
              <AdSenseUnit slotId="header-ad" />
              <div className="mb-6 mt-6 border-b border-white/5 pb-4"><div className="flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3"><span className="text-3xl">{countriesList.find(c => c.code === selectedCountry)?.flag}</span>{countriesList.find(c => c.code === selectedCountry)?.name}</h1><p className="text-sm text-slate-400 mt-2 flex items-center gap-2">{autoLocated && <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded text-xs border border-indigo-500/20 flex items-center gap-1"><Zap className="w-3 h-3"/> {t.locationDetected}</span>}<span className="bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700">{filteredStations.length} {t.stations}</span></p></div><button onClick={() => fetchWithFailover(selectedCountry)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition self-end md:self-auto"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button></div></div>
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
              <SeoContent country={selectedCountry} lang={appLang} countriesList={countriesList} />
              <FAQSection lang={appLang} />
              <Footer onOpenAdmin={() => setShowAdmin(true)} lang={appLang} />
              <div className="mt-12 mb-24"><AdSenseUnit slotId="footer-ad" /></div>
           </div>
        </main>
        
        {/* --- ADMİN MODALI (ÜLKELERİ DE YÖNETİR) --- */}
        <AdminModal isOpen={showAdmin} onClose={() => setShowAdmin(false)} user={user} countries={countriesList} setCountries={setCountriesList} />
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