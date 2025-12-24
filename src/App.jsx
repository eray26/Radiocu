import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Search, Globe, Radio, MapPin, Music, Wifi, AlertCircle, Sparkles, X, Bot, MessageSquare, Loader2, Activity, Zap, Waves, Menu, RefreshCw, Star, Info, Shield, FileText, Mail, HelpCircle, ChevronRight, BookOpen, Headphones, Signal, Smartphone } from 'lucide-react';

// --- GLOBAL AYARLAR ---
const GOOGLE_AD_CLIENT_ID = "ca-pub-3676498147737928";
const IS_ADSENSE_LIVE = true;
const apiKey = null; // Removed

// --- ÖZEL MARKA LOGOSU (SVG) ---
const BrandLogo = ({ className }) => (
  <div className={className}>
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="24" height="24" rx="6" fill="url(#brand_grad)" />
      <path d="M7 7H11C13.2 7 15 8.8 15 11V11C15 13.2 13.2 15 11 15H7V7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 15L11.5 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.5 10C17.2 10.8 17.5 11.8 17.5 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
      <path d="M19 8C20.2 9.2 21 11 21 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <defs>
        <linearGradient id="brand_grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f46e5" />
          <stop offset="1" stopColor="#9333ea" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

// --- VIP LİSTE ---
const VIP_STATIONS = {
  TR: [
    { name: "Power Türk", url_resolved: "https://listen.powerapp.com.tr/powerturk/mpeg/icecast.audio", favicon: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Power_T%C3%BCrk_logo.svg", homepage: "https://www.powerapp.com.tr", tags: "pop,türkçe" },
    { name: "Power FM", url_resolved: "https://listen.powerapp.com.tr/powerfm/mpeg/icecast.audio", favicon: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Power_FM_logo.svg", homepage: "https://www.powerapp.com.tr", tags: "pop,hit" },
    { name: "Kral FM", url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/KRALFM_SC", favicon: "https://im.haberturk.com/2019/02/13/ver1550054703/2372548_62x62.jpg", homepage: "https://www.kralmuzik.com.tr", tags: "arabesk,fantezi" },
    { name: "Kral Pop", url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/KRALPOP_SC", favicon: "https://music-podcast-api.kralmuzik.com.tr/api/Image/GetImage?path=/Content/images/Kral-Pop-Logo.png", homepage: "https://www.kralmuzik.com.tr", tags: "pop,türkçe" },
    { name: "Metro FM", url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/METRO_FM_SC", favicon: "https://upload.wikimedia.org/wikipedia/tr/f/f7/Metro_FM_logo.png", homepage: "https://karnaval.com", tags: "pop,yabancı" },
    { name: "Süper FM", url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/SUPER_FM_SC", favicon: "https://upload.wikimedia.org/wikipedia/tr/b/b5/S%C3%BCper_FM_logo.png", homepage: "https://karnaval.com", tags: "pop,türkçe" },
    { name: "Joy Türk", url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_SC", favicon: "https://upload.wikimedia.org/wikipedia/tr/0/09/Joy_FM_logo.png", homepage: "https://karnaval.com", tags: "slow,aşk" },
    { name: "Joy FM", url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_FM_SC", favicon: "https://upload.wikimedia.org/wikipedia/en/7/70/Joy_Fm_Logo.jpg", homepage: "https://karnaval.com", tags: "yabancı,slow" },
    { name: "Fenomen Türk", url_resolved: "https://listen.radyofenomen.com/fenomenturk/256/icecast.audio", favicon: "https://radyofenomen.com/assets/images/logo.png", homepage: "https://radyofenomen.com", tags: "pop,hit" },
    { name: "Show Radyo", url_resolved: "https://listen.radyofenomen.com/showradyo/256/icecast.audio", favicon: "https://upload.wikimedia.org/wikipedia/tr/0/02/Show_Radyo_logosu.png", homepage: "https://www.showradyo.com.tr", tags: "pop,türkçe" },
    { name: "Kafa Radyo", url_resolved: "https://kafaradyo.live/kafaradyo/128/icecast.audio", favicon: "https://kafaradyo.com/assets/img/logo.png", homepage: "https://kafaradyo.com", tags: "talk,haber" },
    { name: "Radyo D", url_resolved: "https://radyod.radyotvonline.net/radyod/128/icecast.audio", favicon: "https://www.radyod.com/assets/img/radyod-logo.png", homepage: "https://www.radyod.com", tags: "pop,türkçe" },
    { name: "Virgin Radio", url_resolved: "https://listen.powerapp.com.tr/virginradyo/mpeg/icecast.audio", favicon: "https://upload.wikimedia.org/wikipedia/tr/6/6f/Virgin_Radio_T%C3%BCrkiye_logo.png", homepage: "https://karnaval.com", tags: "pop,yabancı" },
    { name: "Alem FM", url_resolved: "https://turkmedya.radyotvonline.net/alemfm/128/icecast.audio", favicon: "https://www.alemfm.com/assets/img/alemfm-logo.png", homepage: "https://www.alemfm.com", tags: "pop,türkçe" },
    { name: "Best FM", url_resolved: "http://46.20.7.126/bestfmmp3", favicon: "https://www.bestfm.com.tr/assets/img/bestfm-logo.png", homepage: "https://www.bestfm.com.tr", tags: "pop,türkçe" },
    { name: "TRT FM", url_resolved: "https://radyo.trt.net.tr/shoutcast/trtfm_hq.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/0/09/TRT_FM_logo.svg", homepage: "https://www.trt.net.tr/radyo/", tags: "türkçe,karışık" },
    { name: "Number1 FM", url_resolved: "https://n101.rcs.revma.com/3d095282k2zuv", favicon: "https://www.numberone.com.tr/wp-content/uploads/2018/05/number1-logo-1.png", homepage: "https://www.numberone.com.tr", tags: "hit,dance" }
  ],
  US: [
    { name: "KEXP 90.3", url_resolved: "https://kexp-mp3-128.streamguys1.com/kexp128.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/e/e8/KEXP_logo_black.svg", homepage: "https://kexp.org", tags: "alternative,rock" },
    { name: "NPR News", url_resolved: "https://npr-ice.streamguys1.com/live.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/d/d7/National_Public_Radio_logo.svg", homepage: "https://npr.org", tags: "news" },
    { name: "KCRW", url_resolved: "https://kcrw.streamguys1.com/kcrw_192k_mp3_on_air_falcon", favicon: "https://upload.wikimedia.org/wikipedia/commons/b/b3/KCRW_logo.svg", homepage: "https://www.kcrw.com", tags: "eclectic,news" },
    { name: "Hot 97", url_resolved: "https://playerservices.streamtheworld.com/api/livestream-redirect/WQHTFM.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/7/77/Hot_97_Logo.png", homepage: "https://www.hot97.com", tags: "hiphop,rap" }
  ],
  DE: [
    { name: "1LIVE", url_resolved: "https://wdr-1live-live.icecastssl.wdr.de/wdr/1live/live/mp3/128/stream.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/e/ee/1_Live_Logo.svg", homepage: "https://www1.wdr.de/radio/1live", tags: "pop,hit" },
    { name: "WDR 2", url_resolved: "https://wdr-wdr2-rheinland-live.icecastssl.wdr.de/wdr/wdr2/rheinland/live/mp3/128/stream.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/a/a2/WDR_2_Logo_2016.svg", homepage: "https://www1.wdr.de/radio/wdr2", tags: "pop,news" },
    { name: "BigFM", url_resolved: "https://audiothek-live-swr-mp3-128.akamaized.net/swr/swr3/live/mp3/128/stream.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/BigFM_Logo_2013-10-16.png/240px-BigFM_Logo_2013-10-16.png", homepage: "https://www.bigfm.de", tags: "pop,dance" }
  ],
  GB: [
    { name: "BBC Radio 1", url_resolved: "http://stream.live.vc.bbcmedia.co.uk/bbc_radio_one", favicon: "https://upload.wikimedia.org/wikipedia/commons/2/23/BBC_Radio_1_2021.svg", homepage: "https://www.bbc.co.uk/radio1", tags: "pop,hit" },
    { name: "Capital FM", url_resolved: "https://media-ice.musicradio.com/CapitalMP3", favicon: "https://upload.wikimedia.org/wikipedia/en/e/e0/Capital_FM_logo.svg", homepage: "https://www.capitalfm.com", tags: "pop,hit" },
    { name: "Heart", url_resolved: "https://media-ice.musicradio.com/HeartLondonMP3", favicon: "https://upload.wikimedia.org/wikipedia/en/4/4e/Heart_Radio_logo.svg", homepage: "https://www.heart.co.uk", tags: "pop,adult" }
  ],
  FR: [
    { name: "NRJ", url_resolved: "https://scdn.nrjaudio.fm/adwz1/fr/30001/mp3_128.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/6/67/NRJ_logo_2014.svg", homepage: "https://www.nrj.fr", tags: "pop,hit" },
    { name: "Skyrock", url_resolved: "https://icecast.skyrock.net/s/natio_mp3_128k", favicon: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Skyrock_logo.svg", homepage: "https://skyrock.fm", tags: "rap,urban" },
    { name: "France Inter", url_resolved: "https://stream.radiofrance.fr/franceinter/franceinter.m3u8", favicon: "https://upload.wikimedia.org/wikipedia/commons/1/1b/France_Inter_Logo_2021.svg", homepage: "https://www.radiofrance.fr/franceinter", tags: "news,talk" }
  ],
  IT: [
    { name: "Rai Radio 1", url_resolved: "https://icestreaming.rai.it/1.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Rai_Radio_1_-_Logo_2017.svg", homepage: "https://www.raiplayradio.it/radio1", tags: "news,talk" },
    { name: "RTL 102.5", url_resolved: "https://streamingv2.shoutcast.com/RTL-1025", favicon: "https://upload.wikimedia.org/wikipedia/commons/4/48/Logo_RTL_102.5.png", homepage: "https://www.rtl.it", tags: "hit,pop" }
  ],
  ES: [
    { name: "Cadena SER", url_resolved: "https://21633.live.streamtheworld.com/CADENASER.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/1/18/Cadena_SER_logo_2022.svg", homepage: "https://cadenaser.com", tags: "news,talk" },
    { name: "LOS40", url_resolved: "https://20853.live.streamtheworld.com/LOS40_SC", favicon: "https://upload.wikimedia.org/wikipedia/commons/4/48/LOS40_Espa%C3%B1a_logo_2016.svg", homepage: "https://los40.com", tags: "pop,hit" }
  ],
  AZ: [
    { name: "Ictimai Radio", url_resolved: "https://stream.live.vc.bbcmedia.co.uk/bbc_azeri_radio", favicon: "https://upload.wikimedia.org/wikipedia/commons/9/90/Ictimai_TV_logo.png", homepage: "https://itv.az", tags: "news,folk" },
    { name: "Media FM", url_resolved: "https://stream.mediafm.az:8000/mediafm", favicon: "https://mediafm.az/assets/images/logo.png", homepage: "https://mediafm.az", tags: "pop,hit" }
  ],
  SG: [
    { name: "Yes 933", url_resolved: "https://mediacorp-audio-cr-sg.akamaized.net/fl/270/86134/270_86134.m3u8", favicon: "https://upload.wikimedia.org/wikipedia/en/e/e0/YES_933_Logo.png", homepage: "https://www.melisten.sg/radio/yes-933", tags: "pop,hit" },
    { name: "Class 95", url_resolved: "https://mediacorp-audio-cr-sg.akamaized.net/fl/267/86131/267_86131.m3u8", favicon: "https://upload.wikimedia.org/wikipedia/en/c/c5/Class_95_FM_Logo.png", homepage: "https://www.melisten.sg/radio/class-95", tags: "pop,english" },
    { name: "Love 97.2", url_resolved: "https://mediacorp-audio-cr-sg.akamaized.net/fl/271/86135/271_86135.m3u8", favicon: "https://upload.wikimedia.org/wikipedia/en/b/b3/Love_97.2_FM_Logo.png", homepage: "https://www.melisten.sg/radio/love-972", tags: "pop,mandarin" }
  ],
  IN: [
    { name: "Radio Mirchi", url_resolved: "http://peridot.streamguys.com:7150/Mirchi", favicon: "https://upload.wikimedia.org/wikipedia/en/e/e3/Radio_Mirchi_logo.svg", homepage: "https://www.radiomirchi.com", tags: "bollywood,pop" },
    { name: "Radio City Hindi", url_resolved: "https://prclive1.listenon.in/Hindi", favicon: "https://upload.wikimedia.org/wikipedia/en/3/30/Radio_City_logo.png", homepage: "https://www.radiocity.in", tags: "bollywood,hits" },
    { name: "Big FM", url_resolved: "https://radio.bigfm.com/stream", favicon: "https://www.bigfm.com/images/default-source/default-album/big-fm-logo.png", homepage: "https://www.bigfm.com", tags: "hit,hindi" },
    { name: "Bolly Hits", url_resolved: "http://hoth.alonhosting.com:1100/;", favicon: "https://cdn.webrad.io/images/logos/radio-bolly-fm.png", homepage: "http://bollyhitsradio.com/", tags: "bollywood,pop" },
    { name: "Lata Mangeshkar", url_resolved: "http://stream.zeno.fm/g95zm67prfhvv", favicon: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Lata_Mangeshkar_2008.jpg", homepage: "http://www.hitsofbollywood.com/", tags: "classic,legend" },
    { name: "Kishor Kumar", url_resolved: "http://stream.zeno.fm/pg6rqp8ztm0uv", favicon: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Kishore_Kumar_2016_stamp_of_India.jpg", homepage: "http://www.hitsofbollywood.com/", tags: "classic,legend" }
  ],
  CN: [
    { name: "CRI News", url_resolved: "http://sk.cri.cn/887.m3u8", favicon: "https://upload.wikimedia.org/wikipedia/commons/e/ed/China_Radio_International_Logo.svg", homepage: "https://english.cri.cn", tags: "news" },
    { name: "CNR-1 Voice", url_resolved: "http://lhttp.qtfm.cn/live/15318317/64k.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/2/25/China_National_Radio_logo.svg", homepage: "https://www.cnr.cn", tags: "news,national" },
    { name: "Beijing News", url_resolved: "https://f.m.rbc.cn/1039/index.m3u8", favicon: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Beijing_Radio_and_Television_Station_logo.svg", homepage: "https://www.rbc.cn", tags: "news,local" },
    { name: "RTHK Radio 1", url_resolved: "https://rthk.hk/live1.m3u8", favicon: "https://upload.wikimedia.org/wikipedia/commons/a/aa/RTHK_Logo.svg", homepage: "https://www.rthk.hk", tags: "public,cantonese" },
    { name: "Shanghai Love", url_resolved: "http://lhttp.qingting.fm/live/386/64k.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Shanghai_Media_Group_logo.svg", homepage: "http://www.smg.cn", tags: "music,love" },
    { name: "Guangdong Music", url_resolved: "http://lhttp.qingting.fm/live/4804/64k.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/8/82/Guangdong_Radio_and_Television_logo.svg", homepage: "http://www.gdtv.cn", tags: "music,cantonese" }
  ],
  JP: [
    { name: "NHK World", url_resolved: "https://nhkwlive-ojp.akamaized.net/hls/live/2003459/nhkwlive-ojp-en/index.m3u8", favicon: "https://upload.wikimedia.org/wikipedia/commons/6/60/NHK_World-Japan_Logo_2018.svg", homepage: "https://www3.nhk.or.jp/nhkworld/", tags: "news,japanese" },
    { name: "J-Pop Powerplay", url_resolved: "https://kathy.torontocast.com:3060/;", favicon: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Flag_of_Japan.svg", homepage: "https://asiadreamradio.com", tags: "jpop,anime" }
  ],
  KR: [
    { name: "KBS World", url_resolved: "https://serpent0.duckdns.org:8088/kbs1.mp3", favicon: "https://upload.wikimedia.org/wikipedia/commons/7/74/KBS_World_Radio_Global_Logo.svg", homepage: "https://world.kbs.co.kr", tags: "kpop,news" }
  ],
  RU: [
    { name: "Radio Record", url_resolved: "https://radiorecord.hostingradio.ru/rr_main96.aacp", favicon: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Radio_Record_logo.png", homepage: "https://www.radiorecord.ru", tags: "dance,electronic" },
    { name: "Avtoradio", url_resolved: "https://ic7.101.ru:8000/v3_1", favicon: "https://upload.wikimedia.org/wikipedia/ru/3/36/Logotip_Avtoradio_2018.png", homepage: "https://www.avtoradio.ru", tags: "pop,rock" }
  ],
  MX: [
    { name: "Los 40 Mexico", url_resolved: "https://24423.live.streamtheworld.com/LOS40_MEXICO_SC", favicon: "https://upload.wikimedia.org/wikipedia/commons/4/48/LOS40_Espa%C3%B1a_logo_2016.svg", homepage: "https://los40.com.mx", tags: "pop,latin" },
    { name: "W Radio", url_resolved: "https://24403.live.streamtheworld.com/XEW_FM_SC", favicon: "https://wradio.com.mx/assets/images/logo.png", homepage: "https://wradio.com.mx", tags: "news,talk" }
  ],
  UA: [
    { name: "Hit FM", url_resolved: "https://online.hitfm.ua/HitFM", favicon: "https://www.hitfm.ua/images/logo.png", homepage: "https://www.hitfm.ua", tags: "hit,pop" },
    { name: "Lux FM", url_resolved: "https://online.lux.fm/lux32", favicon: "https://lux.fm/images/logo.png", homepage: "https://lux.fm", tags: "pop,entertainment" }
  ],
  GR: [
    { name: "Rhythm 94.9", url_resolved: "https://netradio.live24.gr/rythmos949", favicon: "https://www.rythmos949.com/assets/img/logo.png", homepage: "https://www.rythmos949.com", tags: "pop,greek" },
    { name: "Athens DJ", url_resolved: "https://netradio.live24.gr/athensdeejay", favicon: "https://www.athensdeejay.gr/assets/img/logo.png", homepage: "https://www.athensdeejay.gr", tags: "dance,hit" }
  ],
  AU: [
    { name: "Triple J", url_resolved: "https://live-radio01.mediahubaustralia.com/2TJW/mp3/", favicon: "https://upload.wikimedia.org/wikipedia/commons/3/36/Triple_J_logo.svg", homepage: "https://www.abc.net.au/triplej", tags: "alternative,rock" },
    { name: "Nova 96.9", url_resolved: "https://streaming.novaentertainment.com.au/nova969", favicon: "https://www.novafm.com.au/assets/images/logo.png", homepage: "https://www.novafm.com.au", tags: "pop,hit" }
  ],
  CA: [
    { name: "CBC Radio 1", url_resolved: "https://cbc_r1_tor.akacast.akamaistream.net/7/665/451661/v1/rc.akacast.akamaistream.net/cbc_r1_tor", favicon: "https://upload.wikimedia.org/wikipedia/commons/e/e3/CBC_Radio_One_logo.svg", homepage: "https://www.cbc.ca/radio", tags: "news,public" }
  ]
};

// --- API ---
const API_MIRRORS = [
  "https://at1.api.radio-browser.info",
  "https://de1.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
  "https://fr1.api.radio-browser.info",
  "https://us1.api.radio-browser.info"
];

const TRANSLATIONS = {
  TR: { code: "tr", searchPlaceholder: "Radyo ara...", categories: "Kategoriler", allRadios: "Tüm Radyolar", aiBtn: "AI Asistan", moodTitle: "Ruh Hali", moodDesc: "Modun nedir?", moodInput: "Örn: Çalışıyorum...", factTitle: "Yerel Bilgi", factDesc: "hakkında bilgi.", btnLoad: "Yükleniyor...", btnGetInfo: "Bilgi Getir", btnNewInfo: "Yeni Bilgi", clear: "Temizle", live: "CANLI", paused: "DURAKLATILDI", stations: "İstasyon", locationDetected: "Konum Algılandı", footerRights: "Tüm Hakları Saklıdır.", errorMsg: "Liste alınamadı.", retry: "Tekrar Dene", playingError: "Yayın açılmadı.", seoTitle: "Canlı Radyo Dinle", seoDesc: "Kesintisiz radyo keyfi." },
  EN: { code: "en", searchPlaceholder: "Search...", categories: "Genres", allRadios: "All Radios", aiBtn: "AI Assistant", moodTitle: "Current Mood", moodDesc: "Your vibe?", moodInput: "Ex: Working...", factTitle: "Facts", factDesc: "About", btnLoad: "Loading...", btnGetInfo: "Get Info", btnNewInfo: "New Fact", clear: "Clear", live: "LIVE", paused: "PAUSED", stations: "Stations", locationDetected: "Location", footerRights: "All Rights Reserved.", errorMsg: "Failed load.", retry: "Retry", playingError: "Stream failed.", seoTitle: "Listen Live Radio", seoDesc: "Listen online radio." },
  DE: { code: "de", searchPlaceholder: "Suche...", categories: "Genres", allRadios: "Alle Radios", aiBtn: "KI-Assistent", moodTitle: "Stimmung", moodDesc: "Wie fühlst du dich?", moodInput: "Z.B.: Arbeiten...", factTitle: "Fakten", factDesc: "Infos über", btnLoad: "Laden...", btnGetInfo: "Info", btnNewInfo: "Neu", clear: "Löschen", live: "LIVE", paused: "PAUSE", stations: "Sender", locationDetected: "Standort", footerRights: "Rechte vorbehalten.", errorMsg: "Fehler.", retry: "Erneut versuchen", playingError: "Fehler.", seoTitle: "Radio Hören", seoDesc: "Online Radio." }
};

const COUNTRIES = [
  { code: 'TR', name: 'Türkiye', flag: '🇹🇷' }, { code: 'DE', name: 'Deutschland', flag: '🇩🇪' }, { code: 'US', name: 'USA', flag: '🇺🇸' }, { code: 'GB', name: 'UK', flag: '🇬🇧' }, { code: 'FR', name: 'France', flag: '🇫🇷' }, { code: 'IT', name: 'Italia', flag: '🇮🇹' }, { code: 'ES', name: 'España', flag: '🇪🇸' }, { code: 'NL', name: 'Netherlands', flag: '🇳🇱' }, { code: 'BR', name: 'Brasil', flag: '🇧🇷' }, { code: 'AZ', name: 'Azerbaycan', flag: '🇦🇿' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' }, { code: 'CN', name: 'China', flag: '🇨🇳' }, { code: 'IN', name: 'India', flag: '🇮🇳' }, { code: 'MX', name: 'Mexico', flag: '🇲🇽' }, { code: 'UA', name: 'Ukraine', flag: '🇺🇦' }, { code: 'RU', name: 'Russia', flag: '🇷🇺' }, { code: 'JP', name: 'Japan', flag: '🇯🇵' }, { code: 'KR', name: 'Korea', flag: '🇰🇷' }, { code: 'GR', name: 'Greece', flag: '🇬🇷' }, { code: 'CA', name: 'Canada', flag: '🇨🇦' }, { code: 'AU', name: 'Australia', flag: '🇦🇺' }
];

const GENRES = ['all', 'pop', 'poptürk', 'arabesk', 'rock', 'jazz', 'news', 'classical', 'dance', 'folk', 'rap', 'electronic', 'lofi', 'slow'];

// --- SEO & UTILS ---
const updateSEO = (title, description, langCode) => {
  document.title = title;
  document.documentElement.lang = langCode;
  let metaDesc = document.querySelector("meta[name='description']");
  if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.name = "description"; document.head.appendChild(metaDesc); }
  metaDesc.setAttribute("content", description);
  let script = document.querySelector("#schema-struct");
  if (!script) { script = document.createElement('script'); script.id = "schema-struct"; script.type = "application/ld+json"; document.head.appendChild(script); }
  script.text = JSON.stringify({ "@context": "https://schema.org", "@type": "RadioStation", "name": "Radiocu", "url": "https://radiocu.com", "description": description, "inLanguage": langCode });
};

/* AI Features Disabled */
const callGemini = async () => { return "AI features disabled."; };

// --- BİLEŞENLER ---
const StationLogo = ({ url, alt, homepage, className }) => {
  const [imgSrc, setImgSrc] = useState(url);
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    if (!url || url.startsWith('http://')) {
      if (homepage) { setImgSrc(`https://www.google.com/s2/favicons?domain=${homepage}&sz=128`); } else { setHasError(true); }
    } else { setImgSrc(url); }
    setHasError(false);
  }, [url, homepage]);
  if (hasError || !imgSrc) { return (<div className={`flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-500 font-bold select-none ${className}`}>{alt ? alt.charAt(0).toUpperCase() : <Radio className="w-1/2 h-1/2 opacity-50" />}</div>); }
  return (<img src={imgSrc} alt={alt} className={`object-contain bg-white/5 p-1 ${className}`} onError={() => { if (homepage && !imgSrc.includes('google.com')) { setImgSrc(`https://www.google.com/s2/favicons?domain=${homepage}&sz=128`); } else { setHasError(true); } }} loading="lazy" referrerPolicy="no-referrer" />);
};

const AdSenseUnit = ({ slotId, style = {}, label }) => {
  useEffect(() => { if (IS_ADSENSE_LIVE && window.adsbygoogle) try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { } }, []);
  if (!IS_ADSENSE_LIVE) return <div className="w-full bg-slate-800/30 border border-slate-700/50 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-500 p-2 my-4 select-none" style={{ ...style, minHeight: style.height || '100px' }}><span className="text-[10px] uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded mb-1 text-slate-400">Reklam</span><p className="text-[10px] opacity-60 font-mono">{label}</p></div>;
  return <div className="ad-container my-4 bg-slate-900 flex justify-center items-center"><ins className="adsbygoogle" style={{ display: 'block', ...style }} data-ad-client={GOOGLE_AD_CLIENT_ID} data-ad-slot={slotId} data-full-width-responsive="true"></ins></div>;
};

// --- İÇERİK BİLEŞENLERİ ---
const FeaturesSection = ({ lang }) => {
  const content = {
    TR: [{ icon: <Wifi className="w-6 h-6" />, title: "Kesintisiz Yayın", desc: "Düşük internet hızlarında bile donmayan özel altyapı." }, { icon: <Headphones className="w-6 h-6" />, title: "Yüksek Kalite", desc: "Radyoların en yüksek bit hızındaki (HD) yayınları." }, { icon: <Globe className="w-6 h-6" />, title: "Global Erişim", desc: "Dünyanın her yerinden binlerce yerel istasyon." }, { icon: <Smartphone className="w-6 h-6" />, title: "Mobil Uyumlu", desc: "Telefon, tablet ve bilgisayarda mükemmel deneyim." }],
    EN: [{ icon: <Wifi className="w-6 h-6" />, title: "Uninterrupted", desc: "Stream without freezing even on low connections." }, { icon: <Headphones className="w-6 h-6" />, title: "High Quality", desc: "HD streams with the highest bitrate available." }, { icon: <Globe className="w-6 h-6" />, title: "Global Access", desc: "Thousands of local stations from around the world." }, { icon: <Smartphone className="w-6 h-6" />, title: "Mobile Ready", desc: "Perfect experience on phone, tablet, and desktop." }]
  };
  const features = content[lang] || content['EN'];
  return (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 mb-12">{features.map((f, i) => (<div key={i} className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl flex flex-col items-center text-center hover:bg-slate-800/50 transition"><div className="mb-3 p-3 bg-indigo-500/10 rounded-full text-indigo-400">{f.icon}</div><h4 className="text-white font-bold mb-1">{f.title}</h4><p className="text-xs text-slate-400">{f.desc}</p></div>))}</div>);
};

const BlogSection = ({ lang }) => {
  const articles = {
    TR: [{ title: "Dijital Radyonun Yükselişi", date: "24.11.2024", content: "FM frekanslarının yerini dijital streamler alıyor. Radiocu ile sınırları aşın." }, { title: "Neden Online Radyo?", date: "20.11.2024", content: "Cızırtı yok, kesinti yok. İnternetin olduğu her yerde CD kalitesinde müzik." }, { title: "Müzik ve Psikoloji", date: "15.11.2024", content: "Müziğin insan psikolojisi üzerindeki doğrudan etkisi bilimsel olarak kanıtlanmıştır." }],
    EN: [{ title: "Digital Radio", date: "Nov 24", content: "Digital streams replace FM, removing borders." }, { title: "Why Online?", date: "Nov 20", content: "CD-quality sound everywhere without static noise." }, { title: "Music & Mood", date: "Nov 15", content: "Music impacts psychology directly." }]
  };
  const list = articles[lang] || articles['EN'];
  return (<div className="mt-12 mb-12"><h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-500" /> Blog</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{list.map((article, i) => (<div key={i} className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800/60 hover:border-indigo-500/30 transition group flex flex-col"><div className="text-xs text-indigo-400 mb-2 font-mono">{article.date}</div><h3 className="text-lg font-bold text-slate-200 mb-3 group-hover:text-white transition">{article.title}</h3><p className="text-sm text-slate-500 leading-relaxed flex-1">{article.content}</p><div className="mt-4 flex items-center text-xs text-slate-400 font-medium group-hover:text-indigo-400 transition cursor-pointer">Devamını Oku <ChevronRight className="w-3 h-3 ml-1" /></div></div>))}</div></div>);
};

const FAQSection = ({ lang }) => {
  const faqs = {
    TR: [{ q: "Ücretli mi?", a: "Hayır, tamamen ücretsizdir." }, { q: "Radyo ekleyebilir miyim?", a: "İletişim bölümünden ulaşabilirsiniz." }, { q: "Mobil uygulama?", a: "Sitemiz %100 mobil uyumludur." }, { q: "Kota dostu mu?", a: "Ses verisi çok az internet harcar." }],
    EN: [{ q: "Is it free?", a: "Yes, completely free." }, { q: "Add station?", a: "Contact us via email." }, { q: "Mobile app?", a: "Fully responsive web app." }, { q: "Data usage?", a: "Audio consumes very little data." }]
  };
  const list = faqs[lang] || faqs['EN'];
  return (<div className="mt-8 mb-12"><h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-indigo-500" /> Sıkça Sorulan Sorular</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{list.map((item, i) => (<div key={i} className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition"><h4 className="text-sm font-bold text-slate-200 mb-2">{item.q}</h4><p className="text-xs text-slate-400 leading-relaxed">{item.a}</p></div>))}</div></div>);
};

const Footer = ({ lang }) => {
  return (<footer className="mt-16 py-12 border-t border-slate-800 bg-slate-950/50"><div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm"><div><h3 className="font-bold text-white mb-4 flex items-center gap-2"><BrandLogo className="w-5 h-5" /> Radiocu</h3><p className="text-slate-500 text-xs leading-relaxed">Dünyanın sesini cebinize getiren global radyo platformu. Kesintisiz, ücretsiz ve yüksek kaliteli müzik deneyimi.</p></div><div><h4 className="font-bold text-slate-300 mb-4">Kurumsal</h4><ul className="space-y-2 text-slate-500 text-xs"><li><a href="/hakkimizda.html" className="hover:text-indigo-400 transition">Hakkımızda</a></li><li><a href="mailto:info@radiocu.com" className="hover:text-indigo-400 transition">İletişim</a></li></ul></div><div><h4 className="font-bold text-slate-300 mb-4">Yasal</h4><ul className="space-y-2 text-slate-500 text-xs"><li><a href="/gizlilik-politikasi.html" className="hover:text-indigo-400 transition">Gizlilik Politikası</a></li><li><a href="/kullanim-sartlari.html" className="hover:text-indigo-400 transition">Kullanım Şartları</a></li></ul></div><div><p className="text-slate-500 text-xs mb-2">info@radiocu.com</p><div className="flex gap-3 mt-4"><div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center hover:bg-indigo-600 transition cursor-pointer"><Globe className="w-4 h-4 text-white" /></div><div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center hover:bg-indigo-600 transition cursor-pointer"><Mail className="w-4 h-4 text-white" /></div></div></div></div><div className="text-center text-[10px] text-slate-700 mt-12">&copy; 2024 Radiocu.com - All rights reserved.</div></footer>);
};

const SeoContent = ({ country, lang }) => {
  const countryName = COUNTRIES.find(c => c.code === country)?.name || country;
  const texts = { TR: { h2: `${countryName} Radyoları`, p: `Radiocu ile ${countryName} genelindeki en popüler radyo istasyonlarını ücretsiz dinleyin.` }, EN: { h2: `${countryName} Radio Stations`, p: `Listen to popular radio stations in ${countryName} for free with Radiocu.` } };
  const content = texts[lang] || texts['EN'];
  return (<div className="mt-12 mb-8 p-6 bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 text-sm leading-relaxed"><h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-indigo-500" /> {content.h2}</h2><p>{content.p}</p></div>);
};

// --- APP ---
export default function App() {
  const [stations, setStations] = useState([]);
  const [globalStations, setGlobalStations] = useState([]); // Global search results
  const [loading, setLoading] = useState(true);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('TR');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [autoLocated, setAutoLocated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appLang, setAppLang] = useState('EN');
  const t = TRANSLATIONS[appLang] || TRANSLATIONS['EN'];
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiMoodInput, setAiMoodInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFact, setAiFact] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [currentStation, setCurrentStation] = useState(null);
  const currentStationRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem('rs_volume')) || 0.8);
  const [error, setError] = useState(null);
  const audioRef = useRef(new Audio());

  const fetchWithFailover = async (countryCode) => {
    setLoading(true); setError(null);
    let data = [];
    // API Limit 600
    for (const server of API_MIRRORS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        // Increase Limit to 2000 for more variety
        const res = await fetch(`${server}/json/stations/bycountrycodeexact/${countryCode}?limit=2000&order=votes&reverse=true`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) { data = await res.json(); break; }
      } catch (e) { }
    }
    // Sıkı Filtreleme
    // Sıkı Filtreleme (M3U8 izni eklendi)
    let cleanData = data.filter(s => s.url_resolved && s.name.trim().length > 0 && !s.name.toLowerCase().includes("test") && (s.url_resolved.startsWith("https") || s.url_resolved.startsWith("http")));
    const vipList = VIP_STATIONS[countryCode] || [];
    cleanData = cleanData.filter(s => !vipList.some(v => v.name.toLowerCase() === s.name.toLowerCase()));
    const finalData = [...vipList.map(v => ({ ...v, stationuuid: `vip-${v.name}`, is_vip: true })), ...cleanData];
    if (finalData.length > 0) { setStations(finalData); } else { setError(t.errorMsg); }
    setLoading(false);
  };

  useEffect(() => {
    const initApp = async () => {
      audioRef.current.crossOrigin = "anonymous";
      const browserLang = navigator.language.split('-')[0].toUpperCase();
      if (TRANSLATIONS[browserLang]) setAppLang(browserLang);
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data?.country_code) {
          const code = data.country_code;
          if (COUNTRIES.find(c => c.code === code)) { setSelectedCountry(code); setAutoLocated(true); }
          if (TRANSLATIONS[code]) setAppLang(code);
        }
      } catch (e) { }
    };
    initApp();
    const audio = audioRef.current;
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => { setIsBuffering(false); setIsPlaying(true); setError(null); };
    const onPause = () => setIsPlaying(false);
    const onError = (e) => {
      setIsBuffering(false); setIsPlaying(false);
      const activeStation = currentStationRef.current;
      if (activeStation) {
        const currentSrc = audio.src;
        if (!activeStation.is_vip && currentSrc.startsWith("https://") && activeStation.url_resolved.startsWith("http://")) {
          console.warn("HTTPS fail, fallback to HTTP");
          audio.src = activeStation.url_resolved;
          audio.play().catch(() => setError(t.playingError));
          return;
        }
      }
      setError(t.playingError);
    };
    audio.addEventListener('waiting', onWaiting); audio.addEventListener('playing', onPlaying); audio.addEventListener('pause', onPause); audio.addEventListener('error', onError);
    return () => { audio.removeEventListener('waiting', onWaiting); audio.removeEventListener('playing', onPlaying); audio.removeEventListener('pause', onPause); audio.removeEventListener('error', onError); audio.pause(); };
  }, [t]);

  useEffect(() => { fetchWithFailover(selectedCountry); setAiFact(null); }, [selectedCountry]);

  useEffect(() => {
    currentStationRef.current = currentStation;
    if (currentStation) {
      setError(null); setIsBuffering(true);
      let streamUrl = currentStation.url_resolved;

      const audio = audioRef.current;

      // HLS Support
      if (streamUrl.includes('.m3u8') || streamUrl.includes('application/x-mpegURL')) {
        if (Hls.isSupported()) {
          if (window.hls) { window.hls.destroy(); } // Cleanup prev
          const hls = new Hls();
          window.hls = hls; // Keep ref to destroy later
          hls.loadSource(streamUrl);
          hls.attachMedia(audio);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            audio.play().catch(e => console.error("Play error:", e));
          });
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.error("HLS Fatal Error", data);
              setIsBuffering(false); setError(t.playingError);
              hls.destroy();
            }
          });
        } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari
          audio.src = streamUrl;
          audio.play().catch(e => { });
        }
      } else {
        // Standard Stream
        if (window.hls) { window.hls.destroy(); window.hls = null; }
        // REMOVED: Force HTTPS logic
        audio.src = streamUrl;
        audio.load();
        const playPromise = audio.play();
        if (playPromise !== undefined) { playPromise.catch(err => { if (err.name !== 'AbortError') { setIsBuffering(false); setIsPlaying(false); } }); }
      }

      updateSEO(`${currentStation.name} - Radiocu`, `${t.live}: ${currentStation.name}. ${t.seoDesc}`, appLang.toLowerCase());
    } else {
      if (window.hls) { window.hls.destroy(); window.hls = null; }
      audioRef.current.pause();
      const cName = COUNTRIES.find(c => c.code === selectedCountry)?.name || selectedCountry;
      updateSEO(`Radiocu - ${t.seoTitle}`, `${cName} - ${t.seoDesc}`, appLang.toLowerCase());
    }
  }, [currentStation]);

  useEffect(() => { if (isPlaying) { audioRef.current.play().catch(e => { }); } else { audioRef.current.pause(); } }, [isPlaying]);
  useEffect(() => { audioRef.current.volume = volume; localStorage.setItem('rs_volume', volume); }, [volume]);

  /* AI Mood Submit - Disabled */
  const handleMoodSubmit = async (e) => {
    e.preventDefault();
    // Disabled
  };

  /* AI Fact - Disabled */
  const handleGetCountryFact = async () => {
    // Disabled
  };

  /* Global Search Logic */
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setGlobalLoading(true);
        try {
          // Search in all countries
          const res = await fetch(`https://de1.api.radio-browser.info/json/stations/search?name=${encodeURIComponent(searchQuery)}&limit=50&order=votes&reverse=true`);
          if (res.ok) {
            let data = await res.json();
            // Filter broken/unwanted
            data = data.filter(s => s.url_resolved && !s.name.toLowerCase().includes("test") && (s.url_resolved.startsWith("http")));
            setGlobalStations(data);
          }
        } catch (e) {
          console.error("Global search failed", e);
        } finally {
          setGlobalLoading(false);
        }
      } else {
        setGlobalStations([]);
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredStations = (() => {
    const q = searchQuery.toLowerCase();

    // 1. Local filtering
    const localMatches = stations.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(q) || s.tags.toLowerCase().includes(q);
      const matchesGenre = selectedGenre === 'all' || s.tags.toLowerCase().includes(selectedGenre);
      return matchesSearch && matchesGenre;
    });

    // 2. Global merging (only if searching)
    if (globalStations.length > 0 && searchQuery.length > 2) {
      // Filter out duplicates that are already in localMatches
      const localIds = new Set(localMatches.map(s => s.stationuuid || s.url_resolved));
      const newGlobals = globalStations.filter(s => !localIds.has(s.stationuuid) && !localIds.has(s.url_resolved));
      return [...localMatches, ...newGlobals];
    }

    return localMatches;
  })();

  const theme = { bgMain: 'bg-slate-950', bgPanel: 'bg-slate-900/95', bgCard: 'bg-slate-800/40', textAccent: 'text-indigo-400', border: 'border-white/5', grad: 'from-indigo-600 to-purple-600' };

  return (
    <div className={`flex flex-col h-screen ${theme.bgMain} text-white font-sans overflow-hidden selection:bg-indigo-500/30`}>
      <header className={`h-16 ${theme.bgPanel} backdrop-blur-md border-b ${theme.border} flex items-center justify-between px-4 z-30 shrink-0`}>
        <div className="flex items-center gap-3 select-none cursor-pointer" onClick={() => { setCurrentStation(null); setSearchQuery(''); }}>
          <div className="w-10 h-10 shrink-0 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 bg-white/5 border border-white/10"><BrandLogo className="w-full h-full" /></div>
          <div className="flex flex-col justify-center h-10"><h1 className="text-xl font-bold tracking-tight text-white leading-none">Radiocu</h1><span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase leading-none mt-1">Global Player</span></div>
        </div>
        <div className="hidden md:flex flex-1 max-w-md mx-6"><div className={`flex items-center w-full ${theme.bgCard} rounded-lg px-4 py-2 border ${theme.border} focus-within:border-indigo-500/50 transition-colors`}><Search className="text-slate-500 w-4 h-4 mr-2" /><input type="text" placeholder={t.searchPlaceholder} className="bg-transparent w-full border-none outline-none text-sm text-white placeholder-slate-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div></div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-400 hover:text-white"><Menu /></button>
          {/* AI Button Disabled */}
          <div className={`hidden md:flex items-center gap-2 ${theme.bgCard} px-3 py-1.5 rounded-lg border ${theme.border}`}><MapPin className={`w-4 h-4 ${autoLocated ? theme.textAccent : 'text-slate-500'}`} /><select value={selectedCountry} onChange={(e) => { setSelectedCountry(e.target.value); setAutoLocated(false); }} className="bg-transparent outline-none text-sm font-medium cursor-pointer text-slate-300 max-w-[100px]">{COUNTRIES.map(c => <option key={c.code} value={c.code} className="bg-slate-900">{c.flag} {c.name}</option>)}</select></div>
          <div className="hidden md:flex items-center justify-center w-8 h-8 bg-slate-800 rounded text-xs font-bold text-slate-400 border border-slate-700 uppercase" title="Language">{appLang}</div>
        </div>
      </header>
      {mobileMenuOpen && (<div className="absolute top-16 left-0 w-full bg-slate-900 border-b border-slate-800 z-20 p-4 md:hidden animate-in slide-in-from-top-2"><div className="mb-4"><select value={selectedCountry} onChange={(e) => { setSelectedCountry(e.target.value); setMobileMenuOpen(false); }} className="w-full bg-slate-800 p-3 rounded-lg text-white border border-slate-700">{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}</select></div></div>)}
      <div className="flex flex-1 overflow-hidden relative">
        <aside className={`w-64 ${theme.bgPanel} border-r ${theme.border} hidden md:flex flex-col backdrop-blur-xl`}><div className="p-6 overflow-y-auto flex-1"><h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2"><Waves className="w-3 h-3" /> {t.categories}</h3><div className="space-y-1">{GENRES.map(g => (<button key={g} onClick={() => { setSelectedGenre(g); setSearchQuery(''); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-3 ${selectedGenre === g ? `bg-indigo-500/10 ${theme.textAccent} border border-indigo-500/20` : `text-slate-400 hover:text-white hover:bg-white/5`}`}><span className={`w-1.5 h-1.5 rounded-full ${selectedGenre === g ? 'bg-indigo-400' : 'bg-slate-700'}`}></span><span className="capitalize">{g === 'all' ? t.allRadios : g}</span></button>))}</div><div className="mt-8"><AdSenseUnit slotId="sidebar-ad" label="Sidebar" style={{ height: '250px' }} /></div></div><div className="p-6 border-t border-slate-800 text-center flex flex-col gap-1"><p className="text-xs text-slate-600 font-mono">© 2024 Radiocu</p><p className="text-[9px] text-slate-700">{t.footerRights}</p></div></aside>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-40">
          <div className="max-w-6xl mx-auto">
            <AdSenseUnit slotId="header-ad" label="Header Leaderboard" style={{ height: '90px' }} />
            <div className="mb-6 mt-6 border-b border-white/5 pb-4"><div className="flex flex-col md:flex-row md:items-center justify-between gap-4"><div><h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3"><span className="text-3xl">{searchQuery.length > 2 && globalStations.length > 0 ? <Globe className="w-8 h-8 text-indigo-400" /> : COUNTRIES.find(c => c.code === selectedCountry)?.flag}</span>{searchQuery.length > 2 ? 'Global Search Results' : COUNTRIES.find(c => c.code === selectedCountry)?.name}</h1><p className="text-sm text-slate-400 mt-2 flex items-center gap-2">{autoLocated && <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded text-xs border border-indigo-500/20 flex items-center gap-1"><Zap className="w-3 h-3" /> {t.locationDetected}</span>}<span className="bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700">{filteredStations.length} {t.stations} {globalLoading && <Loader2 className="inline w-3 h-3 animate-spin ml-1" />}</span></p></div><button onClick={() => fetchWithFailover(selectedCountry)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition self-end md:self-auto"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button></div></div>
            <div className="md:hidden mb-6"><div className={`flex items-center w-full ${theme.bgCard} rounded-lg px-4 py-3 border ${theme.border}`}><Search className="text-slate-500 w-4 h-4 mr-2" /><input type="text" placeholder={t.searchPlaceholder} className="bg-transparent w-full border-none outline-none text-sm text-white placeholder-slate-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div></div>
            {aiSuggestion && <div className="mb-6 p-4 rounded-xl bg-indigo-900/20 border border-indigo-500/30 flex justify-between items-center animate-in fade-in"><div className="flex items-center gap-3"><Bot className="w-5 h-5 text-indigo-400" /><span className="text-indigo-200 text-sm">{aiSuggestion}</span></div><button onClick={() => { setSearchQuery(''); setAiSuggestion(null); }} className="text-xs text-indigo-400 hover:text-white underline">{t.clear}</button></div>}
            {error && (<div className="mb-6 p-6 bg-red-500/10 border border-red-500/20 rounded-xl flex flex-col items-center justify-center text-center gap-3 animate-in fade-in"><AlertCircle className="w-8 h-8 text-red-400" /><p className="text-red-200 text-sm">{error}</p><button onClick={() => fetchWithFailover(selectedCountry)} className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg text-sm transition flex items-center gap-2"><RefreshCw className="w-4 h-4" /> {t.retry}</button></div>)}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {loading ? [...Array(8)].map((_, i) => <div key={i} className={`h-24 ${theme.bgCard} rounded-xl animate-pulse border ${theme.border}`}></div>) :
                filteredStations.map((s, idx) => (
                  <React.Fragment key={s.stationuuid}>
                    {idx > 0 && idx % 12 === 0 && <div className="col-span-full"><AdSenseUnit slotId="feed-ad" label="Feed Ads" style={{ height: '90px' }} /></div>}
                    <div onClick={() => setCurrentStation(s)} className={`group relative ${theme.bgCard} hover:bg-slate-800 rounded-xl p-3 transition-all cursor-pointer border ${currentStation?.stationuuid === s.stationuuid ? 'border-indigo-500 bg-indigo-500/10' : theme.border} hover:shadow-lg hover:-translate-y-0.5`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 relative bg-slate-900 border ${theme.border}`}><StationLogo url={s.favicon} homepage={s.homepage} alt={s.name} /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Play className="w-6 h-6 text-white fill-current" /></div>{currentStation?.stationuuid === s.stationuuid && isPlaying && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Activity className="w-6 h-6 text-indigo-400 animate-pulse" /></div>}</div>
                        <div className="flex-1 min-w-0"><h3 className={`font-bold truncate text-sm ${currentStation?.stationuuid === s.stationuuid ? 'text-indigo-400' : 'text-slate-200'}`}>{s.name}</h3><p className="text-xs text-slate-500 truncate mt-0.5">{s.tags ? s.tags.split(',').slice(0, 2).join(', ') : 'Radyo'}</p><div className="flex items-center mt-1.5 gap-2"><span className="text-[10px] bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700">{s.bitrate || 128}k</span></div></div>
                      </div>
                    </div>
                  </React.Fragment>
                ))
              }
            </div>
            <FeaturesSection lang={appLang} />
            <BlogSection lang={appLang} />
            <SeoContent country={selectedCountry} lang={appLang} />
            <FAQSection lang={appLang} />
            <Footer lang={appLang} />
            <div className="mt-12 mb-24"><AdSenseUnit slotId="footer-ad" label="Footer" style={{ height: '120px' }} /></div>
          </div>
        </main>
        {/* AI Sidebar Disabled */}
      </div>
      <div className={`h-24 ${theme.bgPanel} border-t ${theme.border} fixed bottom-0 w-full flex items-center px-4 md:px-8 z-40 shadow-[0_-5px_30px_rgba(0,0,0,0.5)]`}>
        <div className="w-1/3 flex items-center gap-4">
          {currentStation ? (
            <>
              <div className={`w-14 h-14 rounded-xl border ${theme.border} bg-slate-900 hidden sm:block relative overflow-hidden`}><StationLogo url={currentStation.favicon} homepage={currentStation.homepage} alt={currentStation.name} /></div>
              <div><h4 className="text-white font-bold text-sm line-clamp-1">{currentStation.name}</h4><div className="flex items-center gap-2 mt-1">{isBuffering ? <span className="text-xs text-yellow-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> {t.btnLoad}</span> : <span className={`text-[10px] font-mono uppercase tracking-wide flex items-center gap-1 ${isPlaying ? 'text-green-400' : 'text-slate-500'}`}><span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></span>{isPlaying ? t.live : t.paused}</span>}</div></div>
            </>
          ) : <div className="text-slate-500 text-xs flex items-center gap-2"><Radio className="w-4 h-4" /> {appLang === 'TR' ? 'İstasyon seçin...' : 'Select station...'}</div>}
        </div>
        <div className="w-1/3 flex justify-center gap-4 sm:gap-6 items-center">
          <button className="text-slate-500 hover:text-white transition"><SkipBack className="w-5 h-5" /></button>
          <button onClick={() => { if (currentStation) { if (isPlaying) { audioRef.current.pause(); } else { if (audioRef.current.error) { audioRef.current.load(); } audioRef.current.play().catch(e => { console.error(e); }); } } }} disabled={!currentStation || isBuffering} className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg ${!currentStation ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 text-white hover:scale-105 hover:bg-indigo-500'}`}>{isBuffering ? <Loader2 className="w-6 h-6 animate-spin" /> : (isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />)}</button>
          <button className="text-slate-500 hover:text-white transition"><SkipForward className="w-5 h-5" /></button>
        </div>
        <div className="w-1/3 flex justify-end items-center gap-3"><button onClick={() => setVolume(v => v === 0 ? 0.8 : 0)} className="text-slate-400 hover:text-white transition hidden sm:block">{volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}</button><input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-20 sm:w-28 h-1 bg-slate-700 rounded-full cursor-pointer accent-indigo-500" /></div>
      </div>
    </div>
  );
}