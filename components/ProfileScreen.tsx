
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import { router } from 'expo-router';
import SimpleBottomSheet from './BottomSheet';
import EditProfileScreen from './EditProfileScreen';
import SettingsScreen from './SettingsScreen';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  troop: string;
  role: string;
  phone: string;
  badges: number;
  events: number;
  posts: number;
}

export default function ProfileScreen() {
  // Auto-fill name and email from signup (simulated from login screen)
  const [user, setUser] = useState<UserProfile>({
    name: 'Scout Leader', // This would come from signup
    email: 'leader@scoutpost.com', // This would come from signup
    avatar: '', // Empty string for generic avatar
    troop: 'Troop 123',
    role: 'Scoutmaster',
    phone: '+1 (555) 123-4567',
    badges: 15,
    events: 42,
    posts: 8
  });

  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            console.log('User logged out');
            router.replace('/');
          }
        }
      ]
    );
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setUser(updatedProfile);
    setShowEditProfile(false);
    console.log('Profile updated:', updatedProfile);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleNotifications = () => {
    setShowNotifications(true);
    console.log('Notifications screen opened');
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
            {user.role} • {user.troop}
          </Text>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <StatCard
            icon="ribbon"
            label="Badges"
            value={user.badges}
            color={colors.warning}
          />
          <StatCard
            icon="calendar"
            label="Events"
            value={user.events}
            color={colors.primary}
          />
          <StatCard
            icon="chatbubbles"
            label="Posts"
            value={user.posts}
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
            <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
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
