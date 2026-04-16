// Country-specific city/landmark images from Unsplash (640px width, free to use)
// Each station card picks from its country's image pool using a hash of the station name

const CITY_IMAGES = {
    TR: [
        'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=640&q=80', // Hagia Sophia
        'https://images.unsplash.com/photo-1526048598645-62b31f82aaca?w=640&q=80', // Cappadocia
        'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=640&q=80', // Bosphorus
        'https://images.unsplash.com/photo-1568781269551-9e4b6ce91e23?w=640&q=80', // Antalya
        'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=640&q=80', // Istanbul skyline
        'https://images.unsplash.com/photo-1589561454226-796a8c0ef75b?w=640&q=80', // Grand Bazaar
    ],
    US: [
        'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=640&q=80', // NYC skyline
        'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=640&q=80', // Golden Gate
        'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=640&q=80', // Times Square
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&q=80', // Grand Canyon
        'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=640&q=80', // Miami
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=640&q=80', // San Francisco
    ],
    GB: [
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=640&q=80', // London skyline
        'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=640&q=80', // Big Ben
        'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=640&q=80', // London Bridge
        'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=640&q=80', // Edinburgh
        'https://images.unsplash.com/photo-1560930950-5a5e3ab0a38d?w=640&q=80', // Tower Bridge
    ],
    FR: [
        'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=640&q=80', // Eiffel Tower
        'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=640&q=80', // Paris streets
        'https://images.unsplash.com/photo-1549144511-f099e773c147?w=640&q=80', // Louvre
        'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=640&q=80', // Nice
        'https://images.unsplash.com/photo-1551887196-72e32bfc7bf3?w=640&q=80', // Provence
    ],
    DE: [
        'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=640&q=80', // Berlin
        'https://images.unsplash.com/photo-1449452198679-05c7fd30f416?w=640&q=80', // Neuschwanstein
        'https://images.unsplash.com/photo-1534313314376-a72289b6181e?w=640&q=80', // Cologne
        'https://images.unsplash.com/photo-1577462281852-fefb06917adb?w=640&q=80', // Munich
        'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=640&q=80', // Berlin Wall
    ],
    IT: [
        'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=640&q=80', // Colosseum
        'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=640&q=80', // Venice
        'https://images.unsplash.com/photo-1515859005217-8a1f08870f59?w=640&q=80', // Amalfi
        'https://images.unsplash.com/photo-1543429258-3bff3629e3cc?w=640&q=80', // Florence
        'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=640&q=80', // Rome
    ],
    ES: [
        'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=640&q=80', // Sagrada Familia
        'https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=640&q=80', // Alhambra
        'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=640&q=80', // Madrid
        'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=640&q=80', // Barcelona
        'https://images.unsplash.com/photo-1504019347908-b45f9b0b8dd5?w=640&q=80', // Seville
    ],
    JP: [
        'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=640&q=80', // Mount Fuji
        'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=640&q=80', // Fushimi Inari
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=640&q=80', // Tokyo Tower
        'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=640&q=80', // Osaka
        'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=640&q=80', // Kyoto
    ],
    BR: [
        'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=640&q=80', // Christ Redeemer
        'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=640&q=80', // Copacabana
        'https://images.unsplash.com/photo-1544989164-31dc3927c046?w=640&q=80', // Iguazu
        'https://images.unsplash.com/photo-1554168848-228452c09d60?w=640&q=80', // São Paulo
    ],
    RU: [
        'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=640&q=80', // Red Square
        'https://images.unsplash.com/photo-1547448415-e9f5b28e570d?w=640&q=80', // St Basil's
        'https://images.unsplash.com/photo-1556610961-2fecc5927173?w=640&q=80', // St Petersburg
        'https://images.unsplash.com/photo-1520106212299-d99c443e4568?w=640&q=80', // Moscow
    ],
    CN: [
        'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=640&q=80', // Great Wall
        'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=640&q=80', // Shanghai
        'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=640&q=80', // Forbidden City
        'https://images.unsplash.com/photo-1517309230475-e3fa5e4f2746?w=640&q=80', // Beijing
    ],
    IN: [
        'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=640&q=80', // Taj Mahal
        'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=640&q=80', // India Gate
        'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=640&q=80', // Jaipur
        'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=640&q=80', // Mumbai
    ],
    KR: [
        'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=640&q=80', // Seoul
        'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=640&q=80', // Gyeongbokgung
        'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=640&q=80', // Bukchon
        'https://images.unsplash.com/photo-1546874177-9e664107314e?w=640&q=80', // Busan
    ],
    NL: [
        'https://images.unsplash.com/photo-1534351590666-13e3e96b5b3a?w=640&q=80', // Amsterdam
        'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=640&q=80', // Canals
        'https://images.unsplash.com/photo-1512470876337-d2e5dda56e3b?w=640&q=80', // Windmills
        'https://images.unsplash.com/photo-1584003564911-a7fbbf1ce6d7?w=640&q=80', // Tulips
    ],
    SA: [
        'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=640&q=80', // Riyadh
        'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=640&q=80', // Desert
        'https://images.unsplash.com/photo-1586724237569-9c5b2c5e4b3d?w=640&q=80', // Al-Ula
    ],
    AZ: [
        'https://images.unsplash.com/photo-1569587112025-0d460e81a126?w=640&q=80', // Flame Towers
        'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=640&q=80', // Old City Baku
        'https://images.unsplash.com/photo-1604249530023-9e1494ea4478?w=640&q=80', // Baku skyline
    ],
};

// Fallback images for countries without specific entries
const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=640&q=80', // City skyline
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=640&q=80', // Night city
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=640&q=80', // Urban
    'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=640&q=80', // Night skyline
];

/**
 * Get a city image URL for a station based on country and station name
 * Uses a simple hash to consistently pick the same image for the same station
 */
export function getCityImage(countryCode, stationName = '') {
    const images = CITY_IMAGES[countryCode] || FALLBACK_IMAGES;
    // Simple hash from station name to get consistent image per station
    let hash = 0;
    for (let i = 0; i < stationName.length; i++) {
        hash = ((hash << 5) - hash) + stationName.charCodeAt(i);
        hash |= 0;
    }
    return images[Math.abs(hash) % images.length];
}

export default CITY_IMAGES;
