
import { supabase } from './supabase';

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

export class GitHubService {
  private static async callEdgeFunction(action: string): Promise<any> {
    try {
      console.log(`Calling GitHub Edge Function with action: ${action}`);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('github-integration', {
        body: { action },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.message || 'GitHub API call failed');
      }

      return data.data;
    } catch (error) {
      console.error(`GitHub ${action} error:`, error);
      throw error;
    }
  }

  static async getUser(): Promise<GitHubUser> {
    return await this.callEdgeFunction('user');
  }

  static async getRepositories(): Promise<GitHubRepo[]> {
    return await this.callEdgeFunction('repos');
  }

  static async testConnection(): Promise<any> {
    return await this.callEdgeFunction('test');
  }

  static async checkConnection(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: identities } = await supabase.auth.getUserIdentities();
      return identities?.identities?.some(identity => identity.provider === 'github') || false;
    } catch (error) {
      console.error('Error checking GitHub connection:', error);
      return false;
    }
  }

  static async connectWithOAuth(): Promise<{ url?: string; error?: any }> {
    try {
      console.log('Initiating GitHub OAuth connection');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: 'https://natively.dev/email-confirmed',
          scopes: 'read:user user:email public_repo'
        }
      });

      if (error) {
        console.error('GitHub OAuth error:', error);
        return { error };
      }

      return { url: data.url };
    } catch (error) {
      console.error('Unexpected error connecting to GitHub:', error);
      return { error };
    }
  }
}
