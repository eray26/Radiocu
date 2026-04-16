import React, { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import StationCard from '../components/StationCard';
import Footer from '../components/Footer';

export default function SearchPage({
    filteredStations,
    loading,
    selectedCountry,
    currentStation,
    isPlaying,
    favorites,
    appLang,
    searchQuery,
    setSearchQuery,
    onPlayStation,
    onToggleFavorite,
    genres,
    onOpenAdmin,
}) {
    const [selectedGenre, setSelectedGenre] = useState('all');

    const genreLabels = {
        all: appLang === 'TR' ? 'Tümü' : 'All',
        pop: 'Pop', rock: 'Rock', jazz: 'Jazz', news: appLang === 'TR' ? 'Haberler' : 'News',
        classical: appLang === 'TR' ? 'Klasik' : 'Classical', dance: 'Dance', folk: 'Folk', rap: 'Rap',
        arabesque: appLang === 'TR' ? 'Arabesk' : 'Arabesque'
    };

    const results = useMemo(() => {
        let list = filteredStations;
        if (selectedGenre && selectedGenre !== 'all') {
            list = list.filter(s =>
                (s.tags || '').toLowerCase().includes(selectedGenre.toLowerCase())
            );
        }
        return list;
    }, [filteredStations, selectedGenre]);

    const hasActiveFilters = searchQuery || selectedGenre !== 'all';

    return (
        <>
            <main className="flex-1 p-4 md:p-8 relative min-w-0 z-10 w-full min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)]">
                <div className="max-w-7xl mx-auto">
                    {/* ===== SEARCH HERO ===== */}
                    <div className="mb-10 mt-4 md:mt-8">
                        <h1 className="text-3xl md:text-5xl font-headline font-bold text-[#f1f3fc] mb-4 tracking-tighter">
                            {appLang === 'TR' ? 'Radyo Ara' : 'Search Stations'}
                        </h1>
                        <p className="text-on-surface-variant text-sm md:text-base font-body max-w-2xl mb-8">
                            {appLang === 'TR'
                                ? 'Binlerce radyo frekansı arasında isim, tür veya etiket ile arama yapın'
                                : 'Search through thousands of frequencies by name, genre, or tag'}
                        </p>

                        <div className="flex items-center w-full glass-card rounded-2xl px-6 py-4 md:py-5 border border-outline-variant/30 focus-within:border-primary/50 transition-all duration-300 shadow-xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                            <span className="material-symbols-outlined text-[#00e3fd] text-[24px] mr-4 shrink-0 relative z-10">search</span>
                            <input
                                type="text"
                                placeholder={appLang === 'TR' ? 'İstasyon ara...' : 'Search for stations...'}
                                className="bg-transparent w-full border-none outline-none text-lg text-on-surface placeholder-on-surface-variant font-body relative z-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="text-on-surface-variant hover:text-primary transition ml-2 p-2 rounded-full hover:bg-primary/10 relative z-10"
                                >
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ===== FILTERS ===== */}
                    <div className="mb-8">
                        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
                            {genres.map(genre => (
                                <button
                                    key={genre}
                                    onClick={() => setSelectedGenre(genre)}
                                    className={`px-5 py-2.5 rounded-full text-sm font-label uppercase tracking-widest border transition-all whitespace-nowrap ${
                                        selectedGenre === genre
                                            ? 'bg-primary/20 text-primary border-primary/50'
                                            : 'bg-surface-container text-on-surface-variant border-transparent hover:bg-surface-container-high hover:text-[#f1f3fc]'
                                    }`}
                                >
                                    {genreLabels[genre] || genre}
                                </button>
                            ))}
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <div className="mb-8 flex items-center gap-3 text-sm flex-wrap">
                            <span className="text-on-surface-variant font-label uppercase tracking-widest text-xs">
                                {appLang === 'TR' ? 'Aktif Filtreler:' : 'Active Filters:'}
                            </span>
                            {selectedGenre !== 'all' && (
                                <span className="bg-primary/15 text-primary px-3 py-1.5 rounded-lg text-xs font-bold border border-primary/20 flex items-center gap-2">
                                    {genreLabels[selectedGenre] || selectedGenre}
                                    <button onClick={() => setSelectedGenre('all')} className="hover:text-[#f1f3fc]"><span className="material-symbols-outlined text-[14px]">close</span></button>
                                </span>
                            )}
                            {searchQuery && (
                                <span className="bg-[#00e3fd]/15 text-[#00e3fd] px-3 py-1.5 rounded-lg text-xs font-bold border border-[#00e3fd]/20 flex items-center gap-2">
                                    "{searchQuery}"
                                    <button onClick={() => setSearchQuery('')} className="hover:text-[#f1f3fc]"><span className="material-symbols-outlined text-[14px]">close</span></button>
                                </span>
                            )}
                        </div>
                    )}

                    {/* ===== RESULTS COUNT ===== */}
                    <div className="mb-6 flex items-center justify-between">
                        <p className="text-xs text-on-surface-variant font-label uppercase tracking-widest">
                            {results.length} {appLang === 'TR' ? 'bulunan sonuç' : 'results found'}
                        </p>
                    </div>

                    {/* ===== RESULTS GRID ===== */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-12">
                        {loading ? (
                            [...Array(8)].map((_, i) => (
                                <div key={i} className="h-48 sm:h-52 bg-surface-container-highest rounded-xl animate-pulse border border-outline-variant/10 glass-card" />
                            ))
                        ) : results.length === 0 ? (
                            <div className="col-span-full py-20 flex flex-col items-center text-center animate-fade-in">
                                <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30 mb-6 font-thin">radio</span>
                                <h3 className="text-xl font-headline font-bold text-[#f1f3fc] mb-3">
                                    {appLang === 'TR' ? 'Sonuç bulunamadı' : 'No results found'}
                               </h3>
                                <p className="text-sm text-on-surface-variant font-body">
                                    {appLang === 'TR' ? 'Farklı anahtar kelimeler ile tekrar deneyin' : 'Try different keywords'}
                                </p>
                            </div>
                        ) : (
                            results.map((s) => (
                                <StationCard
                                    key={s.stationuuid}
                                    station={s}
                                    isActive={currentStation?.stationuuid === s.stationuuid}
                                    isPlaying={isPlaying && currentStation?.stationuuid === s.stationuuid}
                                    isFavorite={favorites.some(f => f.stationuuid === s.stationuuid)}
                                    onPlay={onPlayStation}
                                    onToggleFavorite={onToggleFavorite}
                                    countryCode={selectedCountry}
                                />
                            ))
                        )}
                    </div>
                </div>
            </main>
            <Footer appLang={appLang} onOpenAdmin={onOpenAdmin} />
        </>
    );
}
