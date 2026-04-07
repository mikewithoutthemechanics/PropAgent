// Syndication Service - API integrations for posting to multiple platforms
import { PropertyListing, SyndicationPlatform, formatPropertyForPlatform } from './syndication';

interface SyndicationResult {
  platform: SyndicationPlatform;
  success: boolean;
  postUrl?: string;
  error?: string;
}

class SyndicationService {
  private apiKeys: Record<string, string> = {};
  private accessTokens: Record<string, string> = {};

  // Configure API keys for each platform
  configurePlatform(platform: SyndicationPlatform, apiKey: string, accessToken?: string) {
    this.apiKeys[platform] = apiKey;
    if (accessToken) {
      this.accessTokens[platform] = accessToken;
    }
  }

  // Post to a single platform
  async postToPlatform(property: PropertyListing, platform: SyndicationPlatform): Promise<SyndicationResult> {
    const formatted = formatPropertyForPlatform(property, platform);

    try {
      switch (platform) {
        case 'property24':
          return await this.postToProperty24(property, formatted);
        case 'private_property':
          return await this.postToPrivateProperty(property, formatted);
        case 'facebook':
          return await this.postToFacebook(property, formatted);
        case 'instagram':
          return await this.postToInstagram(property, formatted);
        case 'twitter':
          return await this.postToTwitter(property, formatted);
        case 'linkedin':
          return await this.postToLinkedIn(property, formatted);
        default:
          return { platform, success: false, error: 'Unknown platform' };
      }
    } catch (error) {
      return { platform, success: false, error: String(error) };
    }
  }

  // Post to all enabled platforms
  async postToAll(property: PropertyListing, platforms: SyndicationPlatform[]): Promise<SyndicationResult[]> {
    const results = await Promise.all(
      platforms.map(platform => this.postToPlatform(property, platform))
    );
    return results;
  }

  // Platform-specific implementations
  private async postToProperty24(property: PropertyListing, formatted: ReturnType<typeof formatPropertyForPlatform>): Promise<SyndicationResult> {
    const apiKey = this.apiKeys['property24'];
    
    if (!apiKey) {
      return { 
        platform: 'property24', 
        success: false, 
        error: 'Property24 API key not configured. Contact support to get API access.' 
      };
    }

    // Property24 API integration
    const response = await fetch('https://api.property24.co.za/listings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listing_type: property.listingType,
        property_type: 'residential',
        address: {
          street: property.location.streetAddress,
          suburb: property.location.suburb,
          city: property.location.city,
          province: property.location.province,
        },
        price: property.price,
        bedrooms: property.specs.bedrooms,
        bathrooms: property.specs.bathrooms,
        garages: property.specs.garages,
        description: formatted.description,
        images: property.images,
        contact: {
          name: property.agent.name,
          phone: property.agent.phone,
          email: property.agent.email,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Property24 API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      platform: 'property24',
      success: true,
      postUrl: `https://www.property24.co.za/p${data.listing_id}`,
    };
  }

  private async postToPrivateProperty(property: PropertyListing, formatted: ReturnType<typeof formatPropertyForPlatform>): Promise<SyndicationResult> {
    const apiKey = this.apiKeys['private_property'];
    
    if (!apiKey) {
      return { 
        platform: 'private_property', 
        success: false, 
        error: 'Private Property API key not configured.' 
      };
    }

    const response = await fetch('https://api.privateproperty.co.za/v2/listings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listing: {
          title: formatted.title,
          description: formatted.description,
          price: property.price,
          listing_type: property.listingType,
          location: property.location,
          specs: property.specs,
          images: property.images,
          features: property.features,
        },
        contact: property.agent,
      }),
    });

    if (!response.ok) {
      throw new Error(`Private Property API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      platform: 'private_property',
      success: true,
      postUrl: `https://www.privateproperty.co.za/listing/${data.id}`,
    };
  }

  private async postToFacebook(property: PropertyListing, formatted: ReturnType<typeof formatPropertyForPlatform>): Promise<SyndicationResult> {
    const accessToken = this.accessTokens['facebook'];
    const pageId = this.apiKeys['facebook']; // Use as page ID
    
    if (!accessToken || !pageId) {
      return { 
        platform: 'facebook', 
        success: false, 
        error: 'Facebook Page ID or Access Token not configured.' 
      };
    }

    const mediaUrl = property.images[0];
    
    // First upload the image
    const mediaResponse = await fetch(`https://graph.facebook.com/v18.0/${pageId}/photos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: mediaUrl,
        caption: formatted.description,
        access_token: accessToken,
      }),
    });

    if (!mediaResponse.ok) {
      // Fallback: just post text if image fails
      const textResponse = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: formatted.description,
          access_token: accessToken,
        }),
      });

      if (!textResponse.ok) {
        throw new Error('Failed to post to Facebook');
      }
      
      const postData = await textResponse.json();
      return {
        platform: 'facebook',
        success: true,
        postUrl: `https://facebook.com/${pageId}/posts/${postData.id}`,
      };
    }

    const mediaData = await mediaResponse.json();
    return {
      platform: 'facebook',
      success: true,
      postUrl: `https://facebook.com/${mediaData.id}`,
    };
  }

  private async postToInstagram(property: PropertyListing, formatted: ReturnType<typeof formatPropertyForPlatform>): Promise<SyndicationResult> {
    const accessToken = this.accessTokens['instagram'];
    const businessId = this.apiKeys['instagram'];
    
    if (!accessToken || !businessId) {
      return { 
        platform: 'instagram', 
        success: false, 
        error: 'Instagram Business Account or Access Token not configured.' 
      };
    }

    // Instagram Basic Display API
    const mediaResponse = await fetch(`https://graph.facebook.com/v18.0/${businessId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: property.images[0],
        caption: formatted.description,
        access_token: accessToken,
      }),
    });

    if (!mediaResponse.ok) {
      throw new Error('Failed to create Instagram media');
    }

    const mediaData = await mediaResponse.json();
    
    // Publish the media
    await fetch(`https://graph.facebook.com/v18.0/${businessId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: mediaData.id,
        access_token: accessToken,
      }),
    });

    return {
      platform: 'instagram',
      success: true,
      postUrl: `https://instagram.com/p/${mediaData.id}`,
    };
  }

  private async postToTwitter(property: PropertyListing, formatted: ReturnType<typeof formatPropertyForPlatform>): Promise<SyndicationResult> {
    const apiKey = this.apiKeys['twitter'];
    const apiSecret = this.accessTokens['twitter'];
    
    if (!apiKey || !apiSecret) {
      return { 
        platform: 'twitter', 
        success: false, 
        error: 'Twitter API credentials not configured.' 
      };
    }

    // Note: Twitter API v2 requires OAuth 2.0 or OAuth 1.0a
    // This is a placeholder - actual implementation would require proper OAuth
    const tweetText = `${formatted.description.substring(0, 250)} ${formatted.hashtags.join(' ')}`;

    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: tweetText }),
    });

    if (!response.ok) {
      throw new Error('Failed to post to Twitter');
    }

    const data = await response.json();
    return {
      platform: 'twitter',
      success: true,
      postUrl: `https://twitter.com/i/status/${data.data.id}`,
    };
  }

  private async postToLinkedIn(property: PropertyListing, formatted: ReturnType<typeof formatPropertyForPlatform>): Promise<SyndicationResult> {
    const accessToken = this.accessTokens['linkedin'];
    const personId = this.apiKeys['linkedin'];
    
    if (!accessToken || !personId) {
      return { 
        platform: 'linkedin', 
        success: false, 
        error: 'LinkedIn Access Token or Person ID not configured.' 
      };
    }

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: `urn:li:person:${personId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: formatted.description,
            },
            shareMediaCategory: 'IMAGE',
            media: property.images.slice(0, 4).map(url => ({
              status: 'READY',
              originalUrl: url,
            })),
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to post to LinkedIn');
    }

    const data = await response.json();
    return {
      platform: 'linkedin',
      success: true,
      postUrl: `https://linkedin.com/feed/update/urn:li:ugcPost:${data.id}`,
    };
  }
}

export const syndicationService = new SyndicationService();
