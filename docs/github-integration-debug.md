
# GitHub Integration Debugging Guide

## Overview
This guide helps you debug and set up the GitHub integration in your Scoutpost app.

## Current Implementation Status

### ✅ Completed
- GitHub integration UI component
- Edge Function for GitHub API calls
- OAuth flow setup in client code
- Service layer for GitHub operations
- Settings screen integration

### ⚠️ Requires Configuration
- Supabase GitHub OAuth provider setup
- GitHub OAuth App creation
- Environment variables configuration
- OAuth redirect URLs

## Setup Steps

### 1. Create GitHub OAuth App
1. Go to GitHub.com → Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - Application name: "Scoutpost"
   - Homepage URL: "https://your-app-domain.com"
   - Authorization callback URL: "https://nivtvyagoecwcegynlnc.supabase.co/auth/v1/callback"
4. Note down Client ID and Client Secret

### 2. Configure Supabase Auth
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable GitHub provider
3. Add your GitHub OAuth App credentials:
   - Client ID: [from step 1]
   - Client Secret: [from step 1]
4. Add redirect URLs:
   - https://natively.dev/email-confirmed
   - Your app's custom scheme (if using mobile)

### 3. Set Environment Variables
In your Supabase project, add these environment variables for Edge Functions:
- `GITHUB_TOKEN`: Personal access token for GitHub API calls (optional, for enhanced features)

### 4. Deploy Edge Function
The `github-integration` Edge Function is already deployed. Verify it's working:
```bash
curl -X GET "https://nivtvyagoecwcegynlnc.supabase.co/functions/v1/github-integration?action=test" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

## Debugging Common Issues

### Issue 1: "GitHub OAuth not configured"
**Symptoms:** Error when trying to connect to GitHub
**Solution:** 
- Verify GitHub provider is enabled in Supabase Auth settings
- Check that Client ID and Secret are correctly set
- Ensure callback URL matches exactly

### Issue 2: "Invalid redirect URI"
**Symptoms:** GitHub shows redirect URI error
**Solution:**
- Check that redirect URL in GitHub OAuth app matches Supabase callback URL
- Ensure HTTPS is used for production URLs

### Issue 3: "Edge Function not accessible"
**Symptoms:** API calls to GitHub fail
**Solution:**
- Verify Edge Function is deployed and active
- Check function logs in Supabase Dashboard
- Test function directly via curl

### Issue 4: "GitHub token not configured"
**Symptoms:** GitHub API calls return 401/403 errors
**Solution:**
- Set GITHUB_TOKEN environment variable
- Use user's OAuth token instead of personal token
- Check token permissions and scopes

## Testing the Integration

### 1. Connection Test
Use the "Test GitHub API Connection" button in the app to verify:
- Edge Function is accessible
- GitHub API responds correctly
- Rate limits are not exceeded

### 2. OAuth Flow Test
1. Click "Connect with GitHub"
2. Should redirect to GitHub OAuth page
3. After authorization, should redirect back to app
4. Check browser console for any errors

### 3. Data Loading Test
After successful connection:
- User profile should load from GitHub
- Recent repositories should display
- All GitHub features should show as "connected"

## Logs and Monitoring

### Client-Side Logs
Check browser console for:
- OAuth flow errors
- API call failures
- Network request issues

### Server-Side Logs
Check Supabase Dashboard → Edge Functions → Logs for:
- Function execution errors
- GitHub API response codes
- Authentication issues

### GitHub API Logs
Monitor GitHub API rate limits and usage:
- Check rate limit headers in API responses
- Monitor for 403 (rate limited) responses
- Use authenticated requests when possible

## Security Considerations

### OAuth Scopes
Current implementation requests:
- `read:user`: Read user profile information
- `user:email`: Access user email addresses
- `public_repo`: Access public repositories

### Token Storage
- OAuth tokens are managed by Supabase Auth
- Personal access tokens should be stored as environment variables
- Never expose tokens in client-side code

### API Rate Limits
- GitHub API has rate limits (5000/hour for authenticated requests)
- Implement caching for frequently accessed data
- Use conditional requests when possible

## Next Steps

### Enhanced Features
1. **Repository Management**: Create, fork, and manage repositories
2. **Issue Tracking**: Integrate GitHub Issues for project management
3. **Webhook Integration**: Real-time updates from GitHub
4. **Team Management**: Sync GitHub teams with Scoutpost groups

### Performance Optimizations
1. **Caching**: Cache GitHub data in Supabase database
2. **Background Sync**: Periodic sync of GitHub data
3. **Lazy Loading**: Load GitHub data on demand

## Support

If you continue to experience issues:
1. Check the browser console for detailed error messages
2. Review Supabase Auth logs
3. Test the Edge Function directly
4. Verify all configuration steps are completed
5. Check GitHub OAuth app settings

The integration is designed to gracefully handle missing configuration and provide helpful error messages to guide setup.
