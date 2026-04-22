# Portal Syndication Setup Guide

## Overview
This document explains how to set up full portal syndication for Property24, Private Property, Facebook, Instagram, Twitter, and LinkedIn using n8n workflows.

## Prerequisites

1. **n8n Instance**: You need an n8n instance running (either cloud or self-hosted)
2. **API Credentials**: Each platform requires specific credentials:
   - **Property24**: API Key + Agency ID (requires partnership)
   - **Private Property**: API Key + API Secret (requires partnership)
   - **Facebook**: Page ID + Access Token (Meta Business)
   - **Instagram**: Business ID + Access Token (Meta Business)
   - **Twitter**: API Key + API Secret (Twitter Developer account)
   - **LinkedIn**: Access Token + Person ID (LinkedIn Marketing Developer Platform)

## Step 1: Import n8n Workflows

1. Go to your n8n instance and navigate to **Workflows** > **Import**
2. Import the following files from `n8n-workflows/syndication/`:
   - `property24-workflow.json`
   - `private-property-workflow.json`
   - `facebook-workflow.json`
   - `instagram-workflow.json`
   - `twitter-workflow.json`
   - `linkedin-workflow.json`

3. Each workflow will be imported with a webhook trigger

## Step 2: Configure Credentials

For each platform, you need to configure the required credentials:

### Property24
- **API Key**: Obtained from Property24 partnership
- **Agency ID**: Your agency ID from Property24

### Private Property
- **API Key**: Obtained from Private Property partnership
- **API Secret**: Secret key from Private Property

### Facebook
- **Page ID**: Your Facebook Page ID
- **Access Token**: Generated from Meta Graph API

### Instagram
- **Business ID**: Your Instagram Business Account ID
- **Access Token**: Access token with `instagram_basic` and `instagram_manage_messages` permissions

### Twitter
- **API Key**: From Twitter Developer Portal
- **API Secret**: From Twitter Developer Portal

### LinkedIn
- **Access Token**: From LinkedIn Marketing Developer Platform
- **Person ID**: Your LinkedIn Person ID

## Step 3: Configure Environment Variables

In your n8n instance, set the following environment variables for each workflow:

### Property24
```
N8N_PROPERTY24_API_KEY=your_property24_api_key
N8N_PROPERTY24_AGENCY_ID=your_agency_id
```

### Private Property
```
N8N_PRIVATE_PROPERTY_API_KEY=your_private_property_api_key
N8N_PRIVATE_PROPERTY_API_SECRET=your_private_property_api_secret
```

### Facebook
```
N8N_FACEBOOK_PAGE_ID=your_page_id
N8N_FACEBOOK_ACCESS_TOKEN=your_access_token
```

### Instagram
```
N8N_INSTAGRAM_BUSINESS_ID=your_business_id
N8N_INSTAGRAM_ACCESS_TOKEN=your_access_token
```

### Twitter
```
N8N_TWITTER_API_KEY=your_api_key
N8N_TWITTER_API_SECRET=your_api_secret
```

### LinkedIn
```
N8N_LINKEDIN_ACCESS_TOKEN=your_access_token
N8N_LINKEDIN_PERSON_ID=your_person_id
```

## Step 4: Configure Webhook URLs

Each workflow has a webhook URL that needs to be configured in your agent-loop application:

1. **Property24**: `https://your-n8n-instance.com/webhook/property24-syndicate`
2. **Private Property**: `https://your-n8n-instance.com/webhook/private-property-syndicate`
3. **Facebook**: `https://your-n8n-instance.com/webhook/facebook-syndicate`
4. **Instagram**: `https://your-n8n-instance.com/webhook/instagram-syndicate`
5. **Twitter**: `https://your-n8n-instance.com/webhook/twitter-syndicate`
6. **LinkedIn**: `https://your-n8n-instance.com/webhook/linkedin-syndicate`

Set these as environment variables in your agent-loop application:

```
N8N_PROPERTY24_WEBHOOK=https://your-n8n-instance.com/webhook/property24-syndicate
N8N_PRIVATE_PROPERTY_WEBHOOK=https://your-n8n-instance.com/webhook/private-property-syndicate
N8N_FACEBOOK_WEBHOOK=https://your-n8n-instance.com/webhook/facebook-syndicate
N8N_INSTAGRAM_WEBHOOK=https://your-n8n-instance.com/webhook/instagram-syndicate
N8N_TWITTER_WEBHOOK=https://your-n8n-instance.com/webhook/twitter-syndicate
N8N_LINKEDIN_WEBHOOK=https://your-n8n-instance.com/webhook/linkedin-syndicate
```

## Step 5: Test the Integration

1. Go to the Syndication page in agent-loop
2. Configure the platforms with your credentials
3. Select platforms to post to
4. Test with a sample property

## Troubleshooting

**Error: "API key or Agency ID not configured"**
- Ensure the correct environment variables are set in n8n
- Verify the credentials are valid

**Error: "Failed to post to [Platform]"**
- Check the platform's API rate limits
- Verify the credentials have the necessary permissions
- Check the property data format

**Webhook not receiving data**
- Ensure the webhook URL is correct
- Check n8n workflow execution logs
- Verify the webhook is enabled

## Notes

- **Property24 and Private Property** require partnership agreements with the respective platforms. Contact their support teams to obtain API access.
- **Facebook and Instagram** require a Meta Business account with API access.
- **Twitter** requires a developer account and approved API access.
- **LinkedIn** requires a Marketing Developer Platform account.

## Cost Considerations

- n8n Cloud: Starting at $20/month
- API Costs: Vary by platform (some free, some paid)
- WhatsApp Business API: Per-message fees may apply

## Support

For any issues with the syndication workflows, check the n8n execution logs or contact support.

