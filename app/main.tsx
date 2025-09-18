
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import CalendarScreen from '../components/CalendarScreen';
import ProfileScreen from '../components/ProfileScreen';
import SocialScreen from '../components/SocialScreen';
import Icon from '../components/Icon';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

type TabType = 'calendar' | 'social' | 'profile';

export default function MainScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.log('User not authenticated, redirecting to login');
        router.replace('/');
        return;
      }

      console.log('User authenticated:', user.email);
    } catch (error) {
      console.error('Auth check error:', error);
      router.replace('/');
    } finally {
      setIsLoading(false);
    }
  };

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
      style={[
        commonStyles.tabButton,
        activeTab === tab && commonStyles.tabButtonActive
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Icon 
        name={icon as any} 
        size={24} 
        color={activeTab === tab ? colors.primary : colors.text} 
      />
      <Text style={[
        commonStyles.tabButtonText,
        { color: activeTab === tab ? colors.primary : colors.text }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={commonStyles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="home" size={24} color="#DC2626" style={{ marginRight: 8 }} />
          <Text style={[commonStyles.headerTitle, { fontFamily: 'Sansita_700Bold' }]}>
            Scoutpost
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>

      {/* Bottom Navigation */}
      <View style={commonStyles.bottomNav}>
        <TabButton tab="calendar" icon="calendar" label="Calendar" />
        <TabButton tab="social" icon="chatbubbles" label="Community" />
        <TabButton tab="profile" icon="person" label="Profile" />
      </View>
    </SafeAreaView>
  );
}
