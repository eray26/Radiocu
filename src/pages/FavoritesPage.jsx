import React from 'react';
import { Heart, Radio, Trash2 } from 'lucide-react';
import StationCard from '../components/StationCard';
import Footer from '../components/Footer';

export default function FavoritesPage({
    favorites,
    currentStation,
    isPlaying,
    appLang,
    onPlayStation,
    onToggleFavorite,
    onClearFavorites,
    selectedCountry,
    onOpenAdmin,
}) {
    return (
        <>
            <main className="flex-1 p-4 md:p-8 relative min-w-0 z-10 w-full min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)]">
                <div className="max-w-7xl mx-auto">
                    {/* ===== HEADER ===== */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-2xl md:text-4xl font-extrabold text-[#f1f3fc] flex items-center gap-3">
                                <span className="material-symbols-outlined text-[32px] md:text-[40px] text-[#ff7eeb]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                {appLang === 'TR' ? 'Favorilerim' : 'My Favorites'}
                            </h1>

                            {favorites.length > 0 && (
                                <button
                                    onClick={onClearFavorites}
                                    className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-[#ff6e84] hover:bg-[#ff6e84]/10 transition glass-card px-3 py-2 rounded-xl border border-outline-variant/20 hover:border-[#ff6e84]/30"
                                >
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                    {appLang === 'TR' ? 'Tümünü Temizle' : 'Clear All'}
                                </button>
                            )}
                        </div>
                        <p className="text-on-surface-variant text-sm font-label uppercase tracking-widest mt-4">
                            {favorites.length > 0
                                ? (appLang === 'TR'
                                    ? `${favorites.length} favori istasyonunuz var`
                                    : `You have ${favorites.length} favorite station${favorites.length > 1 ? 's' : ''}`)
                                : (appLang === 'TR'
                                    ? 'Henüz favori istasyonunuz yok'
                                    : 'No favorite stations yet')
                            }
                        </p>
                    </div>

                    {/* ===== FAVORITES GRID ===== */}
                    {favorites.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
                            {favorites.map((s) => (
                                <StationCard
                                    key={s.stationuuid}
                                    station={s}
                                    isActive={currentStation?.stationuuid === s.stationuuid}
                                    isPlaying={isPlaying && currentStation?.stationuuid === s.stationuuid}
                                    isFavorite={true}
                                    onPlay={onPlayStation}
                                    onToggleFavorite={onToggleFavorite}
                                    countryCode={s.countrycode || selectedCountry}
                                />
                            ))}
                        </div>
                    ) : (
                        /* ===== EMPTY STATE ===== */
                        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
                            <div className="w-24 h-24 rounded-3xl bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center mb-6 shadow-xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-[#ff7eeb]/5 blur-xl"></div>
                                <span className="material-symbols-outlined text-[48px] text-on-surface-variant relative z-10" style={{ fontVariationSettings: "'FILL' 0" }}>favorite_border</span>
                            </div>
                            <h2 className="text-xl font-headline font-bold text-[#f1f3fc] mb-3">
                                {appLang === 'TR' ? 'Favori listesi boş' : 'Favorites list is empty'}
                            </h2>
                            <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed font-body">
                                {appLang === 'TR'
                                    ? 'Radyo kartlarındaki kalp ikonuna tıklayarak istasyonları favorilerinize ekleyebilirsiniz.'
                                    : 'Click the heart icon on any station card to add it to your favorites.'}
                            </p>
                        </div>
                    )}
                </div>
            </main>
            <Footer appLang={appLang} onOpenAdmin={onOpenAdmin} />
        </>
    );
}
