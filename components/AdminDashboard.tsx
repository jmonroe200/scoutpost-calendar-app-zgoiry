
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { router } from 'expo-router';
import Icon from './Icon';
import SimpleBottomSheet from './BottomSheet';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  troop: string;
  created_at: string;
}

interface CalendarEntry {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'meeting' | 'activity' | 'camping' | 'service';
  created_by_name: string;
  created_at: string;
}

interface Post {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'calendar' | 'posts'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      await Promise.all([
        loadUsers(),
        loadCalendarEntries(),
        loadPosts()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      setUsers(data || []);
      console.log('Loaded users:', data?.length || 0);
    } catch (error) {
      console.error('Unexpected error loading users:', error);
    }
  };

  const loadCalendarEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading calendar entries:', error);
        return;
      }

      setCalendarEntries(data || []);
      console.log('Loaded calendar entries:', data?.length || 0);
    } catch (error) {
      console.error('Unexpected error loading calendar entries:', error);
    }
  };

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading posts:', error);
        return;
      }

      setPosts(data || []);
      console.log('Loaded posts:', data?.length || 0);
    } catch (error) {
      console.error('Unexpected error loading posts:', error);
    }
  };

  const handleNewsletterAccess = () => {
    console.log('Navigating to Newsletter page');
    router.push('/Newsletter');
  };

  const handleDeleteUser = (user: User) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.name}? This action cannot be undone and will remove all their data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Note: This will cascade delete due to foreign key constraints
              const { error } = await supabase.auth.admin.deleteUser(user.user_id);

              if (error) {
                console.error('Error deleting user:', error);
                Alert.alert('Error', 'Failed to delete user. You may not have admin permissions.');
                return;
              }

              console.log('User deleted successfully');
              Alert.alert('Success', 'User deleted successfully');
              await loadUsers();
            } catch (error) {
              console.error('Unexpected error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  const handleDeleteCalendarEntry = (entry: CalendarEntry) => {
    Alert.alert(
      'Delete Calendar Entry',
      `Are you sure you want to delete "${entry.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', entry.id);

              if (error) {
                console.error('Error deleting calendar entry:', error);
                Alert.alert('Error', 'Failed to delete calendar entry');
                return;
              }

              console.log('Calendar entry deleted successfully');
              Alert.alert('Success', 'Calendar entry deleted successfully');
              await loadCalendarEntries();
            } catch (error) {
              console.error('Unexpected error deleting calendar entry:', error);
              Alert.alert('Error', 'Failed to delete calendar entry');
            }
          }
        }
      ]
    );
  };

  const handleDeletePost = (post: Post) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', post.id);

              if (error) {
                console.error('Error deleting post:', error);
                Alert.alert('Error', 'Failed to delete post');
                return;
              }

              console.log('Post deleted successfully');
              Alert.alert('Success', 'Post deleted successfully');
              await loadPosts();
            } catch (error) {
              console.error('Unexpected error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post');
            }
          }
        }
      ]
    );
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return colors.info;
      case 'activity': return colors.success;
      case 'camping': return colors.secondary;
      case 'service': return colors.warning;
      default: return colors.primary;
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return 'people';
      case 'activity': return 'fitness';
      case 'camping': return 'bonfire';
      case 'service': return 'heart';
      default: return 'calendar';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCalendarEntries = calendarEntries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPosts = posts.filter(post =>
    post.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TabButton = ({ tab, label, count }: { tab: 'users' | 'calendar' | 'posts'; label: string; count: number }) => (
    <TouchableOpacity
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: activeTab === tab ? colors.primary : 'transparent',
        borderRadius: 8,
        marginHorizontal: 2,
      }}
      onPress={() => setActiveTab(tab)}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: activeTab === tab ? colors.backgroundAlt : colors.text,
          marginBottom: 2,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: activeTab === tab ? colors.backgroundAlt : colors.textSecondary,
        }}
      >
        {count} items
      </Text>
    </TouchableOpacity>
  );

  const renderUsers = () => (
    <View>
      {filteredUsers.length === 0 ? (
        <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 40 }]}>
          <Icon name="people" size={48} color={colors.textSecondary} />
          <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
            No users found
          </Text>
        </View>
      ) : (
        filteredUsers.map((user) => (
          <View key={user.id} style={commonStyles.card}>
            <View style={commonStyles.row}>
              <View style={{ flex: 1 }}>
                <View style={[commonStyles.centerRow, { justifyContent: 'flex-start', marginBottom: 8 }]}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.grey,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Icon name="person" size={20} color={colors.textSecondary} />
                  </View>
                  <View>
                    <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 2 }]}>
                      {user.name || 'Unknown User'}
                    </Text>
                    <Text style={commonStyles.textSecondary}>
                      {user.email || 'No email'}
                    </Text>
                  </View>
                </View>
                <View style={[commonStyles.row, { marginBottom: 8 }]}>
                  <Text style={commonStyles.textSecondary}>
                    {user.role || 'No role'} • {user.troop || 'No troop'}
                  </Text>
                </View>
                <Text style={commonStyles.textSecondary}>
                  Joined: {formatDate(user.created_at)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteUser(user)}
                style={{
                  backgroundColor: colors.error,
                  padding: 8,
                  borderRadius: 6,
                  marginLeft: 12,
                }}
              >
                <Icon name="trash" size={16} color={colors.backgroundAlt} />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderCalendarEntries = () => (
    <View>
      {filteredCalendarEntries.length === 0 ? (
        <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 40 }]}>
          <Icon name="calendar" size={48} color={colors.textSecondary} />
          <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
            No calendar entries found
          </Text>
        </View>
      ) : (
        filteredCalendarEntries.map((entry) => (
          <View key={entry.id} style={commonStyles.card}>
            <View style={commonStyles.row}>
              <View style={{ flex: 1 }}>
                <View style={[commonStyles.centerRow, { justifyContent: 'flex-start', marginBottom: 8 }]}>
                  <View style={{
                    backgroundColor: getEventTypeColor(entry.type),
                    padding: 8,
                    borderRadius: 8,
                    marginRight: 12,
                  }}>
                    <Icon name={getEventTypeIcon(entry.type) as any} size={20} color={colors.backgroundAlt} />
                  </View>
                  <View>
                    <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 2 }]}>
                      {entry.title}
                    </Text>
                    <Text style={commonStyles.textSecondary}>
                      {formatDate(entry.date)} • {entry.time}
                    </Text>
                  </View>
                </View>
                <Text style={[commonStyles.textSecondary, { marginBottom: 4 }]}>
                  Location: {entry.location}
                </Text>
                <Text style={commonStyles.textSecondary}>
                  Created by: {entry.created_by_name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteCalendarEntry(entry)}
                style={{
                  backgroundColor: colors.error,
                  padding: 8,
                  borderRadius: 6,
                  marginLeft: 12,
                }}
              >
                <Icon name="trash" size={16} color={colors.backgroundAlt} />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderPosts = () => (
    <View>
      {filteredPosts.length === 0 ? (
        <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 40 }]}>
          <Icon name="chatbubbles" size={48} color={colors.textSecondary} />
          <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
            No posts found
          </Text>
        </View>
      ) : (
        filteredPosts.map((post) => (
          <View key={post.id} style={commonStyles.card}>
            <View style={commonStyles.row}>
              <View style={{ flex: 1 }}>
                <View style={[commonStyles.centerRow, { justifyContent: 'flex-start', marginBottom: 8 }]}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: colors.grey,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Icon name="person" size={20} color={colors.textSecondary} />
                  </View>
                  <View>
                    <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 2 }]}>
                      {post.author_name}
                    </Text>
                    <Text style={commonStyles.textSecondary}>
                      {formatDate(post.created_at)}
                    </Text>
                  </View>
                </View>
                <Text style={[commonStyles.text, { marginBottom: 8 }]} numberOfLines={2}>
                  {post.content}
                </Text>
                <View style={commonStyles.row}>
                  <View style={commonStyles.centerRow}>
                    <Icon name="heart" size={16} color={colors.like} />
                    <Text style={[commonStyles.textSecondary, { marginLeft: 4 }]}>
                      {post.likes_count || 0}
                    </Text>
                  </View>
                  <View style={[commonStyles.centerRow, { marginLeft: 16 }]}>
                    <Icon name="chatbubble" size={16} color={colors.info} />
                    <Text style={[commonStyles.textSecondary, { marginLeft: 4 }]}>
                      {post.comments_count || 0}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleDeletePost(post)}
                style={{
                  backgroundColor: colors.error,
                  padding: 8,
                  borderRadius: 6,
                  marginLeft: 12,
                }}
              >
                <Icon name="trash" size={16} color={colors.backgroundAlt} />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return renderUsers();
      case 'calendar':
        return renderCalendarEntries();
      case 'posts':
        return renderPosts();
      default:
        return renderUsers();
    }
  };

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.backgroundAlt,
      }}>
        <View style={commonStyles.row}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[commonStyles.title, { marginBottom: 0, flex: 1, textAlign: 'center' }]}>
            Admin Dashboard
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
        <View style={{ position: 'relative' }}>
          <TextInput
            style={[commonStyles.input, { paddingLeft: 40 }]}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
          <Icon
            name="search"
            size={20}
            color={colors.textSecondary}
            style={{ position: 'absolute', left: 12, top: 12 }}
          />
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={{
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
      }}>
        <TabButton tab="users" label="Users" count={filteredUsers.length} />
        <TabButton tab="calendar" label="Calendar" count={filteredCalendarEntries.length} />
        <TabButton tab="posts" label="Posts" count={filteredPosts.length} />
      </View>

      {/* Quick Actions */}
      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <TouchableOpacity
          style={[commonStyles.card, {
            backgroundColor: colors.primary,
            alignItems: 'center',
            paddingVertical: 16,
          }]}
          onPress={handleNewsletterAccess}
        >
          <View style={commonStyles.centerRow}>
            <Icon name="mail" size={24} color={colors.backgroundAlt} />
            <Text style={{
              color: colors.backgroundAlt,
              fontSize: 16,
              fontWeight: '600',
              marginLeft: 12,
            }}>
              Manage Newsletter
            </Text>
          </View>
          <Text style={{
            color: colors.backgroundAlt,
            fontSize: 14,
            marginTop: 4,
            opacity: 0.9,
          }}>
            Create and publish weekly newsletters
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }}>
        <View style={commonStyles.section}>
          {renderContent()}
        </View>
      </ScrollView>
    </View>
  );
}
