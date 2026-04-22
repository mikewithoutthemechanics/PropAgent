# agent-loop Deployment Guide

## Overview
This document clarifies the deployment process for agent-loop to prevent confusion and ensure consistent, reliable deployments.

## Current Deployment Situation

As of the time of this document, there appear to be two Vercel projects associated with this codebase:
1. `https://vercel.com/agentcy/agentloop-web`
2. `https://vercel.com/michael-s-projects-1c4584cf/agentloop-web`

To resolve this confusion and establish a single source of truth for deployments, we are implementing automated deployments via GitHub Actions.

## Official Deployment Process

### Automated Deployments (Recommended)
All deployments should now be handled through the GitHub Actions workflow defined in `.github/workflows/deploy.yml`:

1. **Production Deployments**: Triggered by pushes to the `main` branch
2. **Preview Deployments**: Triggered by pull requests
3. **Rollback**: Can be performed through the Vercel dashboard or by reverting the commit

### Manual Deployments (Discouraged)
Manual deployments through the Vercel CLI or dashboard should be avoided as they:
- Bypass our automated testing and validation
- Create inconsistency between deployments
- Make it difficult to track which version is deployed where

## Environment Configuration

### Required Secrets
For the GitHub Actions workflow to function, the following repository secrets must be set:

- `VERCEL_TOKEN`: Your Vercel authentication token
- `VERCEL_ORG_ID`: The Vercel organization ID
- `VERCEL_PROJECT_ID`: The Vercel project ID

These can be obtained from the Vercel dashboard under Settings → Tokens and Settings → General.

### Environment Variables
Environment variables should be configured in the Vercel project settings, not in the repository. The following are required:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- Other environment-specific variables as needed

## Resolving Duplicate Deployments

To consolidate to a single official deployment:

1. **Choose one Vercel project** to be the official deployment target
2. **Update the GitHub Action secrets** to point to that project
3. **Remove or transfer** the duplicate Vercel project to avoid confusion
4. **Notify team members** of the official deployment URL

## Verification

After pushing changes to `main`, you can verify the deployment by:

1. Checking the GitHub Actions workflow run
2. Visiting the official Vercel deployment URL
3. Reviewing the deployment logs in the Vercel dashboard

## Troubleshooting

If deployments fail:

1. Check the GitHub Actions logs for error details
2. Verify that the Vercel credentials in the repository secrets are correct
3. Ensure the Vercel project ID and organization ID are accurate
4. Check that the `agentloop-web` directory contains the correct Next.js application

## Best Practices

1. Always develop on feature branches
2. Keep the `main` branch deployable at all times
3. Use Pull Requests for all changes to `main`
4. Let the automated workflow handle deployments
5. Monitor deployment status through GitHub Actions
