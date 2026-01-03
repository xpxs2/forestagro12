
export interface CropDetail {
  name: string;
  datePlanted: string;
  fertilizerType: string;
}

export interface Plot {
  id: string;
  name: string;
  farmerId: string;
  country: string;
  province: string;
  district: string;
  nearestLandmark: string;
  roadAccess: string;
  gisPolygon: { lat: number; lng: number }[];
  area: number; // in hectares
  landUse: string;
  species: CropDetail[];
  notes: {
    topographical?: string;
    forestryBotany?: string;
    localProfile?: string;
  };
}

export const plots: Plot[] = [
  {
    id: 'plot1',
    name: 'North Field',
    farmerId: 'farmer1',
    country: 'TH',
    province: 'Chiang Mai',
    district: 'Mae Rim',
    nearestLandmark: 'Mae Rim District Office',
    roadAccess: 'Accessed via Highway 107',
    gisPolygon: [
      { lat: 18.9012, lng: 98.9505 },
      { lat: 18.9133, lng: 98.9505 },
      { lat: 18.9133, lng: 98.9608 },
      { lat: 18.9012, lng: 98.9608 },
    ],
    area: 5.2,
    landUse: 'Agroforestry',
    species: [
      { name: 'Mango', datePlanted: '2023-04-15', fertilizerType: 'Organic Compost' },
      { name: 'Longan', datePlanted: '2023-05-01', fertilizerType: '15-15-15 NPK' },
      { name: 'Teak', datePlanted: '2022-11-20', fertilizerType: 'Manure' },
    ],
    notes: {
      topographical: 'Gentle slope, well-drained soil.',
      forestryBotany: 'Dominated by native Dipterocarp species in surrounding areas.',
      localProfile: 'Area is known for fruit orchards and sustainable forestry initiatives.'
    }
  },
  {
    id: 'plot2',
    name: 'River Bend Parcel',
    farmerId: 'farmer1',
    country: 'TH',
    province: 'Chiang Mai',
    district: 'Doi Saket',
    nearestLandmark: 'Doi Saket Hospital',
    roadAccess: 'Unpaved road, 2km from main road',
    gisPolygon: [
        { lat: 18.8540, lng: 99.0510 },
        { lat: 18.8650, lng: 99.0510 },
        { lat: 18.8650, lng: 99.0620 },
        { lat: 18.8540, lng: 99.0620 },
    ],
    area: 12.5,
    landUse: 'Paddy Field',
    species: [
       { name: 'Jasmine Rice', datePlanted: '2023-06-01', fertilizerType: 'Urea' },
    ],
    notes: {
      topographical: 'Flat, floodplain area adjacent to the Ping River.',
      localProfile: 'Traditional rice farming community.'
    }
  },
];
