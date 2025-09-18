
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import { router } from 'expo-router';
import SimpleBottomSheet from './BottomSheet';
import EditProfileScreen from './EditProfileScreen';
import SettingsScreen from './SettingsScreen';
import AdminDashboard from './AdminDashboard';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../lib/types';

export default function ProfileScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  // Mock stats - in real app these would come from database
  const [stats, setStats] = useState({
    badges: 15,
    events: 42,
    posts: 8,
    isAdmin: false
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        console.error('Auth error:', authError);
        router.replace('/');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        // If no profile exists, create a basic one
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: authUser.id,
            name: authUser.user_metadata?.name || 'Scout User',
            email: authUser.email || '',
            troop: '',
            role: ''
          });

        if (insertError) {
          console.error('Profile creation error:', insertError);
        } else {
          // Reload profile after creation
          loadUserProfile();
          return;
        }
      } else {
        setUser(profile);
        console.log('Profile loaded:', profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              console.log('User logged out');
              router.replace('/');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleSaveProfile = async (updatedProfile: UserProfile) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          name: updatedProfile.name,
          email: updatedProfile.email,
          troop: updatedProfile.troop,
          role: updatedProfile.role,
          phone: updatedProfile.phone,
          avatar_url: updatedProfile.avatar_url
        })
        .eq('user_id', authUser.id);

      if (error) {
        console.error('Profile update error:', error);
        Alert.alert('Error', 'Failed to update profile. Please try again.');
        return;
      }

      setUser(updatedProfile);
      setShowEditProfile(false);
      console.log('Profile updated:', updatedProfile);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleNotifications = () => {
    setShowNotifications(true);
    console.log('Notifications screen opened');
  };

  const handleAdminDashboard = () => {
    setShowAdminDashboard(true);
    console.log('Admin dashboard opened');
  };

  const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) => (
    <View style={[commonStyles.card, { flex: 1, alignItems: 'center', marginHorizontal: 4 }]}>
      <View style={{
        backgroundColor: color,
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
      }}>
        <Icon name={icon as any} size={24} color={colors.backgroundAlt} />
      </View>
      <Text style={[commonStyles.text, { fontWeight: '700', fontSize: 20, marginBottom: 4 }]}>
        {value}
      </Text>
      <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
        {label}
      </Text>
    </View>
  );

  const MenuButton = ({ icon, label, onPress, color = colors.text }: { 
    icon: string; 
    label: string; 
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity
      style={[commonStyles.card, commonStyles.row]}
      onPress={onPress}
    >
      <View style={commonStyles.centerRow}>
        <Icon name={icon as any} size={24} color={color} />
        <Text style={[commonStyles.text, { marginLeft: 16, color }]}>
          {label}
        </Text>
      </View>
      <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const NotificationsContent = () => (
    <View style={{ padding: 20 }}>
      <Text style={[commonStyles.subtitle, { textAlign: 'center', marginBottom: 20 }]}>
        Notifications
      </Text>
      
      <View style={[commonStyles.card, { marginBottom: 12 }]}>
        <View style={[commonStyles.row, { marginBottom: 8 }]}>
          <Icon name="calendar" size={20} color={colors.primary} />
          <Text style={[commonStyles.text, { marginLeft: 12, flex: 1 }]}>
            Camping Trip Reminder
          </Text>
          <Text style={commonStyles.textSecondary}>2h ago</Text>
        </View>
        <Text style={commonStyles.textSecondary}>
          Don&apos;t forget about the camping trip this weekend at Pine Lake!
        </Text>
      </View>

      <View style={[commonStyles.card, { marginBottom: 12 }]}>
        <View style={[commonStyles.row, { marginBottom: 8 }]}>
          <Icon name="heart" size={20} color={colors.like} />
          <Text style={[commonStyles.text, { marginLeft: 12, flex: 1 }]}>
            New Like on Your Post
          </Text>
          <Text style={commonStyles.textSecondary}>5h ago</Text>
        </View>
        <Text style={commonStyles.textSecondary}>
          Sarah liked your post about the merit badge workshop.
        </Text>
      </View>

      <View style={[commonStyles.card, { marginBottom: 12 }]}>
        <View style={[commonStyles.row, { marginBottom: 8 }]}>
          <Icon name="chatbubble" size={20} color={colors.info} />
          <Text style={[commonStyles.text, { marginLeft: 12, flex: 1 }]}>
            New Comment
          </Text>
          <Text style={commonStyles.textSecondary}>1d ago</Text>
        </View>
        <Text style={commonStyles.textSecondary}>
          Mike commented on your hiking photos from last weekend.
        </Text>
      </View>

      <TouchableOpacity
        style={[commonStyles.button, { marginTop: 20 }]}
        onPress={() => setShowNotifications(false)}
      >
        <Text style={commonStyles.buttonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={commonStyles.text}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={commonStyles.text}>Failed to load profile</Text>
        <TouchableOpacity
          style={[commonStyles.button, { marginTop: 20 }]}
          onPress={loadUserProfile}
        >
          <Text style={commonStyles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showEditProfile) {
    return (
      <EditProfileScreen
        initialProfile={user}
        onSave={handleSaveProfile}
        onCancel={() => setShowEditProfile(false)}
      />
    );
  }

  if (showSettings) {
    return (
      <SettingsScreen
        onClose={() => setShowSettings(false)}
      />
    );
  }

  if (showAdminDashboard) {
    return (
      <AdminDashboard
        onClose={() => setShowAdminDashboard(false)}
      />
    );
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={commonStyles.section}>
        {/* Profile Header */}
        <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 24 }]}>
          <TouchableOpacity
            onPress={() => setShowEditProfile(true)}
            style={{ position: 'relative' }}
          >
            {/* Generic greyscale person avatar */}
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#E5E5E5',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Icon name="person" size={50} color="#9E9E9E" />
            </View>
            <View style={{
              position: 'absolute',
              bottom: 12,
              right: 0,
              backgroundColor: colors.primary,
              borderRadius: 15,
              padding: 6,
              borderWidth: 2,
              borderColor: colors.backgroundAlt,
            }}>
              <Icon name="camera" size={16} color={colors.backgroundAlt} />
            </View>
          </TouchableOpacity>
          <Text style={[commonStyles.title, { marginBottom: 4 }]}>
            {user.name}
          </Text>
          <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
            {user.role && user.troop ? `${user.role} • ${user.troop}` : (user.role || user.troop || 'Complete your profile')}
          </Text>
          {stats.isAdmin && (
            <View style={{
              backgroundColor: colors.warning,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
              marginTop: 4,
            }}>
              <Text style={{
                color: colors.backgroundAlt,
                fontSize: 12,
                fontWeight: '600',
              }}>
                ADMIN
              </Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <StatCard
            icon="ribbon"
            label="Badges"
            value={stats.badges}
            color={colors.warning}
          />
          <StatCard
            icon="calendar"
            label="Events"
            value={stats.events}
            color={colors.primary}
          />
          <StatCard
            icon="chatbubbles"
            label="Posts"
            value={stats.posts}
            color={colors.info}
          />
        </View>

        {/* Menu Items */}
        <MenuButton
          icon="person-circle"
          label="Edit Profile"
          onPress={() => setShowEditProfile(true)}
        />

        <MenuButton
          icon="notifications"
          label="Notifications"
          onPress={handleNotifications}
        />

        {/* Admin Dashboard - Only show for admin users */}
        {stats.isAdmin && (
          <MenuButton
            icon="shield-checkmark"
            label="Admin Dashboard"
            onPress={handleAdminDashboard}
            color={colors.warning}
          />
        )}

        <MenuButton
          icon="settings"
          label="Settings"
          onPress={() => setShowSettings(true)}
        />

        <MenuButton
          icon="help-circle"
          label="Help & Support"
          onPress={() => {
            console.log('Help pressed');
            Alert.alert('Help & Support', 'Contact us at support@scoutpost.com for assistance.');
          }}
        />

        <MenuButton
          icon="information-circle"
          label="About Scoutpost"
          onPress={() => {
            console.log('About pressed');
            Alert.alert(
              'About Scoutpost',
              'Scoutpost v1.0.0\n\nA comprehensive scouting app for managing events, connecting with your troop, and sharing experiences.\n\nBuilt with ❤️ for the scouting community.'
            );
          }}
        />

        <MenuButton
          icon="log-out"
          label="Logout"
          onPress={handleLogout}
          color={colors.error}
        />

        {/* App Info with Red Tent Icon */}
        <View style={{ alignItems: 'center', marginTop: 20, paddingBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Icon name="home" size={20} color="#DC2626" style={{ marginRight: 8 }} />
            <Text style={[commonStyles.textSecondary, { 
              textAlign: 'center',
              fontFamily: 'Sansita_400Regular'
            }]}>
              Scoutpost v1.0.0
            </Text>
          </View>
          <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 4 }]}>
            Your scouting calendar and community
          </Text>
        </View>
      </View>

      {/* Notifications Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showNotifications}
        onClose={() => setShowNotifications(false)}
      >
        <NotificationsContent />
      </SimpleBottomSheet>
    </ScrollView>
  );
}
