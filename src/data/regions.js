// Region groupings for the region filter tabs
export const REGIONS = {
    all: {
        label: { TR: 'Tümü', EN: 'All' },
        icon: '🌍',
        codes: null, // null means show all
    },
    europe: {
        label: { TR: 'Avrupa', EN: 'Europe' },
        icon: '🏰',
        codes: ['TR', 'DE', 'GB', 'FR', 'IT', 'ES', 'NL', 'AZ', 'RU', 'AT', 'CH', 'BE', 'PT', 'UA'],
    },
    asia: {
        label: { TR: 'Asya', EN: 'Asia' },
        icon: '🏯',
        codes: ['CN', 'IN', 'JP', 'KR', 'SA', 'AE', 'SG', 'TW', 'KZ'],
    },
    northAmerica: {
        label: { TR: 'Kuzey Amerika', EN: 'North America' },
        icon: '🗽',
        codes: ['US', 'CA'],
    },
    southAmerica: {
        label: { TR: 'Güney Amerika', EN: 'South America' },
        icon: '🌴',
        codes: ['BR', 'AR', 'MX'],
    },
    africa: {
        label: { TR: 'Afrika', EN: 'Africa' },
        icon: '🌍',
        codes: ['EG', 'NG', 'ZA'],
    },
    oceania: {
        label: { TR: 'Okyanusya', EN: 'Oceania' },
        icon: '🏝️',
        codes: ['AU', 'NZ'],
    },
};

/**
 * Get the region key for a given country code
 */
export function getRegionForCountry(countryCode) {
    for (const [key, region] of Object.entries(REGIONS)) {
        if (key === 'all') continue;
        if (region.codes?.includes(countryCode)) return key;
    }
    return 'europe'; // fallback
}
