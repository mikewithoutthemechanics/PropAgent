'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Save, Upload, X, Plus, Image as ImageIcon, 
  Home, MapPin, DollarSign, BedDouble, Bath, Car, 
  Maximize, Calendar, Check, Sparkles
} from 'lucide-react';
import { PropertyFormData, PropertyType, ListingType, Province, PropertyFeatures, PropertyImage } from '@/types/property';
import { Button } from '@/components/ui';
import { cn, formatCurrency } from '@/lib/utils';
import { saProvinces, propertyTypes, listingTypes, propertyFeatureOptions } from '@/lib/sample-data';
import { generateListingDescription } from '@/lib/ai-listing';

export interface PropertyFormProps {
  initialData?: Partial<PropertyFormData>;
  onSubmit: (data: PropertyFormData) => void;
  onSaveDraft?: (data: PropertyFormData) => void;
  isSubmitting?: boolean;
}

const defaultFeatures: PropertyFeatures = {
  pool: false,
  garden: false,
  securitySystem: false,
  borehole: false,
  solarPanels: false,
  backupPower: false,
  airConditioning: false,
  furnished: false,
  petFriendly: false,
  wheelchairAccess: false,
  balcony: false,
  fireplace: false,
  staffQuarters: false,
  flatlet: false,
  tennisCourt: false,
  gym: false,
  elevator: false,
};

const defaultFormData: PropertyFormData = {
  title: '',
  description: '',
  listingType: 'sale',
  type: 'house',
  location: {
    streetAddress: '',
    suburb: '',
    city: '',
    province: 'gauteng',
    postalCode: '',
  },
  pricing: {
    price: 0,
    negotiable: false,
  },
  specs: {
    bedrooms: 3,
    bathrooms: 2,
    garages: 1,
  },
  features: defaultFeatures,
};

export function PropertyForm({ 
  initialData, 
  onSubmit, 
  onSaveDraft,
  isSubmitting = false 
}: PropertyFormProps) {
  const [formData, setFormData] = useState<PropertyFormData>({
    ...defaultFormData,
    ...initialData,
  });
  const [activeSection, setActiveSection] = useState('basic');
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save draft functionality
  useEffect(() => {
    if (isDirty && onSaveDraft) {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
      autoSaveRef.current = setTimeout(() => {
        onSaveDraft(formData);
        setLastSaved(new Date());
        setIsDirty(false);
      }, 30000); // Auto-save after 30 seconds of inactivity
    }

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [formData, isDirty, onSaveDraft]);

  const updateFormData = useCallback(<K extends keyof PropertyFormData>(
    key: K,
    value: PropertyFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  const updateLocation = useCallback(<K extends keyof PropertyFormData['location']>(
    key: K,
    value: PropertyFormData['location'][K]
  ) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [key]: value }
    }));
    setIsDirty(true);
  }, []);

  const updatePricing = useCallback(<K extends keyof PropertyFormData['pricing']>(
    key: K,
    value: PropertyFormData['pricing'][K]
  ) => {
    setFormData(prev => ({
      ...prev,
      pricing: { ...prev.pricing, [key]: value }
    }));
    setIsDirty(true);
  }, []);

  const updateSpecs = useCallback(<K extends keyof PropertyFormData['specs']>(
    key: K,
    value: PropertyFormData['specs'][K]
  ) => {
    setFormData(prev => ({
      ...prev,
      specs: { ...prev.specs, [key]: value }
    }));
    setIsDirty(true);
  }, []);

  const updateFeature = useCallback((key: keyof PropertyFeatures, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: { ...prev.features, [key]: value }
    }));
    setIsDirty(true);
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage: PropertyImage = {
          id: Math.random().toString(36).substring(7),
          url: reader.result as string,
          isPrimary: images.length === 0,
          order: images.length,
          createdAt: new Date().toISOString(),
        };
        setImages(prev => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });
    setIsDirty(true);
  }, [images.length]);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      // If we removed the primary image, set the first one as primary
      if (filtered.length > 0 && !filtered.some(img => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
    setIsDirty(true);
  }, []);

  const setPrimaryImage = useCallback((id: string) => {
    setImages(prev => prev.map(img => ({
      ...img,
      isPrimary: img.id === id
    })));
    setIsDirty(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleManualSaveDraft = () => {
    onSaveDraft?.(formData);
    setLastSaved(new Date());
    setIsDirty(false);
  };

  const handleAIGenerate = async () => {
    setIsAIGenerating(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const generated = generateListingDescription({
      title: formData.title,
      description: formData.description,
      type: formData.type,
      location: formData.location,
      specs: formData.specs,
      features: formData.features,
      listingType: formData.listingType,
    });
    
    setFormData(prev => ({
      ...prev,
      title: generated.title,
      description: generated.description,
    }));
    
    setIsAIGenerating(false);
    setIsDirty(true);
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: Home },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'details', label: 'Details', icon: BedDouble },
    { id: 'features', label: 'Features', icon: Check },
    { id: 'images', label: 'Images', icon: ImageIcon },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Navigation */}
      <div className="bg-white rounded-xl border border-stone-200 p-2 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {sections.map(section => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                activeSection === section.id
                  ? "bg-gold-500 text-white"
                  : "text-stone-600 hover:bg-stone-100"
              )}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Auto-save Status */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-stone-500">
          {lastSaved ? (
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-green-500" />
              Last saved {lastSaved.toLocaleTimeString()}
            </span>
          ) : (
            'Draft not saved yet'
          )}
        </div>
        {isDirty && (
          <button
            type="button"
            onClick={handleManualSaveDraft}
            className="flex items-center gap-1.5 text-gold-600 hover:text-gold-700 font-medium"
          >
            <Save className="w-4 h-4" />
            Save Draft Now
          </button>
        )}
      </div>

      {/* Basic Info Section */}
      {activeSection === 'basic' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-stone-900">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Property Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g., Modern 4-Bedroom Family Home in Sandton"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 pr-20"
                />
                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={isAIGenerating}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-medium rounded-md hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 shadow-sm"
                  title="Generate with AI"
                >
                  {isAIGenerating ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  <span className="hidden sm:inline">AI Write</span>
                </button>
              </div>
              <p className="mt-1 text-xs text-stone-500">
                A compelling title helps your listing stand out
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  required
                  rows={8}
                  placeholder="Describe your property in detail..."
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 resize-none pr-12"
                />
                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={isAIGenerating}
                  className="absolute right-2 top-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-medium rounded-md hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 shadow-sm"
                  title="Generate with AI"
                >
                  {isAIGenerating ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  <span className="hidden sm:inline">AI Describe</span>
                </button>
              </div>
              <p className="mt-1 text-xs text-stone-500">
                {formData.description.length} characters. Include key selling points and nearby amenities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Listing Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.listingType}
                  onChange={(e) => updateFormData('listingType', e.target.value as ListingType)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                >
                  {listingTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Property Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => updateFormData('type', e.target.value as PropertyType)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Section */}
      {activeSection === 'location' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-stone-900">Location Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., 15 Oak Lane"
                value={formData.location.streetAddress}
                onChange={(e) => updateLocation('streetAddress', e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Complex/Estate Name
              </label>
              <input
                type="text"
                placeholder="e.g., The Oaks Estate"
                value={formData.location.complexName || ''}
                onChange={(e) => updateLocation('complexName', e.target.value || undefined)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Unit Number
              </label>
              <input
                type="text"
                placeholder="e.g., Unit 412"
                value={formData.location.unitNumber || ''}
                onChange={(e) => updateLocation('unitNumber', e.target.value || undefined)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Suburb <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Sandton"
                value={formData.location.suburb}
                onChange={(e) => updateLocation('suburb', e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Johannesburg"
                value={formData.location.city}
                onChange={(e) => updateLocation('city', e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Province <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.location.province}
                onChange={(e) => updateLocation('province', e.target.value as Province)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
              >
                {saProvinces.map(province => (
                  <option key={province.value} value={province.value}>{province.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., 2196"
                value={formData.location.postalCode}
                onChange={(e) => updateLocation('postalCode', e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Pricing Section */}
      {activeSection === 'pricing' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-stone-900">Pricing Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Price (ZAR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">R</span>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="e.g., 2500000"
                  value={formData.pricing.price || ''}
                  onChange={(e) => updatePricing('price', Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                />
              </div>
              <p className="mt-1 text-sm text-gold-600">
                {formatCurrency(formData.pricing.price)}
              </p>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pricing.negotiable}
                  onChange={(e) => updatePricing('negotiable', e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-gold-500 focus:ring-gold-500"
                />
                <span className="text-sm text-stone-700">Price is negotiable</span>
              </label>
            </div>

            {formData.listingType === 'sale' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Monthly Levies
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">R</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g., 3500"
                      value={formData.pricing.levies || ''}
                      onChange={(e) => updatePricing('levies', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full pl-8 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Rates & Taxes
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">R</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g., 2500"
                      value={formData.pricing.ratesAndTaxes || ''}
                      onChange={(e) => updatePricing('ratesAndTaxes', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full pl-8 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                    />
                  </div>
                </div>
              </>
            )}

            {formData.listingType === 'rent' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Deposit Required
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-sm">R</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g., 25000"
                      value={formData.pricing.depositRequired || ''}
                      onChange={(e) => updatePricing('depositRequired', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full pl-8 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Deposit (Months)
                  </label>
                  <select
                    value={formData.pricing.depositMonths || ''}
                    onChange={(e) => updatePricing('depositMonths', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                  >
                    <option value="">Select...</option>
                    <option value="1">1 Month</option>
                    <option value="2">2 Months</option>
                    <option value="3">3 Months</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Details Section */}
      {activeSection === 'details' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-stone-900">Property Details</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Bedrooms <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.specs.bedrooms}
                  onChange={(e) => updateSpecs('bedrooms', Number(e.target.value))}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Bathrooms <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="number"
                  required
                  min="0"
                  step="0.5"
                  value={formData.specs.bathrooms}
                  onChange={(e) => updateSpecs('bathrooms', Number(e.target.value))}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Garages
              </label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.specs.garages}
                  onChange={(e) => updateSpecs('garages', Number(e.target.value))}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Carports
              </label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.specs.carports || ''}
                  onChange={(e) => updateSpecs('carports', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Floor Size (m²)
              </label>
              <div className="relative">
                <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="number"
                  min="0"
                  placeholder="e.g., 250"
                  value={formData.specs.floorSize || ''}
                  onChange={(e) => updateSpecs('floorSize', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Erf/Land Size (m²)
              </label>
              <div className="relative">
                <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="number"
                  min="0"
                  placeholder="e.g., 500"
                  value={formData.specs.erfSize || ''}
                  onChange={(e) => updateSpecs('erfSize', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Year Built
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  placeholder="e.g., 2019"
                  value={formData.specs.yearBuilt || ''}
                  onChange={(e) => updateSpecs('yearBuilt', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      {activeSection === 'features' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-stone-900">Property Features</h2>
          <p className="text-sm text-stone-500">Select all features that apply to this property</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {propertyFeatureOptions.map((feature) => (
              <label
                key={feature.key}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                  formData.features[feature.key as keyof PropertyFeatures]
                    ? "border-gold-500 bg-gold-50"
                    : "border-stone-200 hover:border-gold-400 hover:bg-stone-50"
                )}
              >
                <input
                  type="checkbox"
                  checked={formData.features[feature.key as keyof PropertyFeatures]}
                  onChange={(e) => updateFeature(feature.key as keyof PropertyFeatures, e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 text-gold-500 focus:ring-gold-500"
                />
                <span className={cn(
                  "text-sm",
                  formData.features[feature.key as keyof PropertyFeatures]
                    ? "text-gold-700 font-medium"
                    : "text-stone-600"
                )}>
                  {feature.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Images Section */}
      {activeSection === 'images' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-stone-900">Property Images</h2>
          <p className="text-sm text-stone-500">Upload high-quality images. The first image will be used as the primary photo.</p>
          
          {/* Image Upload */}
          <div className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center hover:border-gold-400 transition-colors">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-gold-50 rounded-full">
                <Upload className="w-8 h-8 text-gold-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-stone-700">
                  Drag and drop images here, or click to browse
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  JPG, PNG or WebP. Max 10MB per image.
                </p>
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 transition-colors">
                  <Plus className="w-4 h-4" />
                  Select Images
                </span>
              </label>
            </div>
          </div>

          {/* Image Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden border-2",
                    image.isPrimary ? "border-gold-500" : "border-stone-200"
                  )}
                >
                  <img
                    src={image.url}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Primary Badge */}
                  {image.isPrimary && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-gold-500 text-white text-xs font-medium rounded-full">
                      Primary
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!image.isPrimary && (
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(image.id)}
                        className="p-2 bg-white rounded-full text-stone-700 hover:bg-gold-50"
                        title="Set as primary"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-stone-200">
        <Button
          type="button"
          variant="outline"
          onClick={handleManualSaveDraft}
          disabled={isSubmitting}
        >
          <Save className="w-4 h-4 mr-2" />
          Save as Draft
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gold-500 hover:bg-gold-600"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Publish Property
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
