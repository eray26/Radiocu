import React, { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';

export default function Header({
    countriesList,
    selectedCountry,
    onCountryChange,
    appLang,
    searchQuery,
    setSearchQuery,
}) {
    const { countryCode } = useParams();
    const base = `/${(countryCode || selectedCountry || 'tr').toLowerCase()}`;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="relative bg-[#0f141a] dark:bg-[#0a0e14] flex justify-between items-center px-4 md:px-8 h-16 md:h-20 w-full sticky top-0 z-50 border-b border-[#20262f]/10">
            <div className="flex items-center gap-6 md:gap-10">
                <NavLink to={base} className="text-2xl md:text-3xl font-bold tracking-tighter text-[#ff7eeb] font-headline relative z-10">
                    radiocu.com
                </NavLink>
            </div>

            <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 whitespace-nowrap">
                <NavLink
                    to={base}
                    end
                    className={({ isActive }) =>
                        `font-label text-xs md:text-[13px] uppercase tracking-[0.15em] font-medium transition-colors ${isActive ? 'text-[#ff7eeb] border-b-2 border-[#ff7eeb] pb-1.5' : 'text-slate-400 hover:text-[#ff7eeb]'
                        }`
                    }
                >
                    {appLang === 'TR' ? 'Ana Sayfa' : 'Home'}
                </NavLink>
                <NavLink
                    to={`${base}/about`}
                    className={({ isActive }) =>
                        `font-label text-xs md:text-[13px] uppercase tracking-[0.15em] font-medium transition-colors ${isActive ? 'text-[#ff7eeb] border-b-2 border-[#ff7eeb] pb-1.5' : 'text-slate-400 hover:text-[#ff7eeb]'
                        }`
                    }
                >
                    {appLang === 'TR' ? 'Hakkımızda' : 'About'}
                </NavLink>
                <NavLink
                    to={`${base}/contact`}
                    className={({ isActive }) =>
                        `font-label text-xs md:text-[13px] uppercase tracking-[0.15em] font-medium transition-colors ${isActive ? 'text-[#ff7eeb] border-b-2 border-[#ff7eeb] pb-1.5' : 'text-slate-400 hover:text-[#ff7eeb]'
                        }`
                    }
                >
                    {appLang === 'TR' ? 'İletişim' : 'Contact'}
                </NavLink>
            </nav>

            <div className="flex items-center gap-2 md:gap-4 relative z-10">
                {/* Search Bar - Hidden on small screen unless toggled, but as per design, visible on lg */}
                <div className="hidden lg:flex items-center bg-surface-container-highest px-4 py-2 rounded-full border border-outline-variant/15 transition-all focus-within:border-primary/50">
                    <span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
                    <input
                        className="bg-transparent border-none focus:ring-0 text-sm text-on-surface ml-2 w-48 outline-none placeholder-on-surface-variant/50"
                        placeholder={appLang === 'TR' ? 'Radyo ara...' : 'Search frequencies...'}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Country / Language selection dropdown styling hack */}
                <div className="relative group flex items-center">
                    <button className="hover:bg-[#20262f]/50 transition-all duration-300 p-1.5 md:p-2 rounded-full text-[#ff7eeb]">
                        <span className="material-symbols-outlined">public</span>
                    </button>
                    <select
                        value={selectedCountry}
                        onChange={(e) => onCountryChange(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    >
                        {countriesList.map(c => (
                            <option key={c.code} value={c.code} className="bg-slate-900 text-white">{c.flag} {c.name}</option>
                        ))}
                    </select>
                </div>


                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-1.5 text-[#ff7eeb] hover:bg-[#20262f]/50 rounded-full"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
                </button>
            </div>

            {/* Mobile Nav */}
            {mobileMenuOpen && (
                <div className="absolute top-[100%] left-0 w-full bg-[#0a0e14]/95 backdrop-blur-md border-b border-primary/20 p-4 flex flex-col gap-4 animate-slide-up z-40 md:hidden">
                    <NavLink
                        to={base}
                        end
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) => `px-4 py-2 rounded-lg font-label text-sm uppercase tracking-widest ${isActive ? 'bg-primary/20 text-[#ff7eeb]' : 'text-on-surface hover:bg-[#20262f]'}`}
                    >
                        {appLang === 'TR' ? 'Ana Sayfa' : 'Home'}
                    </NavLink>
                    <NavLink
                        to={`${base}/about`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) => `px-4 py-2 rounded-lg font-label text-sm uppercase tracking-widest ${isActive ? 'bg-primary/20 text-[#ff7eeb]' : 'text-on-surface hover:bg-[#20262f]'}`}
                    >
                        {appLang === 'TR' ? 'Hakkımızda' : 'About'}
                    </NavLink>
                    <NavLink
                        to={`${base}/contact`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) => `px-4 py-2 rounded-lg font-label text-sm uppercase tracking-widest ${isActive ? 'bg-primary/20 text-[#ff7eeb]' : 'text-on-surface hover:bg-[#20262f]'}`}
                    >
                        {appLang === 'TR' ? 'İletişim' : 'Contact'}
                    </NavLink>

                    <div className="flex items-center bg-surface-container-highest px-4 py-2 rounded-lg border border-outline-variant/15 mt-2">
                        <span className="material-symbols-outlined text-on-surface-variant text-sm">search</span>
                        <input
                            className="bg-transparent border-none focus:ring-0 text-sm text-on-surface ml-2 w-full outline-none placeholder-on-surface-variant/50"
                            placeholder={appLang === 'TR' ? 'Radyo ara...' : 'Search frequencies...'}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            )}
        </header>
    );
}
