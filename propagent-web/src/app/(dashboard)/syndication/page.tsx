'use client';

import { useState } from 'react';
import { 
  Building2, 
  Home, 
  Send,
  CheckCircle2,
  XCircle,
  Settings,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import { SyndicationPlatform, defaultPlatforms, formatPropertyForPlatform } from '@/lib/syndication';
import { kznSampleProperties } from '@/lib/kzn-sample-properties';

const platformIcons: Record<SyndicationPlatform, React.ReactNode> = {
  property24: <Building2 className="w-5 h-5" />,
  private_property: <Home className="w-5 h-5" />,
  facebook: <Home className="w-5 h-5" />,
  instagram: <Home className="w-5 h-5" />,
  twitter: <Home className="w-5 h-5" />,
  linkedin: <Home className="w-5 h-5" />,
};

const platformColors: Record<SyndicationPlatform, string> = {
  property24: 'bg-orange-500 text-white',
  private_property: 'bg-emerald-500 text-white',
  facebook: 'bg-blue-600 text-white',
  instagram: 'bg-pink-600 text-white',
  twitter: 'bg-black text-white',
  linkedin: 'bg-blue-700 text-white',
};

export default function SyndicationPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<SyndicationPlatform>>(new Set());
  const [isPosting, setIsPosting] = useState(false);
  const [postResults, setPostResults] = useState<Record<SyndicationPlatform, { success: boolean; url?: string; error?: string }>>({});
  const [configMode, setConfigMode] = useState<SyndicationPlatform | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<SyndicationPlatform, string>>({});

  // Use a sample property for demo
  const sampleProperty = {
    id: 'demo-1',
    title: 'Modern Family Home in Ballito',
    description: 'Beautiful 4 bedroom home in Ballito with pool and garden. Close to schools and beach.',
    price: 3500000,
    location: {
      streetAddress: '45 Ocean View Drive',
      suburb: 'Ballito',
      city: 'Durban',
      province: 'KZN',
    },
    specs: {
      bedrooms: 4,
      bathrooms: 3,
      garages: 2,
      erfSize: 500,
      floorSize: 280,
    },
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'],
    features: ['pool', 'garden', 'security'],
    listingType: 'sale' as const,
    agent: {
      name: 'John Smith',
      phone: '+27 82 555 0123',
      email: 'john@propagent.co.za',
    },
  };

  const togglePlatform = (platform: SyndicationPlatform) => {
    const newSet = new Set(selectedPlatforms);
    if (newSet.has(platform)) {
      newSet.delete(platform);
    } else {
      newSet.add(platform);
    }
    setSelectedPlatforms(newSet);
  };

  const handlePost = async () => {
    setIsPosting(true);
    setPostResults({});

    // Simulate posting to each platform
    const results: Record<SyndicationPlatform, { success: boolean; url?: string; error?: string }> = {};
    
    for (const platform of selectedPlatforms) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, show as if it worked (in production, actual API calls)
      results[platform] = {
        success: true,
        url: `https://${platform}.com/post/123`,
      };
    }

    setPostResults(results);
    setIsPosting(false);
  };

  const handleConfigure = (platform: SyndicationPlatform) => {
    setConfigMode(platform);
  };

  return (
    <div className="min-h-screen bg-white text-charcoal-900 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-semibold text-charcoal-900">Syndication</h1>
        <p className="text-charcoal-500 mt-2">Post your properties to multiple platforms at once</p>
      </div>

      {/* Platform Configuration */}
      <Card className="mb-6 border-2 border-charcoal-100 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-charcoal-900">Connect Platforms</h2>
          <Badge className="bg-lime-400 text-charcoal-900 rounded-full px-3 py-1 text-xs font-medium">API Keys Required</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {defaultPlatforms.map((platform) => (
            <div
              key={platform.id}
              className={cn(
                "p-4 rounded-xl border-2 transition-all cursor-pointer",
                selectedPlatforms.has(platform.id)
                  ? "border-lime-400 bg-lime-400/10"
                  : "border-charcoal-100 hover:border-charcoal-200 bg-white"
              )}
              onClick={() => togglePlatform(platform.id)}
            >
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", platformColors[platform.id])}>
                {platformIcons[platform.id]}
              </div>
              <h3 className="font-medium text-sm text-charcoal-900">{platform.name}</h3>
              <p className="text-xs text-charcoal-500 mt-1">
                {apiKeys[platform.id] ? 'Configured' : 'Click to configure'}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Property Preview */}
      <Card className="mb-6 border-2 border-charcoal-100 rounded-2xl">
        <h2 className="text-lg font-semibold mb-4 text-charcoal-900">Property to Syndicate</h2>
        <div className="flex gap-4 p-4 bg-charcoal-50 rounded-xl">
          <div className="w-24 h-20 bg-charcoal-200 rounded-lg overflow-hidden flex-shrink-0">
            <img src={sampleProperty.images[0]} alt={sampleProperty.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-charcoal-900">{sampleProperty.title}</h3>
            <p className="text-sm text-charcoal-500">R{sampleProperty.price.toLocaleString()}</p>
            <p className="text-xs text-charcoal-400 mt-1">
              {sampleProperty.specs.bedrooms} bed • {sampleProperty.specs.bathrooms} bath • {sampleProperty.specs.garages} garage
            </p>
            <p className="text-xs text-charcoal-400">{sampleProperty.location.suburb}, {sampleProperty.location.city}</p>
          </div>
        </div>
      </Card>

      {/* Post Button */}
      <div className="mb-6">
        <Button
          onClick={handlePost}
          disabled={selectedPlatforms.size === 0 || isPosting}
          className="w-full py-4 text-base bg-lime-400 hover:bg-lime-500 text-charcoal-900 disabled:opacity-50 rounded-full font-medium"
        >
          {isPosting ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Posting to {selectedPlatforms.size} platforms...
            </>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Post to {selectedPlatforms.size} Platform{selectedPlatforms.size !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {Object.keys(postResults).length > 0 && (
        <Card className="border-2 border-charcoal-100 rounded-2xl">
          <h2 className="text-lg font-semibold mb-4 text-charcoal-900">Post Results</h2>
          <div className="space-y-3">
            {Object.entries(postResults).map(([platform, result]) => (
              <div key={platform} className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", platformColors[platform as SyndicationPlatform])}>
                    {platformIcons[platform as SyndicationPlatform]}
                  </div>
                  <span className="font-medium text-charcoal-900 capitalize">{platform.replace('_', ' ')}</span>
                </div>
                {result.success ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-lime-500" />
                    <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm text-lime-600 hover:underline flex items-center gap-1">
                      View Post <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-rose-500" />
                    <span className="text-sm text-rose-600">{result.error || 'Failed'}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Help Text */}
      <div className="mt-8 p-4 bg-lime-400/10 border-2 border-lime-400/30 rounded-2xl">
        <h4 className="font-medium text-charcoal-900 mb-2">How to Configure</h4>
        <ul className="text-sm text-charcoal-600 space-y-1">
          <li>• <strong>Property24:</strong> Contact PropAgent for API access</li>
          <li>• <strong>Private Property:</strong> Contact Private Property for API credentials</li>
          <li>• <strong>Facebook/Instagram:</strong> Create a Meta Business App and get access tokens</li>
          <li>• <strong>X (Twitter):</strong> Apply for Twitter API v2 access</li>
          <li>• <strong>LinkedIn:</strong> Create a LinkedIn App for organic posting</li>
        </ul>
      </div>
    </div>
  );
}
