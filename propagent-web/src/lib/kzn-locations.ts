// KZN, South Africa locations for Agent Loop
// Focused on North Coast: Ballito, Salt Rock, Sheffield, Umhlanga, Midlands

export const kznLocations = {
  provinces: [
    { id: 'kzn', name: 'KwaZulu-Natal', code: 'KZN' },
  ],
  
  suburbs: [
    // Ballito
    { id: 'ballito', name: 'Ballito', city: 'Durban', province: 'KZN', latitude: -29.5333, longitude: 31.2167 },
    { id: 'ballito-bezuidenhout', name: 'Bezuidenhout', city: 'Durban', province: 'KZN', latitude: -29.5256, longitude: 31.2144 },
    { id: 'ballito-central', name: 'Central', city: 'Durban', province: 'KZN', latitude: -29.5289, longitude: 31.2183 },
    { id: 'ballito-sacrifice', name: 'Sacrifice', city: 'Durban', province: 'KZN', latitude: -29.5400, longitude: 31.2200 },
    { id: 'shaka\'s-rock', name: "Shaka's Rock", city: 'Durban', province: 'KZN', latitude: -29.5067, longitude: 31.2367 },
    
    // Salt Rock
    { id: 'salt-rock', name: 'Salt Rock', city: 'Durban', province: 'KZN', latitude: -29.4833, longitude: 31.2500 },
    { id: 'salt-rock-beach', name: 'Salt Rock Beach', city: 'Durban', province: 'KZN', latitude: -29.4850, longitude: 31.2520 },
    { id: 'tongaat', name: 'Tongaat', city: 'Durban', province: 'KZN', latitude: -29.5833, longitude: 31.1500 },
    { id: 'sibaya', name: 'Sibaya', city: 'Durban', province: 'KZN', latitude: -29.5167, longitude: 31.2333 },
    
    // Sheffield
    { id: 'sheffield', name: 'Sheffield', city: 'Durban', province: 'KZN', latitude: -29.5667, longitude: 31.1667 },
    { id: 'sheffield-beach', name: 'Sheffield Beach', city: 'Durban', province: 'KZN', latitude: -29.5680, longitude: 31.1700 },
    { id: 'blythdale', name: 'Blythdale', city: 'Durban', province: 'KZN', latitude: -29.5500, longitude: 31.1833 },
    { id: 'doon-heights', name: 'Doon Heights', city: 'Durban', province: 'KZN', latitude: -29.5580, longitude: 31.1750 },
    
    // Umhlanga
    { id: 'umhlanga', name: 'Umhlanga', city: 'Durban', province: 'KZN', latitude: -29.7333, longitude: 31.9333 },
    { id: 'umhlanga-ridge', name: 'Umhlanga Ridge', city: 'Durban', province: 'KZN', latitude: -29.7250, longitude: 31.9450 },
    { id: 'umhlanga-rocks', name: 'Umhlanga Rocks', city: 'Durban', province: 'KZN', latitude: -29.7350, longitude: 31.9350 },
    { id: 'umhlanga-newtown', name: 'Newtown', city: 'Durban', province: 'KZN', latitude: -29.7400, longitude: 31.9300 },
    { id: 'pearlridge', name: 'Pearl Ridge', city: 'Durban', province: 'KZN', latitude: -29.7200, longitude: 31.9500 },
    { id: 'brettonwood', name: 'Brettonwood', city: 'Durban', province: 'KZN', latitude: -29.7150, longitude: 31.9400 },
    { id: 'sunningdale', name: 'Sunningdale', city: 'Durban', province: 'KZN', latitude: -29.7100, longitude: 31.9350 },
    { id: 'glen-anglia', name: 'Glen Anglia', city: 'Durban', province: 'KZN', latitude: -29.7050, longitude: 31.9250 },
    { id: 'mount-edgecombe', name: 'Mount Edgecombe', city: 'Durban', province: 'KZN', latitude: -29.7167, longitude: 31.9000 },
    { id: 'genazzano', name: 'Genazzano', city: 'Durban', province: 'KZN', latitude: -29.7080, longitude: 31.9100 },
    
    // Midlands
    { id: 'pietermaritzburg', name: 'Pietermaritzburg', city: 'Pietermaritzburg', province: 'KZN', latitude: -29.6000, longitude: 30.3833 },
    { id: 'howick', name: 'Howick', city: 'Pietermaritzburg', province: 'KZN', latitude: -29.4833, longitude: 30.2333 },
    { id: 'cascades', name: 'Cascades', city: 'Pietermaritzburg', province: 'KZN', latitude: -29.5850, longitude: 30.3950 },
    { id: 'montrose', name: 'Montrose', city: 'Pietermaritzburg', province: 'KZN', latitude: -29.5900, longitude: 30.3850 },
    { id: 'wembley', name: 'Wembley', city: 'Pietermaritzburg', province: 'KZN', latitude: -29.5950, longitude: 30.3800 },
    { id: 'clarendon', name: 'Clarendon', city: 'Pietermaritzburg', province: 'KZN', latitude: -29.6100, longitude: 30.3900 },
    { id: 'imbalenhle', name: 'Imbalenhle', city: 'Pietermaritzburg', province: 'KZN', latitude: -29.6200, longitude: 30.3700 },
    { id: 'sweetwaters', name: 'Sweetwaters', city: 'Pietermaritzburg', province: 'KZN', latitude: -29.6300, longitude: 30.3600 },
    
    // Other KZN areas
    { id: 'durban-central', name: 'Durban Central', city: 'Durban', province: 'KZN', latitude: -29.8533, longitude: 31.0267 },
    { id: 'musgrave', name: 'Musgrave', city: 'Durban', province: 'KZN', latitude: -29.8333, longitude: 31.0333 },
    { id: 'morningside', name: 'Morningside', city: 'Durban', province: 'KZN', latitude: -29.8350, longitude: 31.0300 },
    { id: 'glenmore', name: 'Glenmore', city: 'Durban', province: 'KZN', latitude: -29.8400, longitude: 31.0350 },
    { id: ' essenwood', name: 'Essenwood', city: 'Durban', province: 'KZN', latitude: -29.8380, longitude: 31.0280 },
    { id: 'north-beach', name: 'North Beach', city: 'Durban', province: 'KZN', latitude: -29.8500, longitude: 31.0350 },
    { id: 'umdloti', name: 'Umdloti', city: 'Durban', province: 'KZN', latitude: -29.6667, longitude: 31.1167 },
    { id: 'la-mercie', name: 'La Mercie', city: 'Durban', province: 'KZN', latitude: -29.6700, longitude: 31.1200 },
    { id: 'richards-bay', name: 'Richards Bay', city: 'Richards Bay', province: 'KZN', latitude: -28.7833, longitude: 32.1000 },
    { id: 'zinkwazi', name: 'Zinkwazi', city: 'Durban', province: 'KZN', latitude: -29.4500, longitude: 31.2667 },
    { id: 'kwelani', name: 'Kwelani', city: 'Durban', province: 'KZN', latitude: -29.4600, longitude: 31.2600 },
  ],
  
  popularAreas: [
    { id: 'ballito', name: 'Ballito', description: 'Popular beach town with great amenities' },
    { id: 'salt-rock', name: 'Salt Rock', description: 'Quiet coastal village with beach' },
    { id: 'sheffield', name: 'Sheffield Beach', description: 'Secluded beach area' },
    { id: 'umhlanga', name: 'Umhlanga', description: 'Upscale suburb with beaches and shopping' },
    { id: 'umhlanga-ridge', name: 'Umhlanga Ridge', description: 'Business and retail hub' },
    { id: 'mount-edgecombe', name: 'Mount Edgecombe', description: 'Golf estate suburb' },
    { id: 'pietermaritzburg', name: 'Pietermaritzburg', description: 'Capital city of KZN' },
    { id: 'howick', name: 'Howick', description: 'Midlands town with character' },
    { id: 'durban-north', name: 'Durban North', description: 'Suburban area north of Durban' },
  ],
  
  streets: {
    'ballito': [
      'Ocean View Drive',
      'Lagoon Drive',
      'Compensation Beach Road',
      'Ballito Beach Road',
      'Harvey Drive',
      'Congo Road',
      'Bill Campbell Road',
      'Marlborough Road',
      'Izuleni Road',
      'Nandi Road'
    ],
    'umhlanga': [
      'Ocean Way',
      'Lighthouse Road',
      'Chartwell Drive',
      'Umhlanga Rocks Drive',
      'McCauley Road',
      'Park Road',
      'Herbert Baker Road',
      'Nixon Drive',
      'Wilton Drive',
      'Grays Inn Road'
    ],
    'salt-rock': [
      'Ocean Road',
      'Salt Rock Road',
      'Tongaat Road',
      'Sheffield Road',
      'Ballito Road'
    ]
  }
};

// Property type preferences by area
export const areaProfiles = {
  'ballito': {
    propertyTypes: ['house', 'apartment', 'townhouse'],
    avgRentRange: { min: 8000, max: 25000 },
    avgSaleRange: { min: 1500000, max: 8000000 },
    popularFeatures: ['pool', 'garden', 'nearBeach', 'security']
  },
  'salt-rock': {
    propertyTypes: ['house', 'apartment'],
    avgRentRange: { min: 7000, max: 18000 },
    avgSaleRange: { min: 1200000, max: 5000000 },
    popularFeatures: ['nearBeach', 'garden', 'view']
  },
  'umhlanga': {
    propertyTypes: ['apartment', 'house', 'townhouse'],
    avgRentRange: { min: 10000, max: 35000 },
    avgSaleRange: { min: 2000000, max: 12000000 },
    popularFeatures: ['security', 'pool', 'gym', 'view']
  },
  'midlands': {
    propertyTypes: ['house', 'townhouse', 'farm'],
    avgRentRange: { min: 5000, max: 15000 },
    avgSaleRange: { min: 800000, max: 4000000 },
    popularFeatures: ['garden', 'fireplace', 'largePlot']
  }
};
