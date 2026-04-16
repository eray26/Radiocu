import React from 'react';
import Footer from '../components/Footer';

export default function ContactPage({ appLang, onOpenAdmin }) {
    return (
        <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] flex flex-col bg-atmosphere">
            <main className="flex-1 p-4 md:p-8 relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
                
                <div className="text-center mb-12 mt-10">
                    <h1 className="text-4xl md:text-6xl font-headline font-bold text-on-surface tracking-tighter mb-4">
                        {appLang === 'TR' ? 'İletişim' : 'Contact Us'}
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-[#00e3fd] to-[#ff7eeb] mx-auto rounded-full mb-6"></div>
                    <p className="text-on-surface-variant font-label max-w-xl mx-auto text-lg">
                        {appLang === 'TR' ? 'Yeni bir radyo istasyonu önermek veya geri bildirimde bulunmak için bize ulaşın.' : 'Contact us to suggest a new radio station or provide feedback.'}
                    </p>
                </div>

                <div className="glass-card surface-container-low rounded-3xl p-8 md:p-12 border border-[#20262f]/50 w-full relative overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                    
                    <form className="relative z-10 flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase tracking-widest font-label text-on-surface-variant">
                                    {appLang === 'TR' ? 'Adınız' : 'Your Name'}
                                </label>
                                <input 
                                    type="text" 
                                    className="bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors"
                                    placeholder={appLang === 'TR' ? 'John Doe' : 'John Doe'}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase tracking-widest font-label text-on-surface-variant">
                                    {appLang === 'TR' ? 'E-posta' : 'Email Address'}
                                </label>
                                <input 
                                    type="email" 
                                    className="bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors"
                                    placeholder="hello@example.com"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest font-label text-on-surface-variant">
                                {appLang === 'TR' ? 'Konu' : 'Subject'}
                            </label>
                            <input 
                                type="text" 
                                className="bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors"
                                placeholder={appLang === 'TR' ? 'Radyo Ekleme Talebi' : 'Station Addition Request'}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase tracking-widest font-label text-on-surface-variant">
                                {appLang === 'TR' ? 'Mesajınız' : 'Your Message'}
                            </label>
                            <textarea 
                                rows="5"
                                className="bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-secondary transition-colors resize-none"
                                placeholder={appLang === 'TR' ? 'Merhaba, uygulamanızı çok beğendim...' : 'Hello, I really like your app...'}
                            ></textarea>
                        </div>

                        <button className="w-full md:w-auto self-end bg-secondary text-[#0a0e14] px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform hover:shadow-[0_0_20px_rgba(0,227,253,0.4)] mt-4">
                            {appLang === 'TR' ? 'Gönder' : 'Send Message'}
                        </button>
                    </form>
                </div>

                <div className="mt-16 flex flex-wrap justify-center gap-8">
                    <a href="mailto:info@radiocu.com" className="flex items-center gap-3 text-on-surface-variant hover:text-secondary transition-colors group">
                        <span className="material-symbols-outlined text-2xl group-hover:-translate-y-1 transition-transform">mail</span>
                        <span className="font-label">info@radiocu.com</span>
                    </a>
                </div>
            </main>
            <Footer appLang={appLang} onOpenAdmin={onOpenAdmin} />
        </div>
    );
}
