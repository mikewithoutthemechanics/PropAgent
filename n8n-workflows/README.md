# n8n Syndication Workflows

This directory contains n8n workflows for portal syndication to:

- Property24
- Private Property
- Facebook
- Instagram
- Twitter
- LinkedIn

## Prerequisites

1. **n8n Instance**: You need an n8n instance running (either cloud or self-hosted)
2. **API Credentials**: Each platform requires specific credentials (see setup guide)

## Setup Instructions

1. **Import Workflows**: Go to your n8n instance and import each JSON file from this directory
2. **Configure Credentials**: Set up environment variables for each workflow
3. **Configure Webhook URLs**: Set the webhook URLs in your agent-loop application

## Usage

Once configured, the workflows will automatically post properties to the selected platforms when triggered from the agent-loop dashboard.

## Troubleshooting

- Check n8n execution logs for errors
- Verify API credentials are correct
- Ensure webhook URLs are properly configured

## Support

For any issues with these workflows, check the n8n execution logs or contact support.
