'use client';

import { useState, useEffect, useRef } from 'react';
import { useCollection, newId } from '@/lib/persistence';
import { 
  Calculator, 
  TrendingUp, 
  Home, 
  MapPin, 
  Building2,
  Square,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  DollarSign,
  Target,
  School,
  Bus,
  Shield,
  Save,
  FileText,
  Printer
} from 'lucide-react';
import { Card, CardHeader, Button, Input, Select, Badge } from '@/components/ui';
import { 
  calculateAVM, 
  analyzeNeighborhood, 
  calculateRentalYield,
  generateCMASubject,
  type AVMCalculationInput,
  type PropertyValuation,
  type ComparableSale,
  type NeighborhoodFactor
} from '@/lib/valuations';
import { formatCurrency } from '@/lib/utils';
import { mockProperties } from '@/lib/data';

const propertyTypes = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'flat', label: 'Flat' },
  { value: 'cottage', label: 'Cottage' },
];

const cities = [
  { value: 'Johannesburg', label: 'Johannesburg' },
  { value: 'Cape Town', label: 'Cape Town' },
  { value: 'Durban', label: 'Durban' },
  { value: 'Pretoria', label: 'Pretoria' },
  { value: 'Port Elizabeth', label: 'Port Elizabeth' },
  { value: 'Bloemfontein', label: 'Bloemfontein' },
];

export default function ValuationsPage() {
  const [formData, setFormData] = useState<AVMCalculationInput>({
    address: '',
    suburb: '',
    city: 'Johannesburg',
    propertyType: 'house',
    bedrooms: 3,
    bathrooms: 2,
    size: 150,
    yearBuilt: 2015,
    features: [],
    parkingSpaces: 1,
    pool: false,
    garden: false,
  });
  
  const [valuation, setValuation] = useState<PropertyValuation | null>(null);
  const [neighborhoodFactors, setNeighborhoodFactors] = useState<NeighborhoodFactor[]>([]);
  const [rentalYield, setRentalYield] = useState<{ grossYield: number; netYield: number } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState<'avm' | 'comparables' | 'trends' | 'neighborhood'>('avm');
  const [expandedComparables, setExpandedComparables] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Comparable sales management
  const {
    items: customComparables,
    add: addComparable,
    remove: removeComparable,
  } = useCollection<ComparableSale>('valuation_comparables', []);
  const [showAddComparable, setShowAddComparable] = useState(false);
  const [newComparable, setNewComparable] = useState({
    address: '',
    salePrice: 0,
    bedrooms: 3,
    bathrooms: 2,
    size: 150,
    saleDate: new Date().toISOString().split('T')[0],
  });

  // Valuation history
  const {
    items: valuationHistory,
    add: addValuationHistory,
  } = useCollection<PropertyValuation>('valuation_history', []);
  const [showHistory, setShowHistory] = useState(false);

  // Property autocomplete
  const [showPropertySuggestions, setShowPropertySuggestions] = useState(false);
  const [addressInput, setAddressInput] = useState('');

  // Filtered property suggestions
  const propertySuggestions = mockProperties.filter(p => 
    p.address.toLowerCase().includes(addressInput.toLowerCase()) ||
    p.suburb?.toLowerCase().includes(addressInput.toLowerCase())
  ).slice(0, 5);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [valuation]);

  const handleInputChange = (field: keyof AVMCalculationInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle property selection from autocomplete
  const handlePropertySelect = (property: typeof mockProperties[0]) => {
    setFormData(prev => ({
      ...prev,
      address: property.address,
      suburb: property.suburb || '',
      city: property.city || 'Johannesburg',
      propertyType: property.type as AVMCalculationInput['propertyType'] || 'house',
      size: property.size || 150,
      bedrooms: property.bedrooms || 3,
      bathrooms: property.bathrooms || 2,
      yearBuilt: property.yearBuilt || 2015,
    }));
    setAddressInput(property.address);
    setShowPropertySuggestions(false);
  };

  // Add custom comparable
  const handleAddComparable = () => {
    if (!newComparable.address || !newComparable.salePrice) return;
    
    const comp: ComparableSale = {
      id: newId('custom'),
      address: newComparable.address,
      salePrice: newComparable.salePrice,
      saleDate: newComparable.saleDate,
      bedrooms: newComparable.bedrooms,
      bathrooms: newComparable.bathrooms,
      size: newComparable.size,
      pricePerSqm: Math.round(newComparable.salePrice / newComparable.size),
      distance: 0.5,
      similarity: 95,
      source: 'internal',
    };
    
    addComparable(comp);
    setShowAddComparable(false);
    setNewComparable({
      address: '',
      salePrice: 0,
      bedrooms: 3,
      bathrooms: 2,
      size: 150,
      saleDate: new Date().toISOString().split('T')[0],
    });
  };

  // Remove custom comparable
  const handleRemoveComparable = (id: string) => {
    removeComparable(id);
  };

  // Calculate valuation
  const handleCalculate = () => {
    if (!formData.address || !formData.suburb) {
      return;
    }

    setIsCalculating(true);
    
    // Simulate calculation delay
    setTimeout(() => {
      const result = calculateAVM(formData);
      
      // Merge custom comparables with generated ones
      if (customComparables.length > 0) {
        result.comparables = [...customComparables, ...result.comparables].sort((a, b) => b.similarity - a.similarity);
      }
      
      setValuation(result);
      
      const factors = analyzeNeighborhood(formData.suburb);
      setNeighborhoodFactors(factors);
      
      const yieldData = calculateRentalYield(result.estimatedValue, result.estimatedValue * 0.006);
      setRentalYield(yieldData);
      
      setIsCalculating(false);
    }, 1000);
  };

  // Save valuation to history
  const handleSaveValuation = () => {
    if (!valuation) return;
    
    const savedValuation = {
      ...valuation,
      id: newId('history'),
      valuationDate: new Date().toISOString(),
    };

    addValuationHistory(savedValuation);
    alert('Valuation saved to history!');
  };

  // Load valuation from history
  const handleLoadFromHistory = (savedVal: PropertyValuation) => {
    setValuation(savedVal);
    setFormData(prev => ({
      ...prev,
      address: savedVal.propertyAddress.split(',')[0].trim(),
      suburb: savedVal.propertyAddress.split(',')[1]?.trim() || '',
      city: savedVal.propertyAddress.split(',')[2]?.trim() || 'Johannesburg',
    }));
    setShowHistory(false);
  };

  // Generate PDF Report
  const handleGenerateReport = () => {
    if (!valuation) return;
    
    const reportContent = `
PROPERTY VALUATION REPORT
========================
Generated: ${new Date().toLocaleDateString('en-ZA')}

PROPERTY DETAILS
--------------
Address: ${formData.address}, ${formData.suburb}, ${formData.city}
Property Type: ${formData.propertyType}
Bedrooms: ${formData.bedrooms} | Bathrooms: ${formData.bathrooms}
Size: ${formData.size} sqm | Year Built: ${formData.yearBuilt}

VALUATION SUMMARY
----------------
Estimated Value: ${formatCurrency(valuation.estimatedValue)}
Value Range: ${formatCurrency(valuation.valueRange.low)} - ${formatCurrency(valuation.valueRange.high)}
Price per sqm: ${formatCurrency(valuation.pricePerSqm)}
Confidence: ${valuation.confidenceScore}% (${valuation.confidence})

RENTAL YIELD ESTIMATE
---------------------
Gross Yield: ${rentalYield?.grossYield.toFixed(2)}%
Net Yield: ${rentalYield?.netYield.toFixed(2)}%

COMPARABLE SALES
---------------
${valuation.comparables.slice(0, 5).map((comp, i) => `${i + 1}. ${comp.address} - ${formatCurrency(comp.salePrice)} (${comp.similarity}% match)`).join('\n')}

CMA RECOMMENDATIONS
------------------
${generateCMASubject(formData, valuation).recommendations.join('\n')}

---
agent-loop Property Valuation System
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `valuation_report_${formData.address.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleComparable = (id: string) => {
    setExpandedComparables(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  type TabId = 'avm' | 'comparables' | 'trends' | 'neighborhood';
type BadgeVariant = 'success' | 'warning' | 'error' | 'default';

const getConfidenceColor = (confidence: string): BadgeVariant => {
    switch (confidence) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'danger';
      default: return 'default';
    }
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-[var(--lime-500)]';
    if (change < 0) return 'text-[var(--rose-500)]';
    return 'text-[var(--charcoal-400)]';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'schools': return School;
      case 'transport': return Bus;
      case 'safety': return Shield;
      case 'amenities': return Building2;
      case 'market': return DollarSign;
      case 'location': return MapPin;
      default: return Target;
    }
  };

  return (
    <div className="space-y-6 min-h-screen bg-white">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-white border border-[var(--charcoal-100)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--lime-50)] via-white to-[var(--sky-50)]" />
        <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--lime-400)]/10 rounded-full blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--charcoal-900)]">Property Valuation</h1>
            <p className="text-[var(--charcoal-500)] mt-1">Automated valuation model and comparable analysis</p>
          </div>
          <div className="flex items-center gap-2">
            {valuationHistory.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                className="border-[var(--lime-400)]/30 text-[var(--lime-600)] hover:bg-[var(--lime-400)]/10"
                onClick={() => setShowHistory(!showHistory)}
              >
                <FileText className="w-4 h-4 mr-1" />
                History ({valuationHistory.length})
              </Button>
            )}
            <Badge className="bg-[var(--lime-400)] text-[var(--charcoal-900)]">Lightstone</Badge>
            <Badge className="bg-[var(--sky-400)] text-white">Windeed</Badge>
          </div>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && valuationHistory.length > 0 && (
        <Card className="p-4 bg-white border border-[var(--charcoal-100)] rounded-2xl">
          <h3 className="font-medium text-[var(--charcoal-900)] mb-3">Valuation History</h3>
          <div className="space-y-2">
            {valuationHistory.map((saved) => (
              <div 
                key={saved.id}
                className="flex items-center justify-between p-3 bg-[var(--charcoal-50)] rounded-lg border border-[var(--charcoal-100)] hover:border-[var(--lime-400)]/50 cursor-pointer"
                onClick={() => handleLoadFromHistory(saved)}
              >
                <div>
                  <p className="text-sm font-medium text-[var(--charcoal-900)]">{saved.propertyAddress}</p>
                  <p className="text-xs text-[var(--charcoal-400)]">
                    {new Date(saved.valuationDate).toLocaleDateString('en-ZA')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[var(--lime-500)]">{formatCurrency(saved.estimatedValue)}</p>
                  <p className="text-xs text-[var(--charcoal-400)]">{saved.confidenceScore}% confidence</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Input Form */}
      <Card className="bg-white border border-[var(--charcoal-100)] rounded-2xl transition-all duration-300">
        <CardHeader 
          title={<span className="text-[var(--charcoal-900)]">Property Details</span>} 
          subtitle="Enter property information for valuation"
          action={
            <div className="flex gap-2">
              {valuation && (
                <>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-[var(--lime-400)]/30 text-[var(--lime-600)] hover:bg-[var(--lime-400)]/10"
                    onClick={handleSaveValuation}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-[var(--lime-400)]/30 text-[var(--lime-600)] hover:bg-[var(--lime-400)]/10"
                    onClick={handleGenerateReport}
                  >
                    <Printer className="w-4 h-4 mr-1" />
                    Report
                  </Button>
                </>
              )}
              <Button 
                onClick={handleCalculate} 
                disabled={isCalculating || !formData.address || !formData.suburb}
                className="gap-2 bg-[var(--lime-400)] text-[var(--charcoal-900)] hover:bg-[var(--lime-500)]"
              >
                {isCalculating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Calculator className="w-4 h-4" />
                )}
                Calculate Value
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 relative">
            <Input
              label="Property Address"
              placeholder="Start typing address or select property..."
              value={addressInput || formData.address}
              onChange={(e) => {
                setAddressInput(e.target.value);
                handleInputChange('address', e.target.value);
                setShowPropertySuggestions(e.target.value.length > 2);
              }}
              onFocus={() => addressInput.length > 2 && setShowPropertySuggestions(true)}
            />
            {/* Property Autocomplete Dropdown */}
            {showPropertySuggestions && propertySuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-[var(--charcoal-100)] rounded-xl shadow-xl max-h-60 overflow-auto">
                {propertySuggestions.map((property) => (
                  <button
                    key={property.id}
                    className="w-full text-left px-4 py-3 hover:bg-[var(--charcoal-50)] border-b border-[var(--charcoal-100)] last:border-0"
                    onClick={() => handlePropertySelect(property)}
                  >
                    <p className="text-sm font-medium text-[var(--charcoal-900)]">{property.address}</p>
                    <p className="text-xs text-[var(--charcoal-400)]">{property.suburb} • {property.type}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <Input
            label="Suburb"
            placeholder="Sandton"
            value={formData.suburb}
            onChange={(e) => handleInputChange('suburb', e.target.value)}
          />
          
          <Select
            label="City"
            options={cities}
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
          />
          
          <Select
            label="Property Type"
            options={propertyTypes}
            value={formData.propertyType}
            onChange={(e) => handleInputChange('propertyType', e.target.value)}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Bedrooms"
              type="number"
              min={1}
              max={10}
              value={formData.bedrooms}
              onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value))}
            />
            <Input
              label="Bathrooms"
              type="number"
              min={1}
              max={10}
              value={formData.bathrooms}
              onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value))}
            />
          </div>
          
          <Input
            label="Size (sqm)"
            type="number"
            min={10}
            value={formData.size}
            onChange={(e) => handleInputChange('size', parseInt(e.target.value))}
          />
          
          <Input
            label="Year Built"
            type="number"
            min={1900}
            max={2026}
            value={formData.yearBuilt}
            onChange={(e) => handleInputChange('yearBuilt', parseInt(e.target.value))}
          />
          
          <Input
            label="Parking Spaces"
            type="number"
            min={0}
            max={10}
            value={formData.parkingSpaces}
            onChange={(e) => handleInputChange('parkingSpaces', parseInt(e.target.value))}
          />
        </div>

        {/* Feature Toggles */}
        <div className="mt-4 pt-4 border-t border-[var(--charcoal-100)]">
          <label className="block text-sm font-medium text-[var(--charcoal-500)] mb-3">Additional Features</label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.pool}
                onChange={(e) => handleInputChange('pool', e.target.checked)}
                className="w-4 h-4 rounded border-[var(--charcoal-200)] text-[var(--lime-400)] focus:ring-[var(--lime-400)] bg-white"
              />
              <span className="text-sm text-[var(--charcoal-500)]">Pool</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.garden}
                onChange={(e) => handleInputChange('garden', e.target.checked)}
                className="w-4 h-4 rounded border-[var(--charcoal-200)] text-[var(--lime-400)] focus:ring-[var(--lime-400)] bg-white"
              />
              <span className="text-sm text-[var(--charcoal-500)]">Garden</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Results */}
      {valuation && (
        <>
          {/* Valuation Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-white border border-[var(--charcoal-100)] rounded-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--charcoal-500)]">Estimated Value</p>
                  <p className="text-2xl font-bold text-[var(--lime-500)] mt-1">
                    {formatCurrency(valuation.estimatedValue)}
                  </p>
                  <p className="text-xs text-[var(--charcoal-400)] mt-1">
                    {formatCurrency(valuation.valueRange.low)} - {formatCurrency(valuation.valueRange.high)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[var(--lime-100)] rounded-xl flex items-center justify-center border border-[var(--lime-400)]/30">
                  <Calculator className="w-6 h-6 text-[var(--lime-600)]" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border border-[var(--charcoal-100)] rounded-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--charcoal-500)]">Price / sqm</p>
                  <p className="text-2xl font-bold text-[var(--charcoal-900)] mt-1">
                    {formatCurrency(valuation.pricePerSqm)}
                  </p>
                  <p className="text-xs text-[var(--charcoal-400)] mt-1">{valuation.size} sqm total</p>
                </div>
                <div className="w-12 h-12 bg-[var(--charcoal-50)] rounded-xl flex items-center justify-center">
                  <Square className="w-6 h-6 text-[var(--charcoal-400)]" />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border border-[var(--charcoal-100)] rounded-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--charcoal-500)]">Confidence</p>
                  <p className="text-2xl font-bold text-[var(--charcoal-900)] mt-1">{valuation.confidenceScore}%</p>
                  <Badge variant={getConfidenceColor(valuation.confidence)} className="mt-1">
                    {valuation.confidence} confidence
                  </Badge>
                </div>
                <div className="w-12 h-12 bg-[var(--charcoal-50)] rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-[var(--charcoal-400)]" />
                </div>
              </div>
            </Card>

            {rentalYield && (
              <Card className="p-6 bg-white border border-[var(--charcoal-100)] rounded-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--charcoal-500)]">Est. Rental Yield</p>
                    <p className="text-2xl font-bold text-[var(--lime-500)] mt-1">{rentalYield.grossYield}%</p>
                    <p className="text-xs text-[var(--charcoal-400)] mt-1">Net: {rentalYield.netYield}%</p>
                  </div>
                  <div className="w-12 h-12 bg-[var(--lime-100)] rounded-xl flex items-center justify-center border border-[var(--lime-400)]/30">
                    <TrendingUp className="w-6 h-6 text-[var(--lime-600)]" />
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Tabs */}
          <Card className="bg-white border border-[var(--charcoal-100)] rounded-2xl">
            <div className="border-b border-[var(--charcoal-100)] -mx-5 px-5 mb-4">
              <div className="flex gap-1 -mb-px">
                {[
                  { id: 'avm', label: 'Valuation Details' },
                  { id: 'comparables', label: 'Comparables' },
                  { id: 'trends', label: 'Value Trends' },
                  { id: 'neighborhood', label: 'Neighborhood' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabId)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-[var(--lime-400)] text-[var(--lime-600)]'
                        : 'border-transparent text-[var(--charcoal-400)] hover:text-[var(--lime-600)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'avm' && (
              <div className="space-y-6">
                {/* Value Factors */}
                <div>
                  <h4 className="font-medium text-[var(--charcoal-900)] mb-4">Value Factors</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {valuation.factors.map((factor, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-[var(--charcoal-50)] rounded-xl border border-[var(--charcoal-100)]">
                        <div>
                          <p className="font-medium text-[var(--charcoal-900)]">{factor.name}</p>
                          <p className="text-sm text-[var(--charcoal-400)]">{factor.description}</p>
                        </div>
                        <div className={`text-sm font-medium ${factor.impact >= 0 ? 'text-[var(--lime-500)]' : 'text-[var(--rose-500)]'}`}>
                          {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CMA Summary */}
                {(() => {
                  const cma = generateCMASubject(formData, valuation);
                  return (
                    <div className="p-4 bg-[var(--charcoal-50)] rounded-xl border border-[var(--lime-400)]/20">
                      <h4 className="font-medium text-[var(--charcoal-900)] mb-2">Comparative Market Analysis</h4>
                      <p className="text-sm text-[var(--charcoal-500)] mb-4">{cma.summary}</p>
                      <div className="mb-3">
                        <span className="text-sm font-medium text-[var(--charcoal-500)]">Market Conditions: </span>
                        <span className="text-sm text-[var(--lime-500)]">{cma.marketConditions}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--charcoal-500)] mb-2">Recommendations:</p>
                        <ul className="text-sm text-[var(--charcoal-500)] space-y-1">
                          {cma.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-[var(--lime-500)] mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === 'comparables' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[var(--charcoal-500)]">
                    {valuation.comparables.length} comparable sales found
                  </p>
                </div>
                {valuation.comparables.map((comp) => (
                  <div 
                    key={comp.id} 
                    className="border border-[var(--charcoal-100)] rounded-xl overflow-hidden bg-white hover:border-[var(--lime-400)]/50 transition-all"
                  >
                    <button
                      onClick={() => toggleComparable(comp.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-[var(--charcoal-50)] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[var(--lime-100)] rounded-lg flex items-center justify-center border border-[var(--lime-400)]/30">
                          <Home className="w-5 h-5 text-[var(--lime-600)]" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-[var(--charcoal-900)]">{comp.address}</p>
                          <p className="text-sm text-[var(--charcoal-400)]">
                            {comp.bedrooms} bed • {comp.bathrooms} bath • {comp.size} sqm • {comp.distance}km away
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-[var(--lime-500)]">{formatCurrency(comp.salePrice)}</p>
                          <p className="text-sm text-[var(--charcoal-400)]">{formatCurrency(comp.pricePerSqm)}/sqm</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[var(--lime-500)]">{comp.similarity}% match</span>
                          {expandedComparables.has(comp.id) ? (
                            <ChevronUp className="w-4 h-4 text-[var(--lime-500)]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[var(--charcoal-400)]" />
                          )}
                        </div>
                      </div>
                    </button>
                    {expandedComparables.has(comp.id) && (
                      <div className="px-4 pb-4 bg-[var(--charcoal-50)] border-t border-[var(--charcoal-100)]">
                        <div className="grid grid-cols-3 gap-4 pt-4">
                          <div>
                            <p className="text-xs text-[var(--charcoal-400)]">Sale Date</p>
                            <p className="text-sm font-medium text-[var(--charcoal-900)]">
                              {new Date(comp.saleDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--charcoal-400)]">Source</p>
                            <p className="text-sm font-medium text-[var(--charcoal-900)] capitalize">{comp.source}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--charcoal-400)]">Similarity Score</p>
                            <p className="text-sm font-medium text-[var(--lime-500)]">{comp.similarity}%</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="space-y-6">
                {/* Trend Chart Visual */}
                <div className="h-64 flex items-end gap-2 px-4">
                  {valuation.trends.map((trend, index) => {
                    const maxValue = Math.max(...valuation.trends.map(t => t.value));
                    const height = (trend.value / maxValue) * 100;
                    const isCurrent = index === valuation.trends.length - 1;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className={`w-full rounded-t ${isCurrent ? 'bg-gradient-to-t from-[var(--lime-400)] to-[var(--lime-500)]' : 'bg-[var(--charcoal-200)]'}`}
                          style={{ height: `${height}%`, minHeight: '20px' }}
                        />
                        <span className="text-xs text-[var(--charcoal-400)]">
                          {new Date(trend.date).toLocaleDateString('en-ZA', { month: 'short' })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Trend Data */}
                <div className="space-y-2">
                  {valuation.trends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-[var(--charcoal-100)] last:border-0">
                      <span className="text-sm text-[var(--charcoal-500)]">
                        {new Date(trend.date).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-[var(--charcoal-900)]">
                          {formatCurrency(trend.value)}
                        </span>
                        <span className={`text-sm ${getTrendColor(trend.change)}`}>
                          {trend.change > 0 ? '+' : ''}{trend.change}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Trend Summary */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[var(--charcoal-100)]">
                  <div className="text-center p-4 bg-[var(--charcoal-50)] rounded-xl border border-[var(--charcoal-100)]">
                    <p className="text-xs text-[var(--charcoal-400)] mb-1">12-Month Change</p>
                    <p className={`text-lg font-bold ${getTrendColor(valuation.trends[11].value - valuation.trends[0].value)}`}>
                      {((valuation.trends[11].value - valuation.trends[0].value) / valuation.trends[0].value * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center p-4 bg-[var(--charcoal-50)] rounded-xl border border-[var(--charcoal-100)]">
                    <p className="text-xs text-[var(--charcoal-400)] mb-1">Avg Monthly</p>
                    <p className="text-lg font-bold text-[var(--charcoal-900)]">
                      {(valuation.trends.reduce((sum, t) => sum + t.change, 0) / 12).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center p-4 bg-[var(--charcoal-50)] rounded-xl border border-[var(--charcoal-100)]">
                    <p className="text-xs text-[var(--charcoal-400)] mb-1">High/Low</p>
                    <p className="text-lg font-bold text-[var(--lime-500)]">
                      {Math.max(...valuation.trends.map(t => t.change)).toFixed(1)}% / {Math.min(...valuation.trends.map(t => t.change)).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'neighborhood' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {neighborhoodFactors.map((factor) => {
                    const Icon = getCategoryIcon(factor.category);
                    return (
                      <div key={factor.id} className="p-4 border border-[var(--charcoal-100)] rounded-xl bg-white hover:border-[var(--lime-400)]/50 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[var(--lime-100)] rounded-lg flex items-center justify-center border border-[var(--lime-400)]/30">
                              <Icon className="w-5 h-5 text-[var(--lime-600)]" />
                            </div>
                            <div>
                              <p className="font-medium text-[var(--charcoal-900)]">{factor.name}</p>
                              <p className="text-xs text-[var(--charcoal-400)] capitalize">{factor.category}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Score Bar */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-[var(--charcoal-400)]">Score</span>
                            <span className="font-medium text-[var(--charcoal-900)]">{factor.score.toFixed(1)}/10</span>
                          </div>
                          <div className="h-2 bg-[var(--charcoal-100)] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[var(--lime-400)] to-[var(--sky-400)] rounded-full"
                              style={{ width: `${factor.score * 10}%` }}
                            />
                          </div>
                        </div>
                        
                        <p className={`text-sm font-medium ${factor.impact >= 0 ? 'text-[var(--lime-500)]' : 'text-[var(--rose-500)]'}`}>
                          {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(1)}% value impact
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="p-4 bg-[var(--charcoal-50)] rounded-xl border border-[var(--charcoal-100)]">
                  <h4 className="font-medium text-[var(--charcoal-900)] mb-2">Neighborhood Analysis Summary</h4>
                  <p className="text-sm text-[var(--charcoal-500)]">
                    The {formData.suburb} area in {formData.city} shows a combined neighborhood score of{' '}
                    <span className="font-medium text-[var(--lime-500)]">
                      {(neighborhoodFactors.reduce((sum, f) => sum + f.score, 0) / neighborhoodFactors.length).toFixed(1)}/10
                    </span>
                    . The strongest factors are{' '}
                    {neighborhoodFactors
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 2)
                      .map(f => f.name)
                      .join(' and ')}
                    . This neighborhood is{' '}
                    {neighborhoodFactors.reduce((sum, f) => sum + f.impact, 0) > 5 ? 'above average' : 
                     neighborhoodFactors.reduce((sum, f) => sum + f.impact, 0) > -5 ? 'average' : 'below average'} for property values.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Empty State */}
      {!valuation && !isCalculating && (
        <Card className="p-12 bg-white border border-[var(--charcoal-100)] rounded-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-[var(--lime-100)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--lime-400)]/30">
              <Calculator className="w-8 h-8 text-[var(--lime-600)]" />
            </div>
            <h3 className="text-lg font-medium text-[var(--charcoal-800)] mb-2">No Valuation Yet</h3>
            <p className="text-[var(--charcoal-500)] max-w-md mx-auto">
              Enter property details above and click &quot;Calculate Value&quot; to get an automated valuation estimate based on market data and comparable sales.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}