'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Home, 
  Building,
  MapPin,
  Check,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';
import { Card, Button, Input, Badge } from '@/components/ui';
import { 
  RentSuggestion, 
  RentAnalysisInput,
  generateRentSuggestion,
  generateLiveRentSuggestion,
  formatRent,
  getRentRangeString,
  analyzeCompetitiveness,
  getSeasonalRecommendation,
  getMarketDataSourceStatus
} from '@/lib/rentAI';
import { cn } from '@/lib/utils';

const defaultPropertyInput: RentAnalysisInput = {
  propertyType: 'apartment',
  bedrooms: 2,
  bathrooms: 1,
  sqft: 80,
  address: '',
  parking: 1,
  hasGarden: false,
  hasPool: false,
  hasAirConditioning: false,
  hasSecurity: true,
  hasFurnished: false,
  location: {
    suburb: 'Sandton',
    city: 'Johannesburg',
    province: 'gauteng',
  },
};

export default function RentAIPage() {
  const [propertyInput, setPropertyInput] = useState<RentAnalysisInput>(defaultPropertyInput);
  const [suggestion, setSuggestion] = useState<RentSuggestion | null>(null);
  const [currentRent, setCurrentRent] = useState<string>('15000');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [dataSource, setDataSource] = useState(getMarketDataSourceStatus());
  
  const seasonalInfo = useMemo(() => getSeasonalRecommendation(), []);
  const { source: dataSourceType, name: dataSourceName } = dataSource;
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event) => {
        let final = '';
        let interim = '';
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            final += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
        if (interim) {
          setInterimTranscript(interim);
        }
        if (final) {
          setTranscript(final);
          setInterimTranscript('');
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setVoiceError(event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) {
          try {
            recognitionRef.current?.start();
          } catch {
            setIsListening(false);
          }
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [isListening]);
  
  const toggleVoice = () => {
    if (!speechSupported) {
      setVoiceError('Voice input not supported in this browser. Try Chrome or Edge.');
      return;
    }
    
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setInterimTranscript('');
    } else {
      setTranscript('');
      setVoiceError(null);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        setVoiceError('Could not start voice input');
      }
    }
  };
  
  useEffect(() => {
    if (transcript) {
      handleVoiceCommand(transcript.toLowerCase());
      setTranscript('');
    }
  }, [transcript]);
  
  const handleVoiceCommand = (text: string) => {
    const words = text.split(' ');
    
    if (words.includes('bedroom') || words.includes('bedrooms')) {
      const num = words.find(w => !isNaN(Number(w)) && Number(w) >= 1 && Number(w) <= 6);
      if (num) {
        setPropertyInput(prev => ({ ...prev, bedrooms: Number(num) }));
      }
    }
    
    if (words.includes('bathroom') || words.includes('bathrooms')) {
      const num = words.find(w => !isNaN(Number(w)) && Number(w) >= 1 && Number(w) <= 5);
      if (num) {
        setPropertyInput(prev => ({ ...prev, bathrooms: Number(num) }));
      }
    }
    
    const propertyTypes = ['house', 'apartment', 'townhouse', 'flat', 'room'];
    const foundType = propertyTypes.find(t => words.includes(t));
    if (foundType) {
      setPropertyInput(prev => ({ ...prev, propertyType: foundType }));
    }
    
    if (words.includes('garden')) {
      setPropertyInput(prev => ({ ...prev, hasGarden: true }));
    }
    if (words.includes('pool')) {
      setPropertyInput(prev => ({ ...prev, hasPool: true }));
    }
    if (words.includes('air') || words.includes('conditioning') || words.includes('ac')) {
      setPropertyInput(prev => ({ ...prev, hasAirConditioning: true }));
    }
    if (words.includes('furnished')) {
      setPropertyInput(prev => ({ ...prev, hasFurnished: true }));
    }
    if (words.includes('security')) {
      setPropertyInput(prev => ({ ...prev, hasSecurity: true }));
    }
    
    const cities = ['johannesburg', 'pretoria', 'sandton', 'durban', 'cape town'];
    const foundCity = cities.find(c => text.includes(c));
    if (foundCity) {
      const cityName = foundCity.charAt(0).toUpperCase() + foundCity.slice(1).replace('cape town', 'Cape Town').replace('johannesburg', 'Johannesburg').replace('pretoria', 'Pretoria').replace('sandton', 'Sandton').replace('durban', 'Durban');
      setPropertyInput(prev => ({ ...prev, location: { ...prev.location, city: cityName } }));
    }
  };
  
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const inputWithCurrentRent = {
        ...propertyInput,
        currentRent: currentRent ? parseInt(currentRent) : undefined,
      };
      // Try to use live data, fall back to algorithm
      const result = await generateLiveRentSuggestion(inputWithCurrentRent);
      setSuggestion(result);
      // Update data source status
      setDataSource(getMarketDataSourceStatus());
    } catch (error) {
      console.error('Analysis error:', error);
      // Fallback to algorithm
      const inputWithCurrentRent = {
        ...propertyInput,
        currentRent: currentRent ? parseInt(currentRent) : undefined,
      };
      const result = generateRentSuggestion(inputWithCurrentRent);
      setSuggestion(result);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const competitiveness = suggestion && currentRent 
    ? analyzeCompetitiveness(parseInt(currentRent), suggestion)
    : null;

  const updateField = (field: keyof RentAnalysisInput, value: any) => {
    setPropertyInput(prev => ({ ...prev, [field]: value }));
  };

  const updateLocation = (field: 'suburb' | 'city' | 'province', value: string) => {
    setPropertyInput(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  const features = [
    { key: 'hasGarden', label: 'Garden' },
    { key: 'hasPool', label: 'Pool' },
    { key: 'hasAirConditioning', label: 'A/C' },
    { key: 'hasSecurity', label: 'Security' },
    { key: 'hasFurnished', label: 'Furnished' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#D8F053] rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Rent Suggestions</h1>
              <p className="text-white/60 text-sm">Market-based pricing with comparable analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-[#D8F053] text-black rounded-full">
              {seasonalInfo.currentSeason}
            </Badge>
            <Badge className={dataSourceType === 'api' ? 'bg-emerald-500 text-white rounded-full' : 'bg-rose-500 text-white rounded-full'}>
              {dataSourceName}
            </Badge>
            
            {/* Voice Input Button */}
            {speechSupported ? (
              <button
                onClick={toggleVoice}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer",
                  isListening 
                    ? "bg-red-500 animate-pulse" 
                    : "bg-[#D8F053] hover:bg-[#C2DC34] transition-all duration-300"
                )}
                title={isListening ? "Stop voice input" : "Start voice input"}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5 text-white" />
                ) : (
                  <Mic className="w-5 h-5 text-black" />
                )}
              </button>
            ) : (
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5" title="Voice not supported">
                <MicOff className="w-5 h-5 text-white/40" />
              </div>
            )}
          </div>
        </div>
        
        {/* Voice Feedback */}
        {(isListening || interimTranscript || voiceError) && (
          <div className={cn(
            "mt-4 rounded-xl px-4 py-3",
            isListening ? "bg-red-500/20" : "bg-white/10"
          )}>
            {voiceError ? (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <MicOff className="w-4 h-4" />
                <span>{voiceError}</span>
                <button onClick={() => setVoiceError(null)} className="ml-2 text-white/60 hover:text-white transition-all duration-300">×</button>
              </div>
            ) : isListening ? (
              <div className="flex items-center gap-3">
                <Mic className="w-4 h-4 text-red-500 animate-pulse" />
                <span className="text-white text-sm">Listening: "{interimTranscript || '...'}"</span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Input Panel */}
        <Card className="xl:col-span-1 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Building className="w-5 h-5" style={{ color: '#D8F053' }} />
            <h2 className="text-lg font-semibold">Property Details</h2>
          </div>
          
          <div className="space-y-4">
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-[#525252] mb-1.5">
                Property Address
              </label>
              <Input
                value={propertyInput.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder="123 Main Street, Sandton"
                className="bg-[#F5F5F5] border-[#E5E5E5]"
              />
            </div>

            {/* Current Rent */}
            <div>
              <label className="block text-sm font-medium text-[#525252] mb-1.5">
                Current Rent (optional)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#525252]">R</span>
                <Input
                  type="number"
                  value={currentRent}
                  onChange={(e) => setCurrentRent(e.target.value)}
                  placeholder="15000"
                  className="pl-7 bg-[#F5F5F5] border-[#E5E5E5]"
                />
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-[#525252] mb-1.5">Property Type</label>
              <select
                value={propertyInput.propertyType}
                onChange={(e) => updateField('propertyType', e.target.value)}
                className="w-full px-3 py-2.5 rounded-full border border-[#E5E5E5] bg-[#F5F5F5] text-sm"
              >
                <option value="house">House</option>
                <option value="townhouse">Townhouse</option>
                <option value="apartment">Apartment</option>
                <option value="flat">Flat</option>
                <option value="room">Room</option>
              </select>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#525252] mb-1.5">Bedrooms</label>
                <select
                  value={propertyInput.bedrooms}
                  onChange={(e) => updateField('bedrooms', parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-full border border-[#E5E5E5] bg-[#F5F5F5] text-sm"
                >
                  {[1,2,3,4,5,6].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#525252] mb-1.5">Bathrooms</label>
                <select
                  value={propertyInput.bathrooms}
                  onChange={(e) => updateField('bathrooms', parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-full border border-[#E5E5E5] bg-[#F5F5F5] text-sm"
                >
                  {[1,2,3,4,5].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sq Meters */}
            <div>
              <label className="block text-sm font-medium text-[#525252] mb-1.5">Sq Meters</label>
              <Input
                type="number"
                value={propertyInput.sqft || ''}
                onChange={(e) => updateField('sqft', parseInt(e.target.value) || 0)}
                placeholder="80"
                className="bg-[#F5F5F5] border-[#E5E5E5]"
              />
            </div>

            {/* Parking */}
            <div>
              <label className="block text-sm font-medium text-[#525252] mb-1.5">Parking Spaces</label>
              <select
                value={propertyInput.parking}
                onChange={(e) => updateField('parking', parseInt(e.target.value))}
                className="w-full px-3 py-2.5 rounded-full border border-[#E5E5E5] bg-[#F5F5F5] text-sm"
              >
                {[0,1,2,3,4].map(n => (
                  <option key={n} value={n}>{n === 0 ? 'None' : n === 1 ? '1 Space' : `${n} Spaces`}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#525252] mb-1.5">Province</label>
                <select
                  value={propertyInput.location.province}
                  onChange={(e) => updateLocation('province', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-full border border-[#E5E5E5] bg-[#F5F5F5] text-sm"
                >
                  <option value="gauteng">Gauteng</option>
                  <option value="kwazulu_natal">KwaZulu-Natal</option>
                  <option value="western_cape">Western Cape</option>
                  <option value="mpumalanga">Mpumalanga</option>
                  <option value="limpopo">Limpopo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#525252] mb-1.5">City</label>
                <select
                  value={propertyInput.location.city}
                  onChange={(e) => updateLocation('city', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-full border border-[#E5E5E5] bg-[#F5F5F5] text-sm"
                >
                  <option value="Johannesburg">Johannesburg</option>
                  <option value="Pretoria">Pretoria</option>
                  <option value="Sandton">Sandton</option>
                  <option value="Durban">Durban</option>
                  <option value="Cape Town">Cape Town</option>
                </select>
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-[#525252] mb-3">Features</label>
              <div className="grid grid-cols-2 gap-2">
                {features.map(({ key, label }) => {
                  const isActive = propertyInput[key as keyof RentAnalysisInput] as boolean;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updateField(key, !isActive)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium transition-all",
                        isActive 
                          ? "bg-[#D8F053] border-[#D8F053] text-black" 
                          : "border-[#E5E5E5] text-[#525252] hover:border-[#D8F053]"
                      )}
                    >
                      {isActive && <Check className="w-4 h-4" />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Analyze Button */}
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full bg-[#D8F053] hover:bg-[#C2DC34] text-black font-semibold rounded-full"
            >
              {isAnalyzing ? 'Analyzing...' : 'Generate Suggestions'}
            </Button>
          </div>
        </Card>

        {/* Results Panel */}
        <div className="xl:col-span-2 space-y-6">
          {suggestion ? (
            <>
              {/* Main Price Card */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[#525252] text-sm font-medium mb-2">Market Rent Analysis</p>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#D8F053]/20 text-black">
                        {suggestion.confidence.charAt(0).toUpperCase() + suggestion.confidence.slice(1)} Confidence
                      </div>
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {dataSourceType === 'api' ? 'Live Data' : 'Estimated'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[#525252] text-sm">Recommended Range</p>
                    <p className="text-2xl font-bold">{getRentRangeString(suggestion)}</p>
                  </div>
                </div>

                {/* Pricing Display */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 rounded-2xl bg-[#F5F5F5] border border-[#E5E5E5]">
                    <p className="text-[#525252] text-sm mb-1">Minimum</p>
                    <p className="text-xl font-bold">{formatRent(suggestion.minRent)}</p>
                    <p className="text-xs text-[#525252]">Quick lease</p>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-[#D8F053] border-2 border-[#D8F053]">
                    <p className="text-black/70 text-sm mb-1">Market Rate</p>
                    <p className="text-3xl font-bold">{formatRent(suggestion.marketRent)}</p>
                    <p className="text-xs text-black/60">Optimal pricing</p>
                  </div>
                  <div className="text-center p-4 rounded-2xl bg-[#F5F5F5] border border-[#E5E5E5]">
                    <p className="text-[#525252] text-sm mb-1">Maximum</p>
                    <p className="text-xl font-bold">{formatRent(suggestion.maxRent)}</p>
                    <p className="text-xs text-[#525252]">Premium</p>
                  </div>
                </div>

                {/* Competitiveness */}
                {competitiveness && (
                  <div className="p-4 rounded-2xl bg-[#F5F5F5] border border-[#E5E5E5]">
                    <div className="flex items-center gap-3">
                      {competitiveness.status === 'underpriced' ? (
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                      ) : competitiveness.status === 'overpriced' ? (
                        <TrendingDown className="w-5 h-5 text-rose-500" />
                      ) : (
                        <Minus className="w-5 h-5 text-[#525252]" />
                      )}
                      <div>
                        <p className="font-medium">{competitiveness.message}</p>
                        <p className="text-sm text-[#525252]">{competitiveness.suggestion}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Comparable Properties */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Home className="w-5 h-5" style={{ color: '#D8F053' }} />
                  Comparable Properties
                </h3>
                <div className="space-y-3">
                  {suggestion.comparables.map((comp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#F5F5F5]/50 border border-[#E5E5E5]">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-[#525252]" />
                        <div>
                          <p className="text-sm font-medium">{comp.address}</p>
                          <p className="text-xs text-[#525252]">{comp.bedrooms} bed • {comp.bathrooms} bath • {comp.sqft}sqm</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatRent(comp.rent)}/mo</p>
                        <p className="text-xs text-[#525252]">{comp.distance}km away</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Seasonal Recommendation */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-3">Market Insight</h3>
                <div className="p-4 rounded-xl bg-[#D8F053]/10 border border-[#D8F053]/30">
                  <p className="">{seasonalInfo.recommendation}</p>
                  <p className="text-sm text-[#525252] mt-2">{seasonalInfo.rationale}</p>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: '#D8F053' }} />
              <h3 className="text-xl font-semibold mb-2">Enter Property Details</h3>
              <p className="text-[#525252] mb-4">Fill in the property details on the left and click "Generate Suggestions" to get AI-powered rent recommendations.</p>
              
              {/* Voice Input Hint */}
              <div className="flex items-center justify-center gap-2 text-sm text-[#525252] bg-[#F5F5F5] rounded-full px-4 py-2 w-fit mx-auto">
                <Mic className="w-4 h-4" />
                <span>Or click the mic and speak your property details</span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}