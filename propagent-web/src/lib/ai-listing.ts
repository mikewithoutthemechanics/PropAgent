'use client';

import { PropertyFormData, PropertyFeatures } from '@/types/property';

interface ListingGenerated {
  title: string;
  description: string;
}

const propertyTypeLabels: Record<string, string> = {
  house: 'Stunning Family Home',
  apartment: 'Modern Apartment',
  townhouse: 'Elegant Townhouse',
  flat: 'Cozy Flat',
  villa: 'Luxurious Villa',
  penthouse: 'Premium Penthouse',
  duplex: 'Contemporary Duplex',
  vacant_land: 'Prime Land',
  commercial: 'Commercial Property',
  industrial: 'Industrial Space',
};

const locationPhrases: Record<string, string[]> = {
  gauteng: ['in the heart of Sandton', 'in sought-after Sandton', 'in prestigious Sandton'],
  western_cape: ['in desirable Cape Town', 'in scenic Cape Town', 'with mountain views'],
  kwazulu_natal: ['in sunny KwaZulu-Natal', 'along the coast', 'in vibrant Durban'],
  Limpopo: ['in scenic Limpopo', 'in the bushveld', 'with natural beauty'],
  Mpumalanga: ['in the Lowveld', 'with scenic views', 'in paradise'],
  Free_State: ['in the Free State', 'in charming Bloemfontein'],
  Eastern_Cape: ['in the Eastern Cape', 'along the coast', 'in historic Port Elizabeth'],
  North_West: ['in the North West', 'in Rustenburg'],
  Northern_Cape: ['in the Northern Cape', 'in Kimberley'],
  South_Cape: ['in the Southern Cape', 'in George'],
  Orange_Free_State: ['in the Free State', 'in charming Bloemfontein'],
};

const featureDescriptions: Record<keyof PropertyFeatures, string> = {
  pool: ' Featuring a sparkling swimming pool perfect for summer entertaining',
  garden: ' Set in beautifully landscaped gardens',
  securitySystem: ' With 24-hour security and alarm system for peace of mind',
  borehole: ' Borehole water supply ensuring independent water source',
  solarPanels: ' Solar panel installation for eco-friendly living and reduced electricity costs',
  backupPower: ' Backup power generator for uninterrupted living',
  airConditioning: ' Full air conditioning throughout for year-round comfort',
  furnished: ' Tastefully furnished and move-in ready',
  petFriendly: ' Pet-friendly environment ideal for furry family members',
  wheelchairAccess: ' Wheelchair accessible with ramps and wide doorways',
  balcony: ' Private balcony perfect for sunset views',
  fireplace: ' Cozy fireplace for chilly winter evenings',
  staffQuarters: ' Separate staff quarters or granny flat for additional income',
  flatlet: ' Includes a flatlet perfect for guests or rental income',
  tennisCourt: ' Private tennis court for active lifestyles',
  gym: ' Home gymnasium for fitness enthusiasts',
  elevator: ' Private elevator access',
};

const sellingPoints: Record<keyof PropertyFeatures, string> = {
  pool: 'Perfect for entertaining',
  garden: 'Private outdoor oasis',
  securitySystem: 'Secure living',
  borehole: 'Water security',
  solarPanels: 'Energy efficient',
  backupPower: 'Never without power',
  airConditioning: 'Climate controlled',
  furnished: 'Turnkey solution',
  petFriendly: 'Pets welcome',
  wheelchairAccess: 'Fully accessible',
  balcony: 'Outdoor living',
  fireplace: 'Warm & cozy',
  staffQuarters: 'Income potential',
  flatlet: 'Flexible accommodation',
  tennisCourt: 'Sport facility',
  gym: 'Fitness at home',
  elevator: 'Easy access',
};

function getBedroomPhrase(bedrooms: number): string {
  if (bedrooms === 1) return 'spacious bedroom';
  if (bedrooms === 2) return 'two bedrooms';
  if (bedrooms === 3) return 'three spacious bedrooms';
  if (bedrooms === 4) return 'four generous bedrooms';
  return `${bedrooms} bedrooms`;
}

function getBathroomPhrase(bathrooms: number): string {
  if (bathrooms === 1) return 'modern bathroom';
  if (bathrooms === 2) return 'two bathrooms';
  return `${bathrooms} bathrooms`;
}

export function generateListingDescription(data: Partial<PropertyFormData>): ListingGenerated {
  const { title, description, type, location, specs, features, listingType } = data;
  
  const propTypeLabel = propertyTypeLabels[type || 'house'] || 'Property';
  const provincePhrases = locationPhrases[location?.province || 'gauteng'] || locationPhrases.gauteng;
  const locationPhrase = provincePhrases[Math.floor(Math.random() * provincePhrases.length)];
  const suburbName = location?.suburb || '';
  
  const bedroomPhrase = getBedroomPhrase(specs?.bedrooms || 3);
  const bathroomPhrase = getBathroomPhrase(specs?.bathrooms || 2);
  
  const activeFeatures = Object.entries(features || {})
    .filter(([_, value]) => value === true)
    .map(([key]) => key as keyof PropertyFeatures);
  
  let generatedTitle = '';
  let generatedDescription = '';
  
  if (listingType === 'sale') {
    generatedTitle = `${propertyTypeLabels[type || 'house']} in ${suburbName}`;
    
    generatedDescription = `This exceptional ${type || 'house'} ${locationPhrase} offers ${bedroomPhrase} and ${bathroomPhrase}. `;
    
    if (specs?.garages && specs.garages > 0) {
      generatedDescription += `Secure parking for ${specs.garages} vehicles. `;
    }
    
    if (specs?.floorSize && specs.floorSize > 0) {
      generatedDescription += `Spanning ${specs.floorSize}m² of carefully designed living space. `;
    }
    
    if (activeFeatures.length > 0) {
      const featureTexts = activeFeatures.slice(0, 4).map(f => featureDescriptions[f]);
      generatedDescription += featureTexts.join('') + '. ';
    }
    
    generatedDescription += `\n\nKey Features:\n`;
    activeFeatures.slice(0, 6).forEach(f => {
      generatedDescription += `• ${sellingPoints[f]}\n`;
    });
    
    generatedDescription += `\nThis property represents exceptional value in a prime location. Don't miss this opportunity to secure your dream home.`;
    
  } else {
    const rentalType = specs?.bedrooms && specs.bedrooms <= 1 ? 'apartment' : 'home';
    generatedTitle = `Stunning Rental ${rentalType.charAt(0).toUpperCase() + rentalType.slice(1)} in ${suburbName}`;
    
    generatedDescription = `Welcome to this stunning rental ${rentalType} ${locationPhrase}. `;
    generatedDescription += `Comprising ${bedroomPhrase} and ${bathroomPhrase}, this property offers the perfect blend of comfort and convenience. `;
    
    if (activeFeatures.length > 0) {
      const featureTexts = activeFeatures.slice(0, 4).map(f => featureDescriptions[f]);
      generatedDescription += featureTexts.join('') + '. ';
    }
    
    generatedDescription += `\n\nKey Features:\n`;
    activeFeatures.slice(0, 6).forEach(f => {
      generatedDescription += `• ${sellingPoints[f]}\n`;
    });
    
    generatedDescription += `\nAvailable for immediate occupation. Schedule a viewing today!`;
  }
  
  return {
    title: generatedTitle,
    description: generatedDescription.trim(),
  };
}

export function generateShortDescription(data: Partial<PropertyFormData>): string {
  const { specs, type, location } = data;
  
  const bedroomText = specs?.bedrooms === 1 ? '1 bed' : `${specs?.bedrooms || 3} bed`;
  const bathroomText = specs?.bathrooms === 1 ? '1 bath' : `${specs?.bathrooms || 2} bath`;
  const propType = type || 'house';
  
  return `${bedroomText} ${propType} in ${location?.suburb || 'prime location'} with ${bathroomText}`;
}