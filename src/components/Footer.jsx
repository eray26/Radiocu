import React from 'react';
import { Link, useParams } from 'react-router-dom';

export default function Footer({ appLang, onOpenAdmin }) {
    const { countryCode } = useParams();
    const base = `/${(countryCode || 'tr').toLowerCase()}`;

    return (
        <footer className="w-full py-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0a0e14] border-t border-[#20262f]/15 relative z-40 px-4 md:px-8 mt-auto shrink-0 pb-28 md:pb-32">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
                <span className="text-xl font-bold tracking-tighter text-[#ff7eeb] font-headline">radiocu.com</span>
                <p className="text-[10px] md:text-sm text-on-surface-variant font-label max-w-xs md:max-w-md">
                    {appLang === 'TR'
                        ? 'Sınır tanımayan müzik ve ses deneyimi. Dünyanın her yerinden radyo istasyonları.'
                        : 'Music and sound experiences across borders. Radio stations from all around the world.'}
                </p>
                <div className="flex md:hidden items-center gap-3 mt-2">
                    <button className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface hover:text-[#00e3fd] hover:border-[#00e3fd]/50 transition-colors">
                        <span className="material-symbols-outlined text-sm">share</span>
                    </button>
                    <button className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface hover:text-[#00e3fd] hover:border-[#00e3fd]/50 transition-colors">
                        <span className="material-symbols-outlined text-sm">language</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-3 md:gap-4 mt-2 md:mt-0">
                <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6">
                    <Link to={`${base}/about`} className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-[#00e3fd] transition-colors">
                        {appLang === 'TR' ? 'Hakkımızda' : 'About Us'}
                    </Link>
                    <Link to={`${base}/contact`} className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-[#00e3fd] transition-colors">
                        {appLang === 'TR' ? 'İletişim' : 'Contact'}
                    </Link>
                    <Link to={`${base}/privacy`} className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-[#00e3fd] transition-colors">
                        {appLang === 'TR' ? 'Gizlilik Politikası' : 'Privacy Policy'}
                    </Link>
                    <button
                        onClick={onOpenAdmin}
                        className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/50 hover:text-primary transition-colors"
                    >
                        Admin
                    </button>
                </div>
                <div className="flex items-center gap-4 mt-2 md:mt-0">
                    <span className="text-[10px] font-label text-on-surface-variant/50">
                        © {new Date().getFullYear()} Radiocu. {appLang === 'TR' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}
                    </span>
                    <div className="hidden md:flex items-center gap-2">
                        <button className="w-6 h-6 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-[#00e3fd] hover:border-[#00e3fd]/50 transition-colors">
                            <span className="material-symbols-outlined text-[10px]">share</span>
                        </button>
                        <button className="w-6 h-6 rounded-full border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-[#00e3fd] hover:border-[#00e3fd]/50 transition-colors">
                            <span className="material-symbols-outlined text-[10px]">language</span>
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
