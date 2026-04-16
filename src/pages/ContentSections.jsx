// Content sections extracted from App.jsx — kept for AdSense compliance
import React, { useState, useEffect, useRef } from 'react';
import { Radio, Info, Tag, Award, Wifi, Headphones, Globe as GlobeIcon, Smartphone, BookOpen, TrendingUp, Heart, Star, HelpCircle, ChevronDown } from 'lucide-react';

// --- TRANSLATIONS (needed by SeoContent) ---
const TRANSLATIONS = {
    TR: {
        code: "tr", h1Prefix: "Canlı", h1Suffix: "Radyoları Dinle",
        seoTitle: "Canlı Radyo Dinle", seoDesc: "Kesintisiz radyo keyfi.",
        seoContentTitle: "Türkiye'nin En İyi Canlı Radyo Platformu",
        seoContentText: "Radiocu ile Türkiye ve dünyadan binlerce radyo istasyonunu ücretsiz, şifresiz ve kesintisiz dinleyin. Arabeskten pop müziğe, haberden spora kadar her kategoride en kaliteli yayınlar burada.",
        seoTags: ["Canlı Radyo", "Online Dinle", "Kesintisiz FM", "Haber Radyosu", "Spor Radyosu", "Pop Müzik", "Arabesk Radyo"]
    },
    EN: {
        code: "en", h1Prefix: "Listen Live", h1Suffix: "Radio Stations",
        seoTitle: "Listen Live Radio", seoDesc: "Listen online radio.",
        seoContentTitle: "Best Live Radio Streaming Platform",
        seoContentText: "Listen to thousands of radio stations from around the world for free and uninterrupted with Radiocu. From pop to jazz, news to sports, high-quality streams are at your fingertips.",
        seoTags: ["Live Radio", "Online FM", "Stream Music", "News Radio", "Sports Radio", "Free Radio", "Internet Radio"]
    },
    DE: {
        code: "de", h1Prefix: "Live", h1Suffix: "Radio Hören",
        seoTitle: "Radio Online Hören", seoDesc: "Kostenlose Online-Radio.",
        seoContentTitle: "Die beste Plattform für Live-Radio",
        seoContentText: "Hören Sie mit Radiocu tausende Radiosender weltweit kostenlos und ohne Unterbrechung. Von Pop bis Jazz, Nachrichten bis Sport – beste Qualität ist garantiert.",
        seoTags: ["Radio Hören", "Live Stream", "Webradio", "Online Radio", "Kostenlos Musik", "Nachrichten", "Sportradio"]
    },
};

// SEO meta update helper
function updateSEO(title, description, langCode, keywords) {
    if (typeof document === 'undefined') return;
    document.title = title;
    document.documentElement.lang = langCode;
    const metas = { description, keywords, 'og:title': title, 'og:description': description, 'twitter:title': title, 'twitter:description': description };
    Object.entries(metas).forEach(([name, content]) => {
        const attr = name.startsWith('og:') || name.startsWith('twitter:') ? 'property' : 'name';
        let el = document.querySelector(`meta[${attr}="${name}"]`);
        if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
        el.setAttribute('content', content);
    });
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', window.location.href);
}

// --- ADSENSE ---
const IS_ADSENSE_LIVE = true;
const GOOGLE_AD_CLIENT_ID = "ca-pub-3150287766498754";

export const AdSenseUnit = ({ slotId, loading = false }) => {
    const adRef = useRef(null);
    useEffect(() => {
        if (IS_ADSENSE_LIVE && !loading && window.adsbygoogle && adRef.current && adRef.current.innerHTML === "") {
            try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { /* ignore */ }
        }
    }, [loading]);
    if (!IS_ADSENSE_LIVE) return <div className="w-full h-24 bg-gray-800/30 border border-dashed border-gray-700/50 flex items-center justify-center text-slate-500 text-xs">Reklam</div>;
    return <div className="ad-container my-4 flex justify-center min-h-[90px] w-full overflow-hidden"><ins ref={adRef} className="adsbygoogle" style={{ display: 'block', minWidth: '300px' }} data-ad-client={GOOGLE_AD_CLIENT_ID} data-ad-slot={slotId} data-full-width-responsive="true"></ins></div>;
};

// --- SEO CONTENT ---
export const SeoContent = ({ country, lang, countriesList }) => {
    const cObj = countriesList.find(c => c.code === country);
    const cName = cObj ? cObj.name : country;
    const t = TRANSLATIONS[lang] || TRANSLATIONS['EN'];

    useEffect(() => {
        const fullTitle = `${t.h1Prefix || "Radio"} ${cName} ${t.h1Suffix || ""} | Radiocu`;
        const fullDesc = `${t.seoDesc} ${cName}. ${t.seoContentTitle || ""}`;
        const keys = (t.seoTags || []).join(", ") + `, ${cName} radio, live fm`;
        updateSEO(fullTitle, fullDesc, t.code || 'en', keys);
    }, [country, lang, cName, t]);

    return (
        <div className="mt-12 mb-8 p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/5 text-slate-400 text-sm shadow-xl">
            <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Radio className="w-6 h-6 text-teal-500" /> {t.h1Prefix} {cName} {t.h1Suffix}
            </h1>
            <div className="space-y-4">
                <p className="leading-relaxed">{t.seoContentText ? t.seoContentText.replace('{country}', cName) : `${cName} ${t.seoDesc}`}</p>
                <p className="leading-relaxed hidden md:block">
                    {lang === 'TR' ?
                        `Radiocu platformu ile ${cName} genelindeki en popüler radyo istasyonlarını yüksek ses kalitesiyle dinleyebilirsiniz. Haberden spora, pop müzikten klasik müziğe kadar geniş bir yelpazede yayın yapan radyolar, kesintisiz bir şekilde bu sayfada listelenmektedir.` :
                        `With the Radiocu platform, you can listen to the most popular radio stations in ${cName} with high audio quality. Broadcasting a wide range of genres from news to sports, pop music to classical, these radios are listed here uninterruptedly.`}
                </p>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-white/5">
                    <h2 className="text-white font-bold text-sm mb-2 flex items-center gap-2"><Info className="w-4 h-4 text-teal-400" /> {lang === 'TR' ? 'Bilmeniz Gerekenler' : 'Did You Know?'}</h2>
                    <p className="text-xs">
                        {lang === 'TR' ?
                            `Online radyo dinlemek, geleneksel FM radyolara göre daha az parazit ve daha net ses sunar. Ayrıca ${cName} dışındayken bile memleketinizin radyolarını takip edebilirsiniz.` :
                            `Listening to online radio offers less static and clearer sound compared to traditional FM radios. Also, you can follow your hometown radios even when you are outside of ${cName}.`}
                    </p>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/5">
                {(t.seoTags || ["Live Radio", "Online FM"]).map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-800 rounded-full text-[10px] text-slate-300 border border-white/5 flex items-center gap-1 cursor-default hover:bg-gray-700 transition">
                        <Tag className="w-3 h-3 text-teal-400" /> {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};

// --- FEATURES ---
export const FeaturesSection = ({ lang }) => {
    const content = {
        TR: [
            { icon: <Wifi className="w-6 h-6" />, title: "Kesintisiz Yayın", desc: "Akıllı önbellekleme ve çoklu sunucu altyapısıyla donma ve kesinti problemlerini ortadan kaldırıyoruz." },
            { icon: <Headphones className="w-6 h-6" />, title: "HD Ses Kalitesi", desc: "320kbps'e kadar yüksek çözünürlüklü ses akışı. Stüdyo kalitesine yakın dinleme deneyimi." },
            { icon: <GlobeIcon className="w-6 h-6" />, title: "190+ Ülke", desc: "Dünya genelinde 30.000'den fazla radyo istasyonuna tek platformdan erişim." },
            { icon: <Smartphone className="w-6 h-6" />, title: "Her Cihazda", desc: "Telefon, tablet veya bilgisayar — tüm cihazlarınızda aynı premium deneyim." }
        ],
        EN: [
            { icon: <Wifi className="w-6 h-6" />, title: "Uninterrupted", desc: "Smart caching and multi-server infrastructure eliminates buffering issues." },
            { icon: <Headphones className="w-6 h-6" />, title: "HD Audio", desc: "High-resolution audio streaming up to 320kbps. Close to studio quality." },
            { icon: <GlobeIcon className="w-6 h-6" />, title: "190+ Countries", desc: "Access over 30,000 radio stations worldwide from a single platform." },
            { icon: <Smartphone className="w-6 h-6" />, title: "Any Device", desc: "Phone, tablet, or computer — the same premium experience on all devices." }
        ]
    };
    const features = content[lang] || content['EN'];
    return (
        <div className="mt-16 mb-12">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-500/10"><Award className="w-5 h-5 text-teal-400" /></div>
                {lang === 'TR' ? 'Neden Radiocu?' : 'Why Radiocu?'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {features.map((f, i) => (
                    <div key={i} className="group glass-card p-6 rounded-2xl border border-white/5 hover-glow transition-all duration-300 flex flex-col items-center text-center">
                        <div className="mb-4 p-3 rounded-xl bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20 group-hover:scale-110 transition-all duration-300">{f.icon}</div>
                        <h4 className="text-white font-bold mb-2 text-sm">{f.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- BLOG ---
export const BlogSection = ({ lang }) => {
    const [expandedArticle, setExpandedArticle] = useState(null);
    const articles = {
        TR: [
            { title: "Dijital Radyonun Yükselişi: FM'den İnternete Geçiş", date: "21.02.2026", icon: <TrendingUp className="w-5 h-5" />, summary: "FM frekanslarının yerini dijital streamler alıyor. Radiocu ile sınırları aşın ve global müzik dünyasına adım atın.", full: "Radyo, icat edildiği günden bu yana insanlığın en güçlü iletişim araçlarından biri olmuştur. 1920'lerde başlayan AM yayıncılığı, 1960'larda FM teknolojisiyle devrim yaşadı. Ancak 21. yüzyılda internet radyoculuğu, tüm bu geleneksel modelleri köklü biçimde değiştirdi.\n\nDijital radyonun en büyük avantajı, küresel erişimdir. İstanbul'dan yayın yapan bir istasyon, Tokyo'daki bir dinleyiciye aynı kalitede ulaşabilir. 320kbps MP3 veya FLAC formatındaki yayınlar, FM'in sunduğu ses kalitesini çoktan aşmıştır.\n\nRadiocu olarak bu dönüşümün öncülerinden olmaktan gurur duyuyoruz." },
            { title: "Müzik ve İnsan Psikolojisi: Sesle Gelen Şifa", date: "15.02.2026", icon: <Heart className="w-5 h-5" />, summary: "Müziğin insan psikolojisi üzerindeki doğrudan etkisi bilimsel olarak kanıtlanmıştır.", full: "Bilim insanları, müziğin beyin üzerindeki etkilerini onlarca yıldır araştırmaktadır. Nörobilim çalışmaları, müzik dinlemenin dopamin, serotonin ve oksitosin gibi mutluluk hormonlarının salgılanmasını tetiklediğini ortaya koymuştur.\n\nÖzellikle radyo dinlemek, müzik terapisinin en erişilebilir formlarından biridir. Araştırmalar, beklenmedik müzik parçalarıyla karşılaşmanın, bilinen şarkıları dinlemekten daha fazla dopamin salgılattığını gösteriyor.\n\nRadiocu'da farklı ruh hallerine göre radyo istasyonları keşfedebilirsiniz." },
            { title: "Neden Online Radyo Geleneksel FM'den Daha İyi?", date: "08.02.2026", icon: <Star className="w-5 h-5" />, summary: "Cızırtı yok, kesinti yok. İnternetin olduğu her yerde CD kalitesinde müzik keyfi.", full: "Geleneksel FM radyonun sınırlamaları gün geçtikçe daha belirgin hale geliyor. Frekans parazitleri, coğrafi kısıtlamalar, sınırlı kanal seçeneği ve düşük ses kalitesi — bunların tümü internet radyoculuğunda ortadan kalkıyor.\n\nOnline radyonun en belirgin avantajlarından biri çeşitliliktir. Niş müzik türleri, farklı dillerdeki yayınlar ve tematik kanallar — hepsi parmaklarınızın ucunda.\n\nRadiocu platformu, akıllı önbellekleme teknolojisi sayesinde kesintisiz dinleme deneyimi sunar." }
        ],
        EN: [
            { title: "The Rise of Digital Radio: From FM to Internet", date: "Feb 21", icon: <TrendingUp className="w-5 h-5" />, summary: "Digital streams replace FM frequencies globally.", full: "Radio has been one of humanity's most powerful communication tools since its invention. AM broadcasting began in the 1920s, FM technology revolutionized it in the 1960s, and now internet radio is fundamentally changing all traditional models.\n\nThe biggest advantage of digital radio is global reach. A station broadcasting from London can reach a listener in Sydney with the same quality. 320kbps MP3 or FLAC broadcasts have long surpassed FM quality.\n\nAt Radiocu, we are proud to be pioneers of this transformation." },
            { title: "Music and Human Psychology: Healing Through Sound", date: "Feb 15", icon: <Heart className="w-5 h-5" />, summary: "Music has a proven direct impact on human psychology.", full: "Scientists have been studying the effects of music on the brain for decades. Neuroscience research has revealed that listening to music triggers the release of dopamine, serotonin, and oxytocin.\n\nListening to radio is one of the most accessible forms of music therapy. Research shows unexpected music tracks cause more dopamine release than familiar songs.\n\nOn Radiocu, you can discover radio stations for different moods." },
            { title: "Why Online Radio is Better Than Traditional FM", date: "Feb 8", icon: <Star className="w-5 h-5" />, summary: "No static, no interruptions. CD-quality music wherever you have internet.", full: "The limitations of traditional FM radio are becoming more apparent every day. Frequency interference, geographical restrictions, limited channel selection — all eliminated in internet radio.\n\nOne of the most notable advantages of online radio is variety. Niche music genres, broadcasts in different languages, and thematic channels — all at your fingertips.\n\nRadiocu offers an uninterrupted listening experience thanks to smart caching technology." }
        ]
    };
    const list = articles[lang] || articles['EN'];
    return (
        <div className="mt-16 mb-12">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-500/10"><BookOpen className="w-5 h-5 text-teal-400" /></div>
                {lang === 'TR' ? 'Blog & Makaleler' : 'Blog & Articles'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {list.map((a, i) => (
                    <div key={i} className="group glass-card rounded-2xl border border-white/5 hover-glow transition-all duration-300 flex flex-col h-full overflow-hidden">
                        <div className="p-6 flex flex-col h-full">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-teal-400">{a.icon}</span>
                                <span className="text-xs text-slate-500 font-mono">{a.date}</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-100 mb-3 group-hover:text-white transition leading-snug">{a.title}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed flex-1 whitespace-pre-line">{expandedArticle === i ? a.full : a.summary}</p>
                            <button
                                onClick={() => setExpandedArticle(expandedArticle === i ? null : i)}
                                className="mt-4 flex items-center gap-1 text-xs text-teal-400 font-medium hover:text-teal-300 transition"
                            >
                                {expandedArticle === i ? (lang === 'TR' ? 'Daralt' : 'Collapse') : (lang === 'TR' ? 'Devamını Oku' : 'Read More')}
                                <ChevronDown className={`w-3 h-3 transition-transform ${expandedArticle === i ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- FAQ ---
export const FAQSection = ({ lang }) => {
    const [openFaq, setOpenFaq] = useState(null);
    const faqs = {
        TR: [
            { q: "Radiocu tamamen ücretsiz mi?", a: "Evet, Radiocu %100 ücretsiz bir platformdur. Hiçbir abonelik veya ödeme gerektirmez." },
            { q: "Mobil cihazlarda çalışıyor mu?", a: "Radiocu, tüm modern tarayıcılarda ve tüm cihazlarda sorunsuz çalışır. Ayrı bir uygulama indirmenize gerek yoktur." },
            { q: "Hangi ülkelerin radyolarını dinleyebilirim?", a: "190'dan fazla ülkenin radyo istasyonlarını dinleyebilirsiniz." },
            { q: "Ses kalitesi nasıl?", a: "İnternet radyo yayınları 128kbps ile 320kbps arasında kalitede sunar. Radiocu en yüksek kaliteli stream'leri otomatik olarak seçer." },
            { q: "Veri kotamı çok harcar mı?", a: "Ortalama bir radyo stream'i saatte yaklaşık 60-120 MB veri kullanır. Wi-Fi üzerinden dinlemenizi öneririz." },
            { q: "Neden bazı istasyonlar çalmıyor?", a: "Bazı istasyonlar coğrafi kısıtlamalar veya sunucu sorunları nedeniyle zaman zaman erişilemez olabilir." },
            { q: "Kişisel verilerim güvende mi?", a: "Radiocu, kullanıcı gizliliğine büyük önem verir. Kişisel bilgilerinizi toplamıyor veya paylaşmıyoruz." },
            { q: "Radyo istasyonu ekleyebilir miyim?", a: "Önerilerinizi info@radiocu.com adresine gönderebilirsiniz." }
        ],
        EN: [
            { q: "Is Radiocu completely free?", a: "Yes, Radiocu is a 100% free platform. No subscription or payment is required." },
            { q: "Does it work on mobile devices?", a: "Radiocu works seamlessly on all modern browsers and all devices. No separate app needed." },
            { q: "Which countries' radios can I listen to?", a: "You can listen to radio stations from over 190 countries on Radiocu." },
            { q: "How is the audio quality?", a: "Internet radio broadcasts offer quality between 128kbps and 320kbps. Radiocu automatically selects the highest quality." },
            { q: "Does it use a lot of data?", a: "An average radio stream uses approximately 60-120 MB of data per hour. We recommend listening over Wi-Fi." },
            { q: "Why won't some stations play?", a: "Some stations may be temporarily inaccessible due to geographical restrictions or server issues." },
            { q: "Is my personal data safe?", a: "Radiocu places great importance on user privacy. We do not collect or share your personal information." },
            { q: "Can I add a radio station?", a: "You can send your suggestions to info@radiocu.com." }
        ]
    };
    const list = faqs[lang] || faqs['EN'];
    return (
        <div className="mt-12 mb-12">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-500/10"><HelpCircle className="w-5 h-5 text-teal-400" /></div>
                {lang === 'TR' ? 'Sıkça Sorulan Sorular' : 'Frequently Asked Questions'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {list.map((item, i) => (
                    <div key={i}
                        className="glass-card rounded-xl border border-white/5 hover-glow transition-all duration-300 overflow-hidden cursor-pointer"
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                        <div className="p-5">
                            <h4 className="text-sm font-semibold text-slate-200 flex items-center justify-between gap-2">
                                {item.q}
                                <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                            </h4>
                            {openFaq === i && (
                                <p className="text-xs text-slate-400 leading-relaxed mt-3 animate-fade-in">{item.a}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
