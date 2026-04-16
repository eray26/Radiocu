import React, { useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import StationCard from '../components/StationCard';
import Footer from '../components/Footer';

// Blog & FAQ sections (kept for AdSense content value)
import { BlogSection, FAQSection, FeaturesSection, SeoContent, AdSenseUnit } from './ContentSections';

const GENRE_ICONS = {
    all: 'apps',
    pop: 'music_note',
    rock: 'electric_bolt',
    jazz: 'straighten',
    electronic: 'settings_input_component',
    dance: 'sensors',
    news: 'article',
    classical: 'piano',
    folk: 'nature_people',
    rap: 'mic',
    arabesque: 'music_video'
};

export default function HomePage({
    filteredStations,
    loading,
    error,
    selectedCountry,
    countriesList,
    currentStation,
    isPlaying,
    favorites,
    appLang,
    onPlayStation,
    onToggleFavorite,
    onRefresh,
    onOpenAdmin,
    genres,
    selectedGenre,
    setSelectedGenre,
}) {
    const t = {
        hero: appLang === 'TR' ? 'İstanbul\'dan Canlı Yayın' : 'Streaming Live From Istanbul',
        heroSub: appLang === 'TR'
            ? 'Dijital çağ için özenle seçilmiş elektronik ve pop frekansları.'
            : 'Curated electronic and pop waves for the digital era.',
        popular: appLang === 'TR' ? 'Popüler İstasyonlar' : 'Popular Stations',
        retry: appLang === 'TR' ? 'Tekrar Dene' : 'Retry',
        errorMsg: appLang === 'TR' ? 'Liste alınamadı.' : 'Failed to load.',
        categories: appLang === 'TR' ? 'Kategoriler' : 'Categories',
        liveStreams: appLang === 'TR' ? 'Canlı Yayınlar' : 'Live Streams',
        channelsOnline: appLang === 'TR' ? 'Kanal Aktif' : 'Channels Online',
    };

    const genreLabels = {
        all: appLang === 'TR' ? 'Tümü' : 'All',
        pop: 'Pop', rock: 'Rock', jazz: 'Jazz', news: appLang === 'TR' ? 'Haberler' : 'News',
        classical: appLang === 'TR' ? 'Klasik' : 'Classical', dance: 'Dance', folk: 'Folk', rap: 'Rap',
        arabesque: appLang === 'TR' ? 'Arabesk' : 'Arabesque',
        electronic: 'Electronic'
    };

    // Filter by genre
    const genreFiltered = useMemo(() => {
        if (!selectedGenre || selectedGenre === 'all') return filteredStations;
        return filteredStations.filter(s =>
            (s.tags || '').toLowerCase().includes(selectedGenre.toLowerCase())
        );
    }, [filteredStations, selectedGenre]);

    const activeCount = genreFiltered.length;

    return (
        <>
            <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)]">
                {/* SideNavBar / Mobile Horizontal Scroll */}
                <aside className="w-full md:w-64 bg-[#0a0e14] border-b md:border-b-0 md:border-r border-[#20262f]/15 shadow-[0_0_15px_rgba(0,227,253,0.08)] z-40 md:sticky md:top-0 md:self-start md:h-[calc(100vh-80px)] flex flex-col">
                    <div className="hidden md:block px-8 py-6 mb-2 shrink-0">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-2 h-2 rounded-full bg-secondary neon-pulse"></div>
                            <span className="text-lg font-black text-[#ff7eeb] font-headline uppercase tracking-tighter">
                                {t.categories}
                            </span>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 font-label">
                            {t.liveStreams}
                        </p>
                    </div>
                    <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto hide-scrollbar whitespace-nowrap flex-1">
                        {genres.map(genre => (
                            <button
                                key={genre}
                                onClick={() => setSelectedGenre(genre)}
                                className={`flex items-center gap-3 md:gap-4 px-6 md:px-8 py-4 transition-all border-b-2 md:border-b-0 md:border-r-2 ${selectedGenre === genre
                                        ? 'text-[#00e3fd] font-bold border-[#00e3fd] bg-[#0f141a]'
                                        : 'text-slate-400 hover:text-[#00e3fd] hover:bg-[#20262f]/30 border-transparent'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-xl" data-icon={GENRE_ICONS[genre] || 'radio'}>
                                    {GENRE_ICONS[genre] || 'radio'}
                                </span>
                                <span className="font-body text-sm capitalize">
                                    {genreLabels[genre] || genre}
                                </span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 bg-atmosphere p-4 md:p-8 relative min-w-0">
                    <div className="max-w-7xl mx-auto relative z-10">
                        {/* HERO */}
                        <div className="mb-8 md:mb-12">
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-headline font-bold text-on-surface tracking-tighter mb-4 leading-tight">
                                {appLang === 'TR' ? (
                                    <>Bölgeden <span className="text-primary italic">Canlı</span> Yayınlar</>
                                ) : (
                                    <>Streaming <span className="text-primary italic">Live</span> Now</>
                                )}
                            </h1>
                            <div className="flex flex-col md:flex-row gap-3 md:gap-4 md:items-center">
                                <span className="inline-block w-fit px-3 py-1 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-widest border border-secondary/20">
                                    {activeCount} {t.channelsOnline}
                                </span>
                                <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                                <p className="text-on-surface-variant text-sm font-body">{t.heroSub}</p>
                                
                                <button onClick={onRefresh} className="ml-0 md:ml-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
                                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-primary' : ''}`} />
                                    {appLang === 'TR' ? 'Yenile' : 'Refresh'}
                                </button>
                            </div>
                        </div>

                        {/* ERROR STATE */}
                        {error && (
                            <div className="mb-8 p-6 bg-error-container/10 border border-error/20 rounded-2xl flex flex-col items-center text-center gap-3 animate-fade-in glass-card">
                                <span className="material-symbols-outlined text-error text-4xl">error</span>
                                <p className="text-error-container text-sm font-body">{t.errorMsg}</p>
                                <button
                                    onClick={onRefresh}
                                    className="px-5 py-2.5 bg-error/20 hover:bg-error/30 text-error rounded-xl text-sm transition-all flex items-center gap-2 border border-error/20 font-bold"
                                >
                                    <RefreshCw className="w-4 h-4" /> {t.retry}
                                </button>
                            </div>
                        )}

                        <AdSenseUnit slotId="header-ad" loading={loading} />

                        {/* STATIONS GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-8">
                            {loading
                                ? [...Array(8)].map((_, i) => (
                                    <div key={i} className="h-40 sm:h-48 bg-surface-container-highest rounded-xl animate-pulse border border-outline-variant/10 glass-card" />
                                ))
                                : genreFiltered.map((s, idx) => (
                                    <StationCard
                                        key={s.stationuuid}
                                        station={s}
                                        index={idx}
                                        isActive={currentStation?.stationuuid === s.stationuuid}
                                        isPlaying={isPlaying && currentStation?.stationuuid === s.stationuuid}
                                        isFavorite={favorites.some(f => f.stationuuid === s.stationuuid)}
                                        onPlay={onPlayStation}
                                        onToggleFavorite={onToggleFavorite}
                                        countryCode={selectedCountry}
                                    />
                                ))
                            }
                        </div>

                        {/* BOTTOM SEO CONTENT AND ADS */}
                        <div className="mt-16 space-y-12">
                            <AdSenseUnit slotId="content-ad" loading={loading} />
                            <FeaturesSection lang={appLang} />
                            <BlogSection lang={appLang} />
                            <SeoContent country={selectedCountry} lang={appLang} countriesList={countriesList} />
                            <FAQSection lang={appLang} />
                        </div>
                    </div>
                </main>
            </div>
            
            <Footer appLang={appLang} onOpenAdmin={onOpenAdmin} />
        </>
    );
}
