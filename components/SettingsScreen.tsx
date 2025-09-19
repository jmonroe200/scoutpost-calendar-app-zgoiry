
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import GitHubIntegration from './GitHubIntegration';
import SimpleBottomSheet from './BottomSheet';

interface SettingsScreenProps {
  onClose: () => void;
}

export default function SettingsScreen({ onClose }: SettingsScreenProps) {
  const [showGitHubIntegration, setShowGitHubIntegration] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      push: true,
      email: false,
      eventReminders: true,
      socialUpdates: true,
      weeklyDigest: false,
    },
    privacy: {
      profileVisible: true,
      showEmail: false,
      showPhone: false,
    },
    preferences: {
      darkMode: false,
      autoSync: true,
      offlineMode: false,
    }
  });

  const updateSetting = (category: keyof typeof settings, key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    console.log(`Updated ${category}.${key} to ${value}`);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            console.log('Cache cleared');
            Alert.alert('Success', 'Cache has been cleared');
          }
        }
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to default values. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
              notifications: {
                push: true,
                email: false,
                eventReminders: true,
                socialUpdates: true,
                weeklyDigest: false,
              },
              privacy: {
                profileVisible: true,
                showEmail: false,
                showPhone: false,
              },
              preferences: {
                darkMode: false,
                autoSync: true,
                offlineMode: false,
              }
            });
            console.log('Settings reset to defaults');
            Alert.alert('Success', 'Settings have been reset to defaults');
          }
        }
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    description, 
    value, 
    onToggle, 
    color = colors.primary 
  }: {
    icon: string;
    title: string;
    description?: string;
    value: boolean;
    onToggle: (value: boolean) => void;
    color?: string;
  }) => (
    <View style={[commonStyles.card, commonStyles.row]}>
      <View style={commonStyles.centerRow}>
        <View style={{
          backgroundColor: color + '20',
          padding: 8,
          borderRadius: 8,
          marginRight: 12,
        }}>
          <Icon name={icon as any} size={20} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[commonStyles.text, { marginBottom: description ? 4 : 0 }]}>
            {title}
          </Text>
          {description && (
            <Text style={commonStyles.textSecondary}>
              {description}
            </Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.grey, true: colors.primary + '40' }}
        thumbColor={value ? colors.primary : colors.textSecondary}
      />
    </View>
  );

  const ActionItem = ({ 
    icon, 
    title, 
    description, 
    onPress, 
    color = colors.text,
    destructive = false,
    disabled = false
  }: {
    icon: string;
    title: string;
    description?: string;
    onPress: () => void;
    color?: string;
    destructive?: boolean;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        commonStyles.card, 
        commonStyles.row,
        disabled && { opacity: 0.5 }
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={commonStyles.centerRow}>
        <View style={{
          backgroundColor: (destructive ? colors.error : color) + '20',
          padding: 8,
          borderRadius: 8,
          marginRight: 12,
        }}>
          <Icon name={icon as any} size={20} color={destructive ? colors.error : color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[commonStyles.text, { 
            marginBottom: description ? 4 : 0,
            color: destructive ? colors.error : (disabled ? colors.textSecondary : colors.text)
          }]}>
            {title}
          </Text>
          {description && (
            <Text style={commonStyles.textSecondary}>
              {description}
            </Text>
          )}
        </View>
      </View>
      <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  if (showGitHubIntegration) {
    return (
      <GitHubIntegration
        onClose={() => setShowGitHubIntegration(false)}
      />
    );
  }

  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <View style={[commonStyles.row, { padding: 20, paddingBottom: 10 }]}>
        <TouchableOpacity onPress={onClose}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[commonStyles.subtitle, { flex: 1, textAlign: 'center', marginBottom: 0 }]}>
          Settings
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={commonStyles.section}>
          {/* Integrations */}
          <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>Integrations</Text>
          
          <ActionItem
            icon="logo-github"
            title="GitHub Integration"
            description="Connect your GitHub account (coming soon)"
            onPress={() => setShowGitHubIntegration(true)}
            color="#24292e"
            disabled={false}
          />

          {/* Notifications */}
          <Text style={[commonStyles.subtitle, { marginTop: 30, marginBottom: 12 }]}>Notifications</Text>
          
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            description="Receive push notifications on your device"
            value={settings.notifications.push}
            onToggle={(value) => updateSetting('notifications', 'push', value)}
          />

          <SettingItem
            icon="mail"
            title="Email Notifications"
            description="Receive notifications via email"
            value={settings.notifications.email}
            onToggle={(value) => updateSetting('notifications', 'email', value)}
            color={colors.info}
          />

          <SettingItem
            icon="alarm"
            title="Event Reminders"
            description="Get reminded about upcoming events"
            value={settings.notifications.eventReminders}
            onToggle={(value) => updateSetting('notifications', 'eventReminders', value)}
            color={colors.warning}
          />

          <SettingItem
            icon="chatbubbles"
            title="Social Updates"
            description="Notifications for likes and comments"
            value={settings.notifications.socialUpdates}
            onToggle={(value) => updateSetting('notifications', 'socialUpdates', value)}
            color={colors.like}
          />

          <SettingItem
            icon="newspaper"
            title="Weekly Digest"
            description="Weekly summary of troop activities"
            value={settings.notifications.weeklyDigest}
            onToggle={(value) => updateSetting('notifications', 'weeklyDigest', value)}
            color={colors.secondary}
          />

          {/* Privacy */}
          <Text style={[commonStyles.subtitle, { marginTop: 30, marginBottom: 12 }]}>Privacy</Text>
          
          <SettingItem
            icon="eye"
            title="Profile Visible"
            description="Allow others to see your profile"
            value={settings.privacy.profileVisible}
            onToggle={(value) => updateSetting('privacy', 'profileVisible', value)}
          />

          <SettingItem
            icon="mail"
            title="Show Email"
            description="Display email on your profile"
            value={settings.privacy.showEmail}
            onToggle={(value) => updateSetting('privacy', 'showEmail', value)}
            color={colors.info}
          />

          <SettingItem
            icon="call"
            title="Show Phone"
            description="Display phone number on your profile"
            value={settings.privacy.showPhone}
            onToggle={(value) => updateSetting('privacy', 'showPhone', value)}
            color={colors.success}
          />

          {/* Preferences */}
          <Text style={[commonStyles.subtitle, { marginTop: 30, marginBottom: 12 }]}>Preferences</Text>
          
          <SettingItem
            icon="moon"
            title="Dark Mode"
            description="Use dark theme (coming soon)"
            value={settings.preferences.darkMode}
            onToggle={(value) => updateSetting('preferences', 'darkMode', value)}
            color={colors.text}
          />

          <SettingItem
            icon="sync"
            title="Auto Sync"
            description="Automatically sync data when online"
            value={settings.preferences.autoSync}
            onToggle={(value) => updateSetting('preferences', 'autoSync', value)}
            color={colors.success}
          />

          <SettingItem
            icon="cloud-offline"
            title="Offline Mode"
            description="Enable offline functionality"
            value={settings.preferences.offlineMode}
            onToggle={(value) => updateSetting('preferences', 'offlineMode', value)}
            color={colors.textSecondary}
          />

          {/* Actions */}
          <Text style={[commonStyles.subtitle, { marginTop: 30, marginBottom: 12 }]}>Data & Storage</Text>
          
          <ActionItem
            icon="trash"
            title="Clear Cache"
            description="Free up storage space"
            onPress={handleClearCache}
            color={colors.warning}
          />

          <ActionItem
            icon="refresh"
            title="Reset Settings"
            description="Reset all settings to defaults"
            onPress={handleResetSettings}
            destructive
          />

          {/* App Info */}
          <View style={{ alignItems: 'center', marginTop: 30, paddingBottom: 20 }}>
            <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
              Scoutpost v1.0.0
            </Text>
            <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 4 }]}>
              Built with ❤️ for the scouting community
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
