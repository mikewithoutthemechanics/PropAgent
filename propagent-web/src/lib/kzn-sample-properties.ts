// KZN-focused sample properties for agent-loop
// Ballito, Salt Rock, Sheffield, Umhlanga, Midlands

import { Property, PropertyType, PropertyStatus, ListingType, Province } from '@/types/property';

export const kznSampleProperties: Partial<Property>[] = [
  // Ballito Properties
  {
    id: 'kzn-1',
    title: 'Beachfront Apartment in Ballito',
    description: 'Stunning beachfront apartment with panoramic ocean views. Modern finishes, open-plan living, and direct beach access.',
    listingType: 'rent' as ListingType,
    type: 'apartment' as PropertyType,
    status: 'active' as PropertyStatus,
    location: {
      streetAddress: '45 Ocean View Drive',
      suburb: 'Ballito',
      city: 'Durban',
      province: 'kwazulu_natal' as Province,
      postalCode: '4399',
      latitude: -29.5333,
      longitude: 31.2167,
    },
    pricing: { price: 18000 },
    specs: { bedrooms: 2, bathrooms: 2, garages: 1, floorSize: 95 },
    features: { pool: true, nearBeach: true, securitySystem: true, airConditioning: true, balcony: true }
  },
  {
    id: 'kzn-2',
    title: 'Family Home in Ballito',
    description: 'Spacious family home in quiet neighborhood. Large garden, double garage, and close to schools.',
    listingType: 'sale' as ListingType,
    type: 'house' as PropertyType,
    status: 'active' as PropertyStatus,
    location: {
      streetAddress: '12 Lagoon Drive',
      suburb: 'Ballito',
      city: 'Durban',
      province: 'kwazulu_natal' as Province,
      postalCode: '4399',
      latitude: -29.5289,
      longitude: 31.2183,
    },
    pricing: { price: 3200000 },
    specs: { bedrooms: 4, bathrooms: 3, garages: 2, erfSize: 600, floorSize: 280 },
    features: { pool: true, garden: true, petFriendly: true, securitySystem: true }
  },
  // Salt Rock Properties
  {
    id: 'kzn-3',
    title: 'Coastal Villa in Salt Rock',
    description: 'Luxurious coastal villa with stunning sea views. Private beach access, pool, and modern amenities.',
    listingType: 'sale' as ListingType,
    type: 'house' as PropertyType,
    status: 'active' as PropertyStatus,
    location: {
      streetAddress: '8 Ocean Road',
      suburb: 'Salt Rock',
      city: 'Durban',
      province: 'kwazulu_natal' as Province,
      postalCode: '4391',
      latitude: -29.4833,
      longitude: 31.2500,
    },
    pricing: { price: 4500000 },
    specs: { bedrooms: 5, bathrooms: 4, garages: 2, erfSize: 1200, floorSize: 420 },
    features: { pool: true, garden: true, nearBeach: true, securitySystem: true, borehole: true }
  },
  // Umhlanga Properties
  {
    id: 'kzn-4',
    title: 'Luxury Apartment in Umhlanga',
    description: 'Ultra-modern apartment in prime Umhlanga location. Sea views, smart home features, and 24/7 security.',
    listingType: 'rent' as ListingType,
    type: 'apartment' as PropertyType,
    status: 'active' as PropertyStatus,
    location: {
      streetAddress: '100 Ocean Way',
      suburb: 'Umhlanga',
      city: 'Durban',
      province: 'kwazulu_natal' as Province,
      postalCode: '4319',
      latitude: -29.7333,
      longitude: 31.9333,
    },
    pricing: { price: 25000 },
    specs: { bedrooms: 2, bathrooms: 2, garages: 1, floorSize: 110 },
    features: { pool: true, gym: true, securitySystem: true, airConditioning: true, balcony: true, view: true }
  },
  {
    id: 'kzn-5',
    title: 'Umhlanga Ridge Townhouse',
    description: 'Modern townhouse in secure estate. Close to Gateway, beaches, and restaurants.',
    listingType: 'rent' as ListingType,
    type: 'townhouse' as PropertyType,
    status: 'active' as PropertyStatus,
    location: {
      streetAddress: '45 Ridge Boulevard',
      suburb: 'Umhlanga Ridge',
      city: 'Durban',
      province: 'kwazulu_natal' as Province,
      postalCode: '4319',
      latitude: -29.7250,
      longitude: 31.9450,
    },
    pricing: { price: 18500 },
    specs: { bedrooms: 3, bathrooms: 2, garages: 2, floorSize: 180 },
    features: { pool: true, garden: true, securitySystem: true, airConditioning: true }
  },
  // Sheffield Beach
  {
    id: 'kzn-6',
    title: 'Secluded Beach House in Sheffield',
    description: 'Private beach house with direct beach access. Perfect for those seeking tranquility.',
    listingType: 'sale' as ListingType,
    type: 'house' as PropertyType,
    status: 'active' as PropertyStatus,
    location: {
      streetAddress: '23 Sheffield Road',
      suburb: 'Sheffield Beach',
      city: 'Durban',
      province: 'kwazulu_natal' as Province,
      postalCode: '4410',
      latitude: -29.5667,
      longitude: 31.1667,
    },
    pricing: { price: 2800000 },
    specs: { bedrooms: 3, bathrooms: 2, garages: 1, erfSize: 800, floorSize: 200 },
    features: { nearBeach: true, garden: true, petFriendly: true }
  },
  // Midlands Properties
  {
    id: 'kzn-7',
    title: 'Victorian Home in Howick',
    description: 'Beautiful Victorian home in the heart of Howick. Character features, large garden, and views.',
    listingType: 'sale' as ListingType,
    type: 'house' as PropertyType,
    status: 'active' as PropertyStatus,
    location: {
      streetAddress: '15 Main Street',
      suburb: 'Howick',
      city: 'Pietermaritzburg',
      province: 'kwazulu_natal' as Province,
      postalCode: '3290',
      latitude: -29.4833,
      longitude: 30.2333,
    },
    pricing: { price: 2100000 },
    specs: { bedrooms: 4, bathrooms: 3, garages: 2, erfSize: 1500, floorSize: 320 },
    features: { garden: true, fireplace: true, staffQuarters: true }
  },
  {
    id: 'kzn-8',
    title: 'Modern Apartment in Pietermaritzburg',
    description: 'Contemporary apartment in CBD. Walking distance to shops, restaurants, and transport.',
    listingType: 'rent' as ListingType,
    type: 'apartment' as PropertyType,
    status: 'active' as PropertyStatus,
    location: {
      streetAddress: '8 Church Street',
      suburb: 'Pietermaritzburg',
      city: 'Pietermaritzburg',
      province: 'kwazulu_natal' as Province,
      postalCode: '3201',
      latitude: -29.6000,
      longitude: 30.3833,
    },
    pricing: { price: 7500 },
    specs: { bedrooms: 1, bathrooms: 1, floorSize: 55 },
    features: { securitySystem: true }
  }
];
