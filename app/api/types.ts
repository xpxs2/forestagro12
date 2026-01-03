
// src/app/api/types.ts

export interface User {
  id: string;
  email: string;
  role: 'farmer' | 'aggregator' | 'admin' | 'ranger' | 'merchant' | 'expert';
  name?: string;
  photoUrl?: string;
  phone?: string;
  nationalId?: string;
  address?: {
    village: string;
    commune: string;
    district: string;
    province: string;
    country: string;
  };
  householdSize?: number;
  dependencyRatio?: number;
  memberships?: string[];
  mainIncomeSources?: string[];
  communityRole?: string;
  farmerId?: string;
  profileUpdateCount?: number;
  businessName?: string;
  businessType?: string;
  businessRegistrationNumber?: string;
}

export interface Plot {
  id: string;
  farmerId: string;
  nickname: string; // User-friendly name for the plot
  isSample?: boolean;
  polygon: Array<{ lat: number; lng: number }>; // Geo-tagged polygon (max 10 points)
  area: number; // in hectares
  elevation: number; // in meters
  slopeClass: string; // e.g., '0-5%', '5-15%'
  proximity: {
      roads: string; // e.g., '500m to main road'
      water: string; // e.g., 'Adjacent to river'
      protectedAreas: string; // e.g., '2km from national park'
  };
  plotType: string; // e.g., 'Upland', 'Lowland', 'Homegarden'
  landscapePosition: string; // e.g., 'Riparian buffer', 'Peatland'
  linkages: {
      nearestLandmark: string; // e.g., 'Kirirom Primary School'
      village: string;
      watershed: string;
      province: string;
  };
  // Existing fields - will need to decide if they are still needed or replaced
  name: string; // This might be replaced by 'nickname'
  location: { latitude: number; longitude: number; }; // This is replaced by 'polygon'
  crops: Crop[];
  soilType: string;
  gpsCoordinates: { lat: number; lon: number; };
  // Expert profile for more detailed geo-botanical info
  expertProfile?: {
      assignedLandUse: string;
      topographicReport: string;
      hydrographicProfile: string;
      forestryProfile: string;
  };
}

export interface Crop {
  id: string;
  name: string;
  variety: string;
  plantingDate: string; // ISO 8601 format
  expectedHarvestDate: string; // ISO 8601 format
}

export interface Harvest {
  id: string;
  plotId: string;
  cropId: string;
  quantity: number; // in kilograms
  harvestDate: string; // ISO 8601 format
  quality: string;
}
