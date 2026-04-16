import React from 'react';
import Footer from '../components/Footer';

export default function AboutPage({ appLang, onOpenAdmin }) {
    return (
        <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] flex flex-col bg-atmosphere">
            <main className="flex-1 p-4 md:p-8 relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
                
                <div className="text-center mb-12 mt-10">
                    <h1 className="text-4xl md:text-6xl font-headline font-bold text-on-surface tracking-tighter mb-4">
                        {appLang === 'TR' ? 'Hakkımızda' : 'About Us'}
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mb-6"></div>
                    <p className="text-on-surface-variant font-label max-w-2xl mx-auto text-lg">
                        {appLang === 'TR' ? 'Müziğin ve sesin birleştirici gücüne inanıyoruz.' : 'We believe in the unifying power of music and sound.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-16">
                    {/* Vision Card */}
                    <div className="glass-card surface-container-low rounded-2xl p-8 border border-primary/20 relative group overflow-hidden transition-all hover:border-primary/50">
                        <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/10 rounded-full blur-3xl transition-all group-hover:bg-primary/20"></div>
                        <span className="material-symbols-outlined text-4xl text-primary mb-6 block">visibility</span>
                        <h2 className="text-2xl font-headline font-bold text-on-surface mb-4">
                            {appLang === 'TR' ? 'Vizyonumuz' : 'Our Vision'}
                        </h2>
                        <p className="text-on-surface-variant leading-relaxed">
                            {appLang === 'TR' 
                                ? 'Dünyanın her köşesinden farklı kültürleri, müzikleri ve sesleri tek bir platformda bir araya getirerek global bir radyo dinleme deneyimi sunmak. İster yerel bir frekans, ister uluslararası bir yayın olsun, sınırları kaldırmak istiyoruz.' 
                                : 'To bring together different cultures, music, and voices from all corners of the world on a single platform, offering a global radio listening experience. Whether a local frequency or an international broadcast, we want to remove borders.'}
                        </p>
                    </div>

                    {/* Mission Card */}
                    <div className="glass-card surface-container-low rounded-2xl p-8 border border-secondary/20 relative group overflow-hidden transition-all hover:border-secondary/50">
                        <div className="absolute -top-12 -right-12 w-40 h-40 bg-secondary/10 rounded-full blur-3xl transition-all group-hover:bg-secondary/20"></div>
                        <span className="material-symbols-outlined text-4xl text-secondary mb-6 block">flag</span>
                        <h2 className="text-2xl font-headline font-bold text-on-surface mb-4">
                            {appLang === 'TR' ? 'Misyonumuz' : 'Our Mission'}
                        </h2>
                        <p className="text-on-surface-variant leading-relaxed">
                            {appLang === 'TR' 
                                ? 'Kullanıcı dostu, hızlı ve modern bir arayüz ile radyo dinleme alışkanlıklarını baştan tanımlamak. En sevdiğiniz istasyonlara kesintisiz ve yüksek kalitede ulaşmanızı sağlarken yeni frekanslar keşfetmenize yardımcı olmak.' 
                                : 'To redefine radio listening habits with a user-friendly, fast, and modern interface. Helping you discover new frequencies while providing uninterrupted and high-quality access to your favorite stations.'}
                        </p>
                    </div>
                </div>

                {/* Team Stats/Info */}
                <div className="flex flex-wrap justify-center gap-6 w-full mb-16">
                    <div className="bg-surface-container-highest rounded-xl p-6 border border-outline-variant/20 flex flex-col items-center min-w-[200px]">
                        <span className="text-4xl font-black text-primary font-headline mb-2">10K+</span>
                        <span className="text-xs uppercase tracking-widest text-on-surface-variant font-label">
                            {appLang === 'TR' ? 'Radyo İstasyonu' : 'Radio Stations'}
                        </span>
                    </div>
                    <div className="bg-surface-container-highest rounded-xl p-6 border border-outline-variant/20 flex flex-col items-center min-w-[200px]">
                        <span className="text-4xl font-black text-secondary font-headline mb-2">150+</span>
                        <span className="text-xs uppercase tracking-widest text-on-surface-variant font-label">
                            {appLang === 'TR' ? 'Farklı Ülke' : 'Different Countries'}
                        </span>
                    </div>
                    <div className="bg-surface-container-highest rounded-xl p-6 border border-outline-variant/20 flex flex-col items-center min-w-[200px]">
                        <span className="text-4xl font-black text-[#874cff] font-headline mb-2">24/7</span>
                        <span className="text-xs uppercase tracking-widest text-on-surface-variant font-label">
                            {appLang === 'TR' ? 'Kesintisiz Yayın' : 'Non-stop Streaming'}
                        </span>
                    </div>
                </div>

            </main>
            <Footer appLang={appLang} onOpenAdmin={onOpenAdmin} />
        </div>
    );
}
