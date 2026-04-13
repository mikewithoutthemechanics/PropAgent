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

  // Platform-specific implementations using n8n workflows
  private async postToProperty24(property: PropertyListing, formatted: ReturnType<typeof formatPropertyForPlatform>): Promise<SyndicationResult> {
    const apiKey = this.apiKeys['property24'];
    const agencyId = this.apiKeys['property24_agencY_id'];

    if (!apiKey || !agencyId) {
      throw new Error('Property24 API key or Agency ID not configured');
    }

    const webhookUrl = process.env.NEXT_PUBLIC_N8N_PROPERTY24_WEBHOOK || 'http://localhost:5678/webhook/property24-syndicate';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property, platform: 'property24' }),
    });

    if (!response.ok) {
      throw new Error(`Property24 API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      platform: 'property24',
      success: true,
      postUrl: data.postUrl || `https://www.property24.co.za/p${data.listing_id}`,
    };
  }

  private async postToPrivateProperty(property: PropertyListing, formatted: ReturnType<typeof formatPropertyForPlatform>): Promise<SyndicationResult> {
    const apiKey = this.apiKeys['private_property_api_key'];
    const apiSecret = this.apiKeys['private_property_api_secret'];

    if (!apiKey || !apiSecret) {
      throw new Error('Private Property API key or Secret not configured');
    }

    const webhookUrl = process.env.NEXT_PUBLIC_N8N_PRIVATE_PROPERTY_WEBHOOK || 'http://localhost:5678/webhook/private-property-syndicate';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property, platform: 'private_property' }),
    });

    if (!response.ok) {
      throw new Error(`Private Property API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      platform: 'private_property',
      success: true,
      postUrl: data.postUrl,
    };
  }

  private async postToFacebook(property: PropertyListing, formatted: ReturnType<typeof formatPropertyForPlatform>): Promise<SyndicationResult> {
    const pageId = this.apiKeys['facebook_page_id'];
    const accessToken = this.apiKeys['facebook_access_token'];

    if (!pageId || !accessToken) {
      throw new Error('Facebook Page ID or Access Token not configured');
    }

    const webhookUrl = process.env.NEXT_PUBLIC_N8N_FACEBOOK_WEBHOOK || 'http://localhost:5678/webhook/facebook-syndicate';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property, platform: 'facebook' }),
    });

    if (!response.ok) {
      throw new Error('Failed to post to Facebook');
    }

    const data = await response.json();
    return {
      platform: 'facebook',
      success: true,
      postUrl: data.postUrl,
    };
  }

  private async postToInstagram(property: PropertyListing, formatted: ReturnType<typeof formatPropertyForPlatform>): Promise<SyndicationResult> {
    const businessId = this.apiKeys['instagram_business_id'];
    const accessToken = this.apiKeys['instagram_access_token'];

    if (!businessId || !accessToken) {
      throw new Error('Instagram Business ID or Access Token not configured');
    }

    const webhookUrl = process.env.NEXT_PUBLIC_N8N_INSTAGRAM_WEBHOOK || 'http://localhost:5678/webhook/instagram-syndicate';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property, platform: 'instagram' }),
    });

    if (!response.ok) {
      throw new Error('Failed to post to Instagram');
    }

    const data = await response.json();
    return {
      platform: 'instagram',
      success: true,
      postUrl: data.postUrl,
    };
  }

  private async postToTwitter(property: PropertyListing, formatted: ReturnType<typeof formatPropertyForPlatform>): Promise<SyndicationResult> {
    const apiKey = this.apiKeys['twitter_api_key'];
    const apiSecret = this.apiKeys['twitter_api_secret'];

    if (!apiKey || !apiSecret) {
      throw new Error('Twitter API Key or Secret not configured');
    }

    const webhookUrl = process.env.NEXT_PUBLIC_N8N_TWITTER_WEBHOOK || 'http://localhost:5678/webhook/twitter-syndicate';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property, platform: 'twitter' }),
    });

    if (!response.ok) {
      throw new Error('Failed to post to Twitter');
    }

    const data = await response.json();
    return {
      platform: 'twitter',
      success: true,
      postUrl: data.postUrl,
    };
  }

  private async postToLinkedIn(property: PropertyListing, formatted: ReturnType<typeof formatPropertyForPlatform>): Promise<SyndicationResult> {
    const accessToken = this.apiKeys['linkedin_access_token'];
    const personId = this.apiKeys['linkedin_person_id'];

    if (!accessToken || !personId) {
      throw new Error('LinkedIn Access Token or Person ID not configured');
    }

    const webhookUrl = process.env.NEXT_PUBLIC_N8N_LINKEDIN_WEBHOOK || 'http://localhost:5678/webhook/linkedin-syndicate';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property, platform: 'linkedin' }),
    });

    if (!response.ok) {
      throw new Error('Failed to post to LinkedIn');
    }

    const data = await response.json();
    return {
      platform: 'linkedin',
      success: true,
      postUrl: data.postUrl,
    };
  }
}

export const syndicationService = new SyndicationService();