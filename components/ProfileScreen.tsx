
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const [user] = useState({
    name: 'Scout Leader',
    email: 'leader@scoutpost.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    troop: 'Troop 123',
    role: 'Scoutmaster',
    joinDate: 'January 2020',
    badges: 15,
    events: 42,
    posts: 8
  });

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

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={commonStyles.section}>
        {/* Profile Header */}
        <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 24 }]}>
          <Image
            source={{ uri: user.avatar }}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              marginBottom: 16,
            }}
          />
          <Text style={[commonStyles.title, { marginBottom: 4 }]}>
            {user.name}
          </Text>
          <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
            {user.role} • {user.troop}
          </Text>
          <Text style={commonStyles.textSecondary}>
            Member since {user.joinDate}
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
          onPress={() => console.log('Edit profile pressed')}
        />

        <MenuButton
          icon="notifications"
          label="Notifications"
          onPress={() => console.log('Notifications pressed')}
        />

        <MenuButton
          icon="settings"
          label="Settings"
          onPress={() => console.log('Settings pressed')}
        />

        <MenuButton
          icon="help-circle"
          label="Help & Support"
          onPress={() => console.log('Help pressed')}
        />

        <MenuButton
          icon="information-circle"
          label="About Scoutpost"
          onPress={() => console.log('About pressed')}
        />

        <MenuButton
          icon="log-out"
          label="Logout"
          onPress={handleLogout}
          color={colors.error}
        />

        {/* App Info */}
        <View style={{ alignItems: 'center', marginTop: 20, paddingBottom: 20 }}>
          <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
            Scoutpost v1.0.0
          </Text>
          <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 4 }]}>
            Your scouting calendar and community
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
