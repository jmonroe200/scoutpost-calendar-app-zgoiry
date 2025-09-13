
import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';
import CalendarScreen from '../components/CalendarScreen';
import SocialScreen from '../components/SocialScreen';
import ProfileScreen from '../components/ProfileScreen';

type TabType = 'calendar' | 'social' | 'profile';

export default function MainScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('calendar');

  const renderContent = () => {
    switch (activeTab) {
      case 'calendar':
        return <CalendarScreen />;
      case 'social':
        return <SocialScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <CalendarScreen />;
    }
  };

  const TabButton = ({ tab, icon, label }: { tab: TabType; icon: string; label: string }) => (
    <TouchableOpacity
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
      }}
      onPress={() => setActiveTab(tab)}
    >
      <Icon
        name={icon as any}
        size={24}
        color={activeTab === tab ? colors.primary : colors.textSecondary}
      />
      <Text
        style={{
          fontSize: 12,
          marginTop: 4,
          color: activeTab === tab ? colors.primary : colors.textSecondary,
          fontWeight: activeTab === tab ? '600' : '400',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.backgroundAlt,
        }}>
          <Text style={[commonStyles.title, { fontSize: 28, color: colors.primary, textAlign: 'left', marginBottom: 0 }]}>
            Scoutpost
          </Text>
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          {renderContent()}
        </View>

        {/* Bottom Navigation */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: colors.backgroundAlt,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 8,
        }}>
          <TabButton tab="calendar" icon="calendar" label="Calendar" />
          <TabButton tab="social" icon="people" label="Social" />
          <TabButton tab="profile" icon="person" label="Profile" />
        </View>
      </View>
    </SafeAreaView>
  );
}
