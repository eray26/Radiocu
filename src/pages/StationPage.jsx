import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

// Helper: get or reuse Firebase app
function getDb() {
    try {
        const apps = getApps();
        const app = apps.length > 0 ? apps[0] : null;
        if (!app) return null;
        return getFirestore(app);
    } catch { return null; }
}

// Helper: slug'a göre radyo getir
async function fetchStationBySlug(slug) {
    const db = getDb();
    if (!db) return null;
    const q = query(collection(db, 'stations'), where('slug', '==', slug));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

// Helper: radyo adından slug üret
export function toSlug(name) {
    return name
        .toLowerCase()
        .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
        .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

export default function StationPage({ onPlayStation, currentStation, isPlaying }) {
    const { slug, countryCode } = useParams();
    const navigate = useNavigate();
    const [station, setStation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        setLoading(true);
        setNotFound(false);
        fetchStationBySlug(slug).then(data => {
            if (!data) { setNotFound(true); }
            else { setStation(data); }
            setLoading(false);
        });
    }, [slug]);

    // Dynamic SEO meta tags
    useEffect(() => {
        if (!station) return;
        const title = station.seoTitle || `${station.name} Canlı Dinle | Radiocu`;
        const description = station.seoDescription || `${station.name} canlı radyo yayınını ücretsiz dinle. Radiocu.com'da kesintisiz müzik.`;
        const keywords = station.seoKeywords || `${station.name}, ${station.name} canlı, radyo dinle`;

        document.title = title;

        const setMeta = (name, content, prop = 'name') => {
            let el = document.querySelector(`meta[${prop}="${name}"]`);
            if (!el) { el = document.createElement('meta'); el.setAttribute(prop, name); document.head.appendChild(el); }
            el.setAttribute('content', content);
        };

        setMeta('description', description);
        setMeta('keywords', keywords);
        setMeta('og:title', title, 'property');
        setMeta('og:description', description, 'property');
        setMeta('og:type', 'website', 'property');
        setMeta('og:url', window.location.href, 'property');
        if (station.logo) setMeta('og:image', station.logo, 'property');
        setMeta('twitter:card', 'summary');
        setMeta('twitter:title', title, 'property');
        setMeta('twitter:description', description, 'property');

        // Canonical link
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
        canonical.href = window.location.href;

        return () => {
            // Restore default title on unmount
            document.title = 'Radiocu — Canlı Radyo Dinle';
        };
    }, [station]);

    const isActive = currentStation?.stationuuid === station?.stationuuid || currentStation?.id === station?.id;
    const countryLower = (countryCode || station?.country || 'tr').toLowerCase();

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-gray-950">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#ff7eeb] border-t-transparent rounded-full animate-spin" />
                <span className="text-slate-400 text-sm">Yükleniyor...</span>
            </div>
        </div>
    );

    if (notFound) return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-white gap-4">
            <span className="text-6xl">📻</span>
            <h1 className="text-2xl font-bold">Radyo Bulunamadı</h1>
            <p className="text-slate-400">Bu radyo sayfası mevcut değil veya kaldırılmış olabilir.</p>
            <Link to={`/${countryLower}`} className="mt-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 rounded-xl text-white font-bold transition">
                Ana Sayfaya Dön
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* SEO H1 (görünmez ama Google okur) */}
            <h1 className="sr-only">{station.seoTitle || `${station.name} Canlı Dinle`}</h1>

            {/* Header bar */}
            <div className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span className="text-sm text-slate-400">Radiocu</span>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
                {/* Station Identity */}
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-28 h-28 rounded-2xl bg-gray-800 border border-white/10 overflow-hidden shadow-2xl">
                        {station.logo ? (
                            <img src={station.logo} alt={`${station.name} logo`} className="w-full h-full object-cover"
                                onError={e => { e.target.style.display = 'none'; }} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl">📻</div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-wider text-[#39FF14]">Canlı Yayın</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white">{station.name}</h2>
                        <p className="text-slate-400 text-sm mt-1 capitalize">
                            {station.tag || 'Radyo'} {station.country ? `• ${station.country}` : ''}
                        </p>
                    </div>
                </div>

                {/* Play Button */}
                <div className="flex justify-center">
                    <button
                        onClick={() => onPlayStation && onPlayStation(station)}
                        className={`flex items-center gap-3 px-10 py-4 rounded-2xl text-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-xl ${
                            isActive && isPlaying
                                ? 'bg-gray-700 text-white'
                                : 'bg-teal-600 hover:bg-teal-500 text-white'
                        }`}
                    >
                        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {isActive && isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                        {isActive && isPlaying ? 'Dinleniyor' : 'Dinle'}
                    </button>
                </div>

                {/* SEO Description (Google için içerik) */}
                {station.seoDescription && (
                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-2">{station.name} Hakkında</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">{station.seoDescription}</p>
                    </div>
                )}

                {/* Station Details */}
                <div className="grid grid-cols-2 gap-3">
                    {station.tag && (
                        <div className="bg-gray-900 rounded-xl p-4 border border-white/5">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Tür</p>
                            <p className="text-white font-semibold capitalize">{station.tag}</p>
                        </div>
                    )}
                    {station.country && (
                        <div className="bg-gray-900 rounded-xl p-4 border border-white/5">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Ülke</p>
                            <p className="text-white font-semibold">{station.country}</p>
                        </div>
                    )}
                </div>

                {/* Back link */}
                <div className="text-center pt-4">
                    <Link to={`/${countryLower}`}
                        className="text-sm text-slate-400 hover:text-teal-400 transition underline underline-offset-4">
                        ← Tüm {station.country || ''} Radyoları
                    </Link>
                </div>
            </div>
        </div>
    );
}
