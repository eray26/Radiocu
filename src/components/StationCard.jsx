import React, { useMemo } from 'react';
import { getCityImage } from '../data/cityImages';

export default function StationCard({
    station,
    isActive,
    isPlaying,
    isFavorite,
    onPlay,
    onToggleFavorite,
    countryCode,
}) {
    const cityImage = getCityImage(countryCode, station.name);
    // Use station favicon if available, fallback to cityImage
    const stationLogo = station.favicon || cityImage;
    const genre = station.tags ? station.tags.split(',')[0].trim() : 'Radio';
    const bitrate = station.bitrate ? `${station.bitrate}kbps` : 'Stream';
    const listeners = useMemo(() => station.votes
        ? Math.max(station.votes, Math.floor(Math.random() * 500) + 50)
        : Math.floor(Math.random() * 800) + 100, [station.votes]);

    return (
        <div 
            onClick={(e) => {
                if (e.target.closest('.fav-btn')) return;
                onPlay(station);
            }}
            className={`group relative rounded-xl p-5 md:p-6 transition-all duration-500 md:hover:-translate-y-2 border overflow-hidden glass-card cursor-pointer
            ${isActive ? 'border-primary/50 bg-surface-container' : 'border-transparent hover:border-secondary/20 hover:bg-surface-container surface-container-low'}`}
        >
            {/* Ambient Background Glow */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl transition-all ${isActive ? 'bg-primary/20' : 'bg-secondary/5 group-hover:bg-secondary/10'}`}></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-surface-container-highest flex items-center justify-center border border-outline-variant/20 shadow-xl overflow-hidden relative">
                    <img 
                        alt="Station Logo" 
                        className="w-full h-full object-cover" 
                        src={stationLogo}
                        onError={(e) => { e.target.src = cityImage; }} 
                    />
                    {/* Equalizer overlay when playing */}
                    {isActive && isPlaying && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center gap-[2px]">
                            <div className="w-[3px] bg-primary animate-eq-1 rounded-full"></div>
                            <div className="w-[3px] bg-primary animate-eq-2 rounded-full"></div>
                            <div className="w-[3px] bg-primary animate-eq-3 rounded-full"></div>
                        </div>
                    )}
                </div>
                
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full neon-pulse ${isActive ? 'bg-primary' : 'bg-[#39FF14]'}`} style={!isActive ? {backgroundColor: '#39FF14'} : {}}></span>
                        <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'text-primary' : 'text-[#39FF14]'}`} style={!isActive ? {color: '#39FF14'} : {}}>
                            {isActive && isPlaying ? 'Playing' : 'Live'}
                        </span>
                    </div>

                    <button 
                        className="fav-btn p-1.5 rounded-full hover:bg-white/10 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(station);
                        }}
                    >
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: `'FILL' ${isFavorite ? 1 : 0}`, color: isFavorite ? '#ff7eeb' : '#a8abb3' }}>
                            favorite
                        </span>
                    </button>
                </div>
            </div>
            
            <div className="relative z-10">
                <h3 className={`text-xl md:text-2xl font-headline font-bold mb-1 line-clamp-1 ${isActive ? 'text-primary' : 'text-on-surface'}`}>
                    {station.name}
                </h3>
                <p className="text-xs text-on-surface-variant font-label uppercase tracking-wider capitalize">
                    {genre} • {bitrate}
                </p>
            </div>
            
            <div className="mt-6 flex items-center justify-between relative z-10">
                <div className="flex -space-x-2 items-center">
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full border-2 border-surface bg-blue-500"></div>
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full border-2 border-surface bg-purple-500"></div>
                    <span className="text-[10px] text-on-surface-variant ml-4 font-medium pl-1">
                        {listeners.toLocaleString()}
                    </span>
                </div>
                
                <button className={`w-12 h-12 md:w-12 md:h-12 rounded-full flex items-center justify-center text-on-primary shadow-lg hover:scale-110 active:scale-95 transition-transform ${isActive ? 'bg-surface-tint' : 'bg-primary'}`}>
                    <span className="material-symbols-outlined text-3xl md:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {isActive && isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                </button>
            </div>
            
            {/* Manual station indicator */}
            {station.is_manual && (
                <div className="absolute bottom-4 right-4 flex items-center gap-1 opacity-50">
                    <span className="material-symbols-outlined text-[10px] text-primary">verified</span>
                </div>
            )}
        </div>
    );
}
