import React from 'react';

export default function PlayerBar({
    currentStation,
    isPlaying,
    isBuffering,
    volume,
    setVolume,
    onPlayPause,
    onNext,
    onPrev,
    appLang,
}) {
    return (
        <div className="h-20 bg-[#0a0e14]/90 backdrop-blur-xl border-t border-[#20262f]/30 fixed bottom-0 left-0 w-full flex items-center justify-between px-4 md:px-8 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
            
            {/* Left: Station info */}
            <div className="w-1/3 flex items-center gap-4 min-w-0">
                {currentStation ? (
                    <>
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-surface-container-highest border border-outline-variant/20 hidden sm:flex items-center justify-center relative overflow-hidden shadow-lg shrink-0">
                            {currentStation.favicon ? (
                                <img src={currentStation.favicon} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-[#ff7eeb] text-[28px]">radio</span>
                            )}
                            {isPlaying && (
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-[1px] gap-[2px]">
                                    <div className="flex items-end gap-[2px] h-4">
                                        <div className="w-1 bg-[#ff7eeb] animate-eq-1 rounded-full"></div>
                                        <div className="w-1 bg-[#ff7eeb] animate-eq-2 rounded-full"></div>
                                        <div className="w-1 bg-[#ff7eeb] animate-eq-3 rounded-full"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex flex-col justify-center">
                            <h4 className="text-[#f1f3fc] font-headline font-bold text-sm md:text-base truncate tracking-tight mb-0.5">
                                {currentStation.name}
                            </h4>
                            <div className="flex items-center gap-1.5">
                                {isBuffering ? (
                                    <span className="text-[10px] md:text-xs font-label text-secondary uppercase tracking-widest flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                                        {appLang === 'TR' ? 'Yükleniyor...' : 'Loading...'}
                                    </span>
                                ) : (
                                    <span className="text-[10px] md:text-xs font-label text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#39FF14] neon-pulse' : 'bg-outline'}`} style={!isPlaying ? {} : {backgroundColor: '#39FF14'}}></span>
                                        {isPlaying
                                            ? (appLang === 'TR' ? 'CANLI YAYIN' : 'ON AIR')
                                            : (appLang === 'TR' ? 'DURAKLATILDI' : 'PAUSED')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-on-surface-variant text-xs font-label uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">sensors</span>
                        {appLang === 'TR' ? 'İstasyon Seçilmedi' : 'No Station Selected'}
                    </div>
                )}
            </div>

            {/* Center: Controls */}
            <div className="w-1/3 flex justify-center items-center gap-4 md:gap-6">
                <button
                    onClick={onPrev}
                    className="text-on-surface-variant hover:text-[#00e3fd] transition-colors"
                >
                    <span className="material-symbols-outlined text-2xl md:text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>skip_previous</span>
                </button>

                <button
                    onClick={onPlayPause}
                    disabled={!currentStation || isBuffering}
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all ${
                        !currentStation
                            ? 'bg-surface-container-highest text-outline cursor-not-allowed'
                            : 'bg-[#ff7eeb] text-[#0a0e14] hover:scale-105 hover:bg-[#ff56ed] shadow-[0_0_15px_rgba(255,126,235,0.4)]'
                    }`}
                >
                    {isBuffering ? (
                        <span className="material-symbols-outlined text-[28px] animate-spin">sync</span>
                    ) : isPlaying ? (
                        <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>pause</span>
                    ) : (
                        <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    )}
                </button>

                <button
                    onClick={onNext}
                    className="text-on-surface-variant hover:text-[#00e3fd] transition-colors"
                >
                    <span className="material-symbols-outlined text-2xl md:text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>skip_next</span>
                </button>
            </div>

            {/* Right: Volume */}
            <div className="w-1/3 flex justify-end items-center gap-2 md:gap-3">
                <button
                    onClick={() => setVolume(v => v === 0 ? 0.8 : 0)}
                    className="text-on-surface-variant hover:text-[#ff7eeb] transition-colors hidden sm:block"
                >
                    <span className="material-symbols-outlined text-xl">
                        {volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
                    </span>
                </button>
                <div className="relative flex items-center w-20 md:w-28 group">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full h-1 bg-[#20262f] rounded-full appearance-none cursor-pointer outline-none z-10"
                        style={{
                            background: `linear-gradient(to right, #00e3fd ${volume * 100}%, #20262f ${volume * 100}%)`,
                        }}
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#00e3fd] text-[#0a0e14] text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {Math.round(volume * 100)}%
                    </div>
                </div>
            </div>

        </div>
    );
}
