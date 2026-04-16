import React from 'react';
import Footer from '../components/Footer';

export default function PrivacyPage({ appLang, onOpenAdmin }) {
    return (
        <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] flex flex-col bg-atmosphere">
            <main className="flex-1 p-4 md:p-8 relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
                
                <div className="w-full mb-12 mt-10">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold text-on-surface tracking-tighter mb-4">
                        {appLang === 'TR' ? 'Gizlilik Politikası' : 'Privacy Policy'}
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-tertiary to-primary rounded-full mb-6"></div>
                    <p className="text-on-surface-variant font-label text-sm uppercase tracking-widest">
                        {appLang === 'TR' ? 'Son güncelleme: Ekim 2024' : 'Last updated: October 2024'}
                    </p>
                </div>

                <div className="glass-card surface-container-low rounded-3xl p-6 md:p-10 border border-[#20262f]/50 w-full text-on-surface-variant leading-relaxed space-y-8 font-body">
                    
                    <section>
                        <h2 className="text-2xl font-headline font-bold text-[#ff7eeb] mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">policy</span>
                            {appLang === 'TR' ? '1. Bilgi Toplama ve Kullanımı' : '1. Information Collection and Use'}
                        </h2>
                        <p>
                            {appLang === 'TR' 
                                ? 'Radiocu.com, hizmetlerimizi sağlamak ve iyileştirmek için çeşitli bilgiler toplayıp kullanmaktadır. Sizden doğrudan herhangi bir kişisel veri (isim, e-posta vb.) toplamadığımız belirtmek isteriz; ancak, üçüncü taraf servis sağlayıcılar aracılığıyla (ör. Google AdSense, Firebase) anonim veriler elde edilebilir.' 
                                : 'Radiocu.com collects and uses various information to provide and improve our services. We want to state that we do not collect any personal data (name, email, etc.) from you directly; however, anonymous data may be obtained through third-party service providers (e.g. Google AdSense, Firebase).'}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-headline font-bold text-[#00e3fd] mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">cookie</span>
                            {appLang === 'TR' ? '2. Çerezler (Cookies)' : '2. Cookies'}
                        </h2>
                        <p>
                            {appLang === 'TR' 
                                ? 'Çerezler, ziyaret ettiğiniz web siteleri tarafından tarayıcınıza yerleştirilen küçük veri dosyalarıdır. Uygulamamız, kullanıcı deneyimini iyileştirmek, favori istasyonlarınızı cihazınızda kaydetmek (localStorage) ve Google AdSense üzerinden kişiselleştirilmiş reklamlar sunmak amacıyla çerez ve benzeri izleme teknolojileri kullanır.' 
                                : 'Cookies are small data files placed on your browser by websites you visit. Our application uses cookies and similar tracking technologies to improve user experience, save your favorite stations to your device (localStorage), and deliver personalized ads via Google AdSense.'}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-headline font-bold text-[#874cff] mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">ads_click</span>
                            {appLang === 'TR' ? '3. Üçüncü Taraf Reklamlar (AdSense)' : '3. Third-party Ads (AdSense)'}
                        </h2>
                        <p>
                            {appLang === 'TR' 
                                ? 'Web sitemiz ve özelliklerimiz ücretsiz kalsın diye Google AdSense vb. üçüncü taraf reklam ağlarını kullanıyoruz. Google, daha önce sitemize veya internet üzerindeki diğer sitelere yaptığınız ziyaretlere dayalı reklamlar sunmak için DART çerezleri kullanabilir.' 
                                : 'We use third-party advertising networks like Google AdSense to keep our website and features free. Google may use DART cookies to serve ads based on your previous visits to our site and other sites on the internet.'}
                        </p>
                    </section>
                </div>
            </main>
            <Footer appLang={appLang} onOpenAdmin={onOpenAdmin} />
        </div>
    );
}
