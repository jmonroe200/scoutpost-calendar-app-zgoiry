
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';
import TextStyleEditor from '../components/TextStyleEditor';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../lib/types';

interface Newsletter {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function NewsletterScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState<Newsletter | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        console.log('No authenticated user found');
        router.replace('/');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (error || !profile) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load profile');
        router.back();
        return;
      }

      // Check if user is admin
      const isAdmin = profile.role?.toLowerCase().includes('admin') || 
                      profile.role?.toLowerCase().includes('scoutmaster') ||
                      profile.role?.toLowerCase().includes('leader');

      if (!isAdmin) {
        Alert.alert('Access Denied', 'You do not have permission to access the Newsletter page.');
        router.back();
        return;
      }

      setUser(profile);
      await loadNewsletters();
    } catch (error) {
      console.error('Unexpected error checking admin access:', error);
      Alert.alert('Error', 'Failed to verify permissions');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadNewsletters = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading newsletters:', error);
        Alert.alert('Error', 'Failed to load newsletters');
        return;
      }

      setNewsletters(data || []);
      console.log('Loaded newsletters:', data?.length || 0);
    } catch (error) {
      console.error('Unexpected error loading newsletters:', error);
      Alert.alert('Error', 'Failed to load newsletters');
    }
  };

  const handleCreateNewsletter = () => {
    setIsCreating(true);
    setEditingNewsletter(null);
    setTitle('');
    setContent('');
    console.log('Creating new newsletter');
  };

  const handleEditNewsletter = (newsletter: Newsletter) => {
    setIsCreating(true);
    setEditingNewsletter(newsletter);
    setTitle(newsletter.title);
    setContent(newsletter.content);
    console.log('Editing newsletter:', newsletter.id);
  };

  const handleSaveNewsletter = async (status: 'draft' | 'published') => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      const newsletterData = {
        title: title.trim(),
        content: content.trim(),
        author_id: user.user_id,
        author_name: user.name,
        status,
        published_at: status === 'published' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      if (editingNewsletter) {
        // Update existing newsletter
        const { error } = await supabase
          .from('newsletters')
          .update(newsletterData)
          .eq('id', editingNewsletter.id);

        if (error) {
          console.error('Error updating newsletter:', error);
          Alert.alert('Error', 'Failed to update newsletter');
          return;
        }

        console.log('Newsletter updated successfully');
        Alert.alert('Success', `Newsletter ${status === 'published' ? 'published' : 'saved as draft'} successfully!`);
      } else {
        // Create new newsletter
        const { error } = await supabase
          .from('newsletters')
          .insert([newsletterData]);

        if (error) {
          console.error('Error creating newsletter:', error);
          Alert.alert('Error', 'Failed to create newsletter');
          return;
        }

        console.log('Newsletter created successfully');
        Alert.alert('Success', `Newsletter ${status === 'published' ? 'published' : 'saved as draft'} successfully!`);
      }

      setIsCreating(false);
      setEditingNewsletter(null);
      setTitle('');
      setContent('');
      await loadNewsletters();
    } catch (error) {
      console.error('Unexpected error saving newsletter:', error);
      Alert.alert('Error', 'Failed to save newsletter');
    }
  };

  const handleDeleteNewsletter = (newsletter: Newsletter) => {
    Alert.alert(
      'Delete Newsletter',
      `Are you sure you want to delete "${newsletter.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('newsletters')
                .delete()
                .eq('id', newsletter.id);

              if (error) {
                console.error('Error deleting newsletter:', error);
                Alert.alert('Error', 'Failed to delete newsletter');
                return;
              }

              console.log('Newsletter deleted successfully');
              Alert.alert('Success', 'Newsletter deleted successfully');
              await loadNewsletters();
            } catch (error) {
              console.error('Unexpected error deleting newsletter:', error);
              Alert.alert('Error', 'Failed to delete newsletter');
            }
          }
        }
      ]
    );
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingNewsletter(null);
    setTitle('');
    setContent('');
    console.log('Newsletter creation/editing cancelled');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return colors.success;
      case 'draft': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const renderStyledPreview = (text: string) => {
    const lines = text.split('\n');
    
    return lines.slice(0, 3).map((line, lineIndex) => {
      // Handle headings
      if (line.startsWith('# ')) {
        return (
          <Text key={lineIndex} style={[commonStyles.text, { 
            fontSize: 16, 
            fontWeight: 'bold', 
            marginBottom: 4,
            color: colors.primary 
          }]}>
            {line.substring(2)}
          </Text>
        );
      }

      // Handle bullet points
      if (line.startsWith('• ')) {
        return (
          <View key={lineIndex} style={{ flexDirection: 'row', marginBottom: 4 }}>
            <Text style={[commonStyles.textSecondary, { marginRight: 6 }]}>•</Text>
            <Text style={[commonStyles.textSecondary, { flex: 1 }]} numberOfLines={1}>
              {line.substring(2).replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')}
            </Text>
          </View>
        );
      }

      // Handle regular text (strip formatting for preview)
      const cleanText = line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
      if (cleanText.trim()) {
        return (
          <Text key={lineIndex} style={[commonStyles.textSecondary, { marginBottom: 4 }]} numberOfLines={1}>
            {cleanText}
          </Text>
        );
      }
      return null;
    }).filter(Boolean);
  };

  if (loading) {
    return (
      <SafeAreaView style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (isCreating) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.backgroundAlt,
        }}>
          <View style={commonStyles.row}>
            <TouchableOpacity onPress={handleCancel}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[commonStyles.title, { marginBottom: 0, flex: 1, textAlign: 'center' }]}>
              {editingNewsletter ? 'Edit Newsletter' : 'Create Newsletter'}
            </Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        <View style={{ flex: 1 }}>
          {/* Title Input */}
          <View style={{ 
            paddingHorizontal: 20, 
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          }}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
              Newsletter Title
            </Text>
            <TextInput
              style={[commonStyles.input, { fontSize: 16, marginBottom: 0 }]}
              placeholder="Enter newsletter title..."
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={colors.textSecondary}
              multiline={false}
            />
          </View>

          {/* Content Editor */}
          <View style={{ flex: 1 }}>
            <View style={{
              paddingHorizontal: 20,
              paddingVertical: 12,
              backgroundColor: colors.backgroundAlt,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                Newsletter Content
              </Text>
            </View>
            
            <TextStyleEditor
              value={content}
              onChangeText={setContent}
              placeholder="Write your newsletter content here...

Use the formatting toolbar above to style your text:
• **Bold text** for emphasis
• *Italic text* for subtle emphasis  
• # Headings for section titles
• • Bullet points for lists

Example:
# Weekly Update
This week we had an amazing **camping trip**! 

• Great weather
• Fun activities  
• *Excellent* teamwork"
            />
          </View>

          {/* Action Buttons */}
          <View style={{
            flexDirection: 'row',
            gap: 12,
            paddingHorizontal: 20,
            paddingVertical: 16,
            backgroundColor: colors.backgroundAlt,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}>
            <TouchableOpacity
              style={[commonStyles.button, { 
                flex: 1,
                backgroundColor: colors.textSecondary,
              }]}
              onPress={() => handleSaveNewsletter('draft')}
            >
              <Text style={[commonStyles.buttonText, { color: colors.backgroundAlt }]}>
                Save as Draft
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[commonStyles.button, { flex: 1 }]}
              onPress={() => handleSaveNewsletter('published')}
            >
              <Text style={commonStyles.buttonText}>
                Publish Newsletter
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.backgroundAlt,
      }}>
        <View style={commonStyles.row}>
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[commonStyles.title, { marginBottom: 0, flex: 1, textAlign: 'center' }]}>
            Newsletter
          </Text>
          <TouchableOpacity onPress={handleCreateNewsletter}>
            <Icon name="add" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={commonStyles.section}>
          {/* Create Newsletter Button */}
          <TouchableOpacity
            style={[commonStyles.card, { 
              alignItems: 'center',
              paddingVertical: 24,
              borderStyle: 'dashed',
              borderWidth: 2,
              borderColor: colors.primary,
              backgroundColor: 'transparent',
            }]}
            onPress={handleCreateNewsletter}
          >
            <Icon name="create" size={48} color={colors.primary} />
            <Text style={[commonStyles.text, { 
              marginTop: 12,
              fontWeight: '600',
              color: colors.primary,
            }]}>
              Create Styled Newsletter
            </Text>
            <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 4 }]}>
              Use rich text formatting to create engaging newsletters
            </Text>
          </TouchableOpacity>

          {/* Newsletter List */}
          {newsletters.length > 0 ? (
            newsletters.map((newsletter) => (
              <View key={newsletter.id} style={commonStyles.card}>
                <View style={commonStyles.row}>
                  <View style={{ flex: 1 }}>
                    <View style={[commonStyles.row, { marginBottom: 8 }]}>
                      <Text style={[commonStyles.text, { fontWeight: '600', flex: 1 }]}>
                        {newsletter.title}
                      </Text>
                      <View style={{
                        backgroundColor: getStatusColor(newsletter.status),
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}>
                        <Text style={{
                          color: colors.backgroundAlt,
                          fontSize: 12,
                          fontWeight: '600',
                        }}>
                          {newsletter.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={{ marginBottom: 8 }}>
                      {renderStyledPreview(newsletter.content)}
                    </View>
                    
                    <View style={commonStyles.row}>
                      <Text style={commonStyles.textSecondary}>
                        By {newsletter.author_name}
                      </Text>
                      <Text style={commonStyles.textSecondary}>
                        {newsletter.status === 'published' && newsletter.published_at
                          ? formatDate(newsletter.published_at)
                          : formatDate(newsletter.updated_at)
                        }
                      </Text>
                    </View>
                  </View>
                </View>
                
                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.info,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                      flex: 1,
                      alignItems: 'center',
                    }}
                    onPress={() => handleEditNewsletter(newsletter)}
                  >
                    <Text style={{ color: colors.backgroundAlt, fontSize: 14, fontWeight: '600' }}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.error,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                      flex: 1,
                      alignItems: 'center',
                    }}
                    onPress={() => handleDeleteNewsletter(newsletter)}
                  >
                    <Text style={{ color: colors.backgroundAlt, fontSize: 14, fontWeight: '600' }}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 40 }]}>
              <Icon name="document-text" size={48} color={colors.textSecondary} />
              <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
                No newsletters yet
              </Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 4 }]}>
                Create your first styled newsletter to share updates with your troop
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
