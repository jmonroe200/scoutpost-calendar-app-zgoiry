
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking, ScrollView } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { GitHubService, GitHubUser, GitHubRepo } from '../lib/github';
import Icon from './Icon';

interface GitHubIntegrationProps {
  onClose: () => void;
}

export default function GitHubIntegration({ onClose }: GitHubIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking...');

  useEffect(() => {
    checkGitHubConnection();
  }, []);

  const checkGitHubConnection = async () => {
    try {
      console.log('Checking GitHub connection status');
      setLoading(true);
      setConnectionStatus('Checking connection...');
      
      const connected = await GitHubService.checkConnection();
      setIsConnected(connected);
      
      if (connected) {
        setConnectionStatus('Connected');
        await loadGitHubData();
      } else {
        setConnectionStatus('Not connected');
      }
    } catch (error) {
      console.error('Error checking GitHub connection:', error);
      setConnectionStatus('Connection check failed');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const loadGitHubData = async () => {
    try {
      console.log('Loading GitHub user data');
      const user = await GitHubService.getUser();
      setGithubUser(user);
      
      console.log('Loading GitHub repositories');
      const repos = await GitHubService.getRepositories();
      setRepositories(repos);
    } catch (error) {
      console.error('Error loading GitHub data:', error);
      Alert.alert(
        'Data Load Failed',
        'Could not load GitHub data. This might be due to missing OAuth configuration or expired tokens.'
      );
    }
  };

  const connectToGitHub = async () => {
    try {
      setLoading(true);
      setConnectionStatus('Connecting...');
      
      const result = await GitHubService.connectWithOAuth();
      
      if (result.error) {
        Alert.alert('Connection Failed', result.error.message);
        setConnectionStatus('Connection failed');
        return;
      }

      if (result.url) {
        console.log('Opening GitHub OAuth URL:', result.url);
        await Linking.openURL(result.url);
        setConnectionStatus('Redirecting to GitHub...');
      }
    } catch (error) {
      console.error('Unexpected error connecting to GitHub:', error);
      Alert.alert('Error', 'Failed to connect to GitHub');
      setConnectionStatus('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const disconnectFromGitHub = async () => {
    Alert.alert(
      'Disconnect GitHub',
      'Are you sure you want to disconnect your GitHub account? This will remove access to GitHub features.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Disconnecting from GitHub');
              
              // Note: Supabase doesn't have a direct method to unlink OAuth providers
              // You would need to implement this via the Management API or Edge Functions
              Alert.alert(
                'Manual Disconnection Required',
                'To fully disconnect GitHub, please:\n\n1. Go to GitHub.com → Settings → Applications\n2. Find "Scoutpost" in Authorized OAuth Apps\n3. Click "Revoke" to remove access\n\nThen restart the app to complete disconnection.'
              );
              
              setIsConnected(false);
              setGithubUser(null);
              setRepositories([]);
              setConnectionStatus('Disconnected');
            } catch (error) {
              console.error('Error disconnecting GitHub:', error);
              Alert.alert('Error', 'Failed to disconnect GitHub');
            }
          }
        }
      ]
    );
  };

  const testGitHubAPI = async () => {
    try {
      setLoading(true);
      console.log('Testing GitHub API connection');

      const testResult = await GitHubService.testConnection();
      
      Alert.alert(
        'GitHub API Test Results',
        `Status: ${testResult.status}\nRate Limit Remaining: ${testResult.rate_limit?.rate?.remaining || 'Unknown'}\nReset Time: ${testResult.rate_limit?.rate?.reset ? new Date(testResult.rate_limit.rate.reset * 1000).toLocaleTimeString() : 'Unknown'}`
      );
    } catch (error) {
      console.error('Error testing GitHub API:', error);
      Alert.alert(
        'API Test Failed',
        `Error: ${error.message}\n\nThis usually means:\n• GitHub OAuth is not configured\n• Access token is invalid or expired\n• Edge Function is not properly deployed`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={commonStyles.container}>
      {/* Header */}
      <View style={[commonStyles.row, { padding: 20, paddingBottom: 10 }]}>
        <TouchableOpacity onPress={onClose}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[commonStyles.subtitle, { flex: 1, textAlign: 'center', marginBottom: 0 }]}>
          GitHub Integration
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={commonStyles.section}>
        {/* Connection Status */}
        <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 24 }]}>
          <View style={{
            backgroundColor: isConnected ? colors.success : colors.grey,
            padding: 16,
            borderRadius: 50,
            marginBottom: 16,
          }}>
            <Icon 
              name={isConnected ? "checkmark-circle" : "logo-github"} 
              size={32} 
              color={colors.backgroundAlt} 
            />
          </View>
          
          <Text style={[commonStyles.title, { marginBottom: 8 }]}>
            {isConnected ? 'Connected to GitHub' : 'Connect to GitHub'}
          </Text>
          
          <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginBottom: 8 }]}>
            Status: {connectionStatus}
          </Text>
          
          <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginBottom: 20 }]}>
            {isConnected 
              ? 'Your GitHub account is connected and ready to use'
              : 'Connect your GitHub account to enable advanced features'
            }
          </Text>

          {!isConnected ? (
            <TouchableOpacity
              style={[commonStyles.button, { 
                backgroundColor: '#24292e',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 24,
              }]}
              onPress={connectToGitHub}
              disabled={loading}
            >
              <Icon name="logo-github" size={20} color={colors.backgroundAlt} />
              <Text style={[commonStyles.buttonText, { marginLeft: 12 }]}>
                {loading ? 'Connecting...' : 'Connect with GitHub'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={[commonStyles.button, { 
                  backgroundColor: colors.info,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  flex: 1,
                }]}
                onPress={checkGitHubConnection}
                disabled={loading}
              >
                <Icon name="refresh" size={18} color={colors.backgroundAlt} />
                <Text style={[commonStyles.buttonText, { marginLeft: 8, fontSize: 14 }]}>
                  Refresh
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[commonStyles.button, { 
                  backgroundColor: colors.error,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  flex: 1,
                }]}
                onPress={disconnectFromGitHub}
                disabled={loading}
              >
                <Icon name="unlink" size={18} color={colors.backgroundAlt} />
                <Text style={[commonStyles.buttonText, { marginLeft: 8, fontSize: 14 }]}>
                  Disconnect
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* GitHub User Info */}
        {isConnected && githubUser && (
          <>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
              GitHub Profile
            </Text>
            
            <View style={[commonStyles.card, { marginBottom: 20 }]}>
              <View style={[commonStyles.row, { marginBottom: 12 }]}>
                <View style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: colors.grey,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                  <Icon name="logo-github" size={24} color={colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
                    {githubUser.name || githubUser.login}
                  </Text>
                  <Text style={commonStyles.textSecondary}>
                    @{githubUser.login}
                  </Text>
                </View>
              </View>
              
              {githubUser.bio && (
                <Text style={[commonStyles.textSecondary, { marginBottom: 12 }]}>
                  {githubUser.bio}
                </Text>
              )}
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                    {githubUser.public_repos}
                  </Text>
                  <Text style={commonStyles.textSecondary}>Repos</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                    {githubUser.followers}
                  </Text>
                  <Text style={commonStyles.textSecondary}>Followers</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                    {githubUser.following}
                  </Text>
                  <Text style={commonStyles.textSecondary}>Following</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Recent Repositories */}
        {isConnected && repositories.length > 0 && (
          <>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
              Recent Repositories
            </Text>
            
            {repositories.slice(0, 5).map((repo) => (
              <View key={repo.id} style={[commonStyles.card, { marginBottom: 12 }]}>
                <View style={[commonStyles.row, { marginBottom: 8 }]}>
                  <Icon name="folder" size={20} color={colors.primary} />
                  <Text style={[commonStyles.text, { marginLeft: 12, flex: 1, fontWeight: '600' }]}>
                    {repo.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="star" size={16} color={colors.warning} />
                    <Text style={[commonStyles.textSecondary, { marginLeft: 4 }]}>
                      {repo.stargazers_count}
                    </Text>
                  </View>
                </View>
                
                {repo.description && (
                  <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]} numberOfLines={2}>
                    {repo.description}
                  </Text>
                )}
                
                <View style={[commonStyles.row, { alignItems: 'center' }]}>
                  {repo.language && (
                    <View style={{
                      backgroundColor: colors.info + '20',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 4,
                      marginRight: 8,
                    }}>
                      <Text style={{ color: colors.info, fontSize: 12 }}>
                        {repo.language}
                      </Text>
                    </View>
                  )}
                  <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                    Updated {new Date(repo.updated_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Features */}
        <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
          GitHub Features
        </Text>

        <View style={[commonStyles.card, { marginBottom: 12 }]}>
          <View style={[commonStyles.row, { marginBottom: 8 }]}>
            <Icon name="person-circle" size={24} color={colors.primary} />
            <Text style={[commonStyles.text, { marginLeft: 12, flex: 1, fontWeight: '600' }]}>
              Profile Integration
            </Text>
            <Icon 
              name={isConnected ? "checkmark-circle" : "ellipse-outline"} 
              size={20} 
              color={isConnected ? colors.success : colors.grey} 
            />
          </View>
          <Text style={commonStyles.textSecondary}>
            Sync your GitHub profile information with your Scoutpost profile
          </Text>
        </View>

        <View style={[commonStyles.card, { marginBottom: 12 }]}>
          <View style={[commonStyles.row, { marginBottom: 8 }]}>
            <Icon name="folder" size={24} color={colors.info} />
            <Text style={[commonStyles.text, { marginLeft: 12, flex: 1, fontWeight: '600' }]}>
              Repository Access
            </Text>
            <Icon 
              name={isConnected ? "checkmark-circle" : "ellipse-outline"} 
              size={20} 
              color={isConnected ? colors.success : colors.grey} 
            />
          </View>
          <Text style={commonStyles.textSecondary}>
            Access and share code repositories for troop projects
          </Text>
        </View>

        <View style={[commonStyles.card, { marginBottom: 12 }]}>
          <View style={[commonStyles.row, { marginBottom: 8 }]}>
            <Icon name="git-branch" size={24} color={colors.warning} />
            <Text style={[commonStyles.text, { marginLeft: 12, flex: 1, fontWeight: '600' }]}>
              Project Collaboration
            </Text>
            <Icon 
              name="ellipse-outline"
              size={20} 
              color={colors.grey} 
            />
          </View>
          <Text style={commonStyles.textSecondary}>
            Collaborate on coding projects and merit badge work (Coming Soon)
          </Text>
        </View>

        {/* Debug Section */}
        {isConnected && (
          <>
            <Text style={[commonStyles.subtitle, { marginTop: 20, marginBottom: 16 }]}>
              Debug & Testing
            </Text>

            <TouchableOpacity
              style={[commonStyles.card, commonStyles.row]}
              onPress={testGitHubAPI}
              disabled={loading}
            >
              <View style={commonStyles.centerRow}>
                <Icon name="bug" size={24} color={colors.warning} />
                <Text style={[commonStyles.text, { marginLeft: 16 }]}>
                  Test GitHub API Connection
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[commonStyles.card, commonStyles.row]}
              onPress={checkGitHubConnection}
              disabled={loading}
            >
              <View style={commonStyles.centerRow}>
                <Icon name="refresh" size={24} color={colors.info} />
                <Text style={[commonStyles.text, { marginLeft: 16 }]}>
                  Refresh Connection Status
                </Text>
              </View>
              <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </>
        )}

        {/* Setup Instructions */}
        <View style={{
          backgroundColor: colors.info + '20',
          padding: 16,
          borderRadius: 8,
          marginTop: 20,
        }}>
          <View style={[commonStyles.centerRow, { marginBottom: 8, justifyContent: 'flex-start' }]}>
            <Icon name="information-circle" size={20} color={colors.info} />
            <Text style={{
              color: colors.info,
              fontSize: 16,
              fontWeight: '600',
              marginLeft: 8,
            }}>
              Setup Required
            </Text>
          </View>
          <Text style={[commonStyles.textSecondary, { lineHeight: 20 }]}>
            To enable GitHub integration, you need to:
            {'\n'}• Configure GitHub OAuth in your Supabase project
            {'\n'}• Set up GitHub OAuth App in your GitHub settings
            {'\n'}• Add redirect URLs and client credentials
            {'\n'}• Set GITHUB_TOKEN environment variable for Edge Functions
            {'\n'}• Enable the github-integration Edge Function
          </Text>
        </View>

        {/* Troubleshooting */}
        <View style={{
          backgroundColor: colors.warning + '20',
          padding: 16,
          borderRadius: 8,
          marginTop: 12,
          marginBottom: 20,
        }}>
          <View style={[commonStyles.centerRow, { marginBottom: 8, justifyContent: 'flex-start' }]}>
            <Icon name="warning" size={20} color={colors.warning} />
            <Text style={{
              color: colors.warning,
              fontSize: 16,
              fontWeight: '600',
              marginLeft: 8,
            }}>
              Common Issues
            </Text>
          </View>
          <Text style={[commonStyles.textSecondary, { lineHeight: 20 }]}>
            If GitHub integration isn't working:
            {'\n'}• Check that OAuth is configured in Supabase Auth settings
            {'\n'}• Verify GitHub OAuth app has correct redirect URLs
            {'\n'}• Ensure Edge Function is deployed and accessible
            {'\n'}• Check browser console for detailed error messages
            {'\n'}• Try disconnecting and reconnecting your GitHub account
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
