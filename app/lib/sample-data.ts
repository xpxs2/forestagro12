
// src/app/lib/sample-data.ts

// --- DATA & TYPES ---
// These types should be consistent with the ones used in the land-use page.

interface FarmAsset {
    id: string;
    name: string;
    purpose: string;
    quantity: number;
    unit: string;
}

interface SeasonalCrop {
    id: string;
    name: string;
    purpose: string;
}

interface Livestock {
    id: string;
    type: string;
    purpose: string;
    quantity: number;
}

interface SampleLandUseData {
    assets: FarmAsset[];
    crops: SeasonalCrop[];
    livestock: Livestock[];
}

// --- SAMPLE DATA SOURCE ---
// This object holds different sample data sets based on a "country-province" key.
// This is a scalable way to add more regional examples.

const sampleDataRegistry: { [key: string]: SampleLandUseData } = {
    // Sample Data for Lam Dong, Vietnam
    "vietnam-lam_dong": {
        assets: [
            { id: 'vn-a-1', name: 'Coffee Trees (Arabica)', purpose: 'For Selling Beans', quantity: 800, unit: 'Trees' },
            { id: 'vn-a-2', name: 'Avocado Trees', purpose: 'For Selling Fruit', quantity: 50, unit: 'Trees' },
            { id: 'vn-a-3', name: 'Persimmon Trees', purpose: 'For Family Food & Local Sale', quantity: 30, unit: 'Trees' },
        ],
        crops: [
            { id: 'vn-c-1', name: 'Cabbages', purpose: 'Intercropped for Quick Sale' },
            { id: 'vn-c-2', name: 'Sweet Potatoes', purpose: 'Primary Family Food' },
        ],
        livestock: [
            { id: 'vn-l-1', type: 'Pigs', purpose: 'For Selling', quantity: 5 },
        ]
    },

    // Sample Data for Palawan, Philippines
    "philippines-palawan": {
        assets: [
            { id: 'ph-a-1', name: 'Cashew Trees', purpose: 'For Selling Nuts', quantity: 150, unit: 'Trees' },
            { id: 'ph-a-2', name: 'Coconut Palms', purpose: 'For Coconuts & Copra', quantity: 200, unit: 'Trees' },
            { id: 'ph-a-3', name: 'Banana Plants', purpose: 'For Family Food & Local Sale', quantity: 100, unit: 'Plants' },
        ],
        crops: [
            { id: 'ph-c-1', name: 'Upland Rice', purpose: 'Primary Family Food' },
            { id: 'ph-c-2', name: 'Ginger', purpose: 'For Selling at Market' },
        ],
        livestock: [
            { id: 'ph-l-1', type: 'Goats', purpose: 'For Milk & Selling', quantity: 10 },
        ]
    },

    // Default fallback data
    "default": {
        assets: [
            { id: 'def-a-1', name: 'Fast-Growing Timber Trees', purpose: 'Long-term Timber Sale', quantity: 250, unit: 'Trees' },
            { id: 'def-a-2', name: 'Mixed Fruit Trees', purpose: 'For Family Food & Local Sale', quantity: 40, unit: 'Trees' },
        ],
        crops: [
            { id: 'def-c-1', name: 'Corn / Maize', purpose: 'Family Food & Animal Feed' },
        ],
        livestock: [
            { id: 'def-l-1', type: 'Chickens', purpose: 'For Eggs & Family Food', quantity: 20 },
        ]
    }
};

/**
 * Gets a sample land use dataset based on country and province.
 * @param country The country of the user.
 * @param province The province of the user.
 * @returns A SampleLandUseData object.
 */
export function getSampleLandUse(country?: string, province?: string): SampleLandUseData {
    if (country && province) {
        const key = `${country.toLowerCase().replace(/ /g, '_')}-${province.toLowerCase().replace(/ /g, '_')}`;
        if (sampleDataRegistry[key]) {
            return sampleDataRegistry[key];
        }
    }
    return sampleDataRegistry.default;
}
