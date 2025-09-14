
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import SimpleBottomSheet from './BottomSheet';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  troop: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

interface CalendarEntry {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'meeting' | 'activity' | 'camping' | 'service';
  createdBy: string;
}

interface Post {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
}

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'calendar' | 'posts'>('users');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in real app, this would come from Supabase
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Alex Thompson',
      email: 'alex@scoutpost.com',
      role: 'Scoutmaster',
      troop: 'Troop 123',
      joinDate: '2023-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Sarah Miller',
      email: 'sarah@scoutpost.com',
      role: 'Assistant Leader',
      troop: 'Troop 123',
      joinDate: '2023-03-20',
      status: 'active'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@scoutpost.com',
      role: 'Parent Volunteer',
      troop: 'Troop 123',
      joinDate: '2023-06-10',
      status: 'inactive'
    }
  ]);

  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([
    {
      id: '1',
      title: 'Troop Meeting',
      date: '2024-01-15',
      time: '7:00 PM',
      location: 'Scout Hall',
      type: 'meeting',
      createdBy: 'Alex Thompson'
    },
    {
      id: '2',
      title: 'Winter Camping',
      date: '2024-01-20',
      time: '9:00 AM',
      location: 'Pine Ridge Camp',
      type: 'camping',
      createdBy: 'Sarah Miller'
    },
    {
      id: '3',
      title: 'Community Service',
      date: '2024-01-25',
      time: '10:00 AM',
      location: 'Local Food Bank',
      type: 'service',
      createdBy: 'Mike Johnson'
    }
  ]);

  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'Alex Thompson',
      content: 'Just finished our winter camping trip! The scouts showed incredible resilience...',
      timestamp: '2 hours ago',
      likes: 12,
      comments: 3
    },
    {
      id: '2',
      author: 'Mike Johnson',
      content: 'Community service day was a huge success! We collected over 200 canned goods...',
      timestamp: '5 hours ago',
      likes: 18,
      comments: 5
    },
    {
      id: '3',
      author: 'Sarah Miller',
      content: 'Badge work session this Saturday! We\'ll be working on Cooking and First Aid badges...',
      timestamp: '1 day ago',
      likes: 8,
      comments: 2
    }
  ]);

  const handleDeleteUser = (userId: string) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setUsers(users.filter(u => u.id !== userId));
            console.log('Deleted user:', userId);
            Alert.alert('Success', 'User deleted successfully');
          }
        }
      ]
    );
  };

  const handleDeleteCalendarEntry = (entryId: string) => {
    Alert.alert(
      'Delete Calendar Entry',
      'Are you sure you want to delete this calendar entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCalendarEntries(calendarEntries.filter(e => e.id !== entryId));
            console.log('Deleted calendar entry:', entryId);
            Alert.alert('Success', 'Calendar entry deleted successfully');
          }
        }
      ]
    );
  };

  const handleDeletePost = (postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPosts(posts.filter(p => p.id !== postId));
            console.log('Deleted post:', postId);
            Alert.alert('Success', 'Post deleted successfully');
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

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCalendarEntries = calendarEntries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPosts = posts.filter(post =>
    post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      {filteredUsers.map((user) => (
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
                    {user.name}
                  </Text>
                  <Text style={commonStyles.textSecondary}>
                    {user.email}
                  </Text>
                </View>
              </View>
              <View style={[commonStyles.row, { marginBottom: 8 }]}>
                <Text style={commonStyles.textSecondary}>
                  {user.role} • {user.troop}
                </Text>
                <View style={{
                  backgroundColor: user.status === 'active' ? colors.success : colors.warning,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}>
                  <Text style={{ color: colors.backgroundAlt, fontSize: 12, fontWeight: '600' }}>
                    {user.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={commonStyles.textSecondary}>
                Joined: {new Date(user.joinDate).toLocaleDateString()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDeleteUser(user.id)}
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
      ))}
    </View>
  );

  const renderCalendarEntries = () => (
    <View>
      {filteredCalendarEntries.map((entry) => (
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
                    {new Date(entry.date).toLocaleDateString()} • {entry.time}
                  </Text>
                </View>
              </View>
              <Text style={[commonStyles.textSecondary, { marginBottom: 4 }]}>
                Location: {entry.location}
              </Text>
              <Text style={commonStyles.textSecondary}>
                Created by: {entry.createdBy}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDeleteCalendarEntry(entry.id)}
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
      ))}
    </View>
  );

  const renderPosts = () => (
    <View>
      {filteredPosts.map((post) => (
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
                    {post.author}
                  </Text>
                  <Text style={commonStyles.textSecondary}>
                    {post.timestamp}
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
                    {post.likes}
                  </Text>
                </View>
                <View style={[commonStyles.centerRow, { marginLeft: 16 }]}>
                  <Icon name="chatbubble" size={16} color={colors.info} />
                  <Text style={[commonStyles.textSecondary, { marginLeft: 4 }]}>
                    {post.comments}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleDeletePost(post.id)}
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
      ))}
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

      {/* Content */}
      <ScrollView style={{ flex: 1 }}>
        <View style={commonStyles.section}>
          {renderContent()}
        </View>
      </ScrollView>

      {/* Supabase Notice */}
      <View style={{
        backgroundColor: colors.info,
        paddingHorizontal: 20,
        paddingVertical: 12,
        margin: 20,
        borderRadius: 8,
      }}>
        <View style={[commonStyles.centerRow, { justifyContent: 'flex-start' }]}>
          <Icon name="information-circle" size={20} color={colors.backgroundAlt} />
          <Text style={{
            color: colors.backgroundAlt,
            fontSize: 14,
            fontWeight: '600',
            marginLeft: 8,
            flex: 1,
          }}>
            To enable real backend functionality, connect to Supabase using the Supabase button.
          </Text>
        </View>
      </View>
    </View>
  );
}
