
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from '../components/Icon';
import CalendarScreen from '../components/CalendarScreen';
import SocialScreen from '../components/SocialScreen';
import ProfileScreen from '../components/ProfileScreen';
import NewsletterSection from '../components/NewsletterSection';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

type TabType = 'calendar' | 'social' | 'newsletter' | 'profile';

export default function MainScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No session found, redirecting to login');
        router.replace('/');
        return;
      }
      console.log('User authenticated:', session.user.email);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getSectionTitle = () => {
    switch (activeTab) {
      case 'calendar':
        return 'Calendar';
      case 'social':
        return 'Community Feed';
      case 'newsletter':
        return 'Newsletters';
      case 'profile':
        return 'Profile';
      default:
        return 'Calendar';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'calendar':
        return <CalendarScreen />;
      case 'social':
        return <SocialScreen />;
      case 'newsletter':
        return <NewsletterSection />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <CalendarScreen />;
    }
  };

  const TabButton = ({ tab, icon, label }: { tab: TabType; icon: string; label: string }) => (
    <TouchableOpacity
      style={[
        commonStyles.centerColumn,
        { 
          flex: 1, 
          paddingVertical: 12,
          backgroundColor: activeTab === tab ? colors.primary + '20' : 'transparent',
          borderRadius: 12,
          marginHorizontal: 2,
          alignItems: 'center',
          justifyContent: 'center',
        }
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Icon 
        name={icon as any} 
        size={22} 
        color={activeTab === tab ? colors.primary : colors.text} 
      />
      <Text style={[
        commonStyles.textSmall, 
        { 
          marginTop: 4,
          color: activeTab === tab ? colors.primary : colors.text,
          fontWeight: activeTab === tab ? '600' : '400',
          textAlign: 'center',
          fontSize: 11,
        }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={commonStyles.text}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header with Dynamic Section Title */}
      <View style={[{ padding: 20, paddingBottom: 10, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={[commonStyles.title, { 
          fontFamily: 'Sansita_700Bold',
          color: colors.primary,
          fontSize: 28,
          textAlign: 'center'
        }]}>
          {getSectionTitle()}
        </Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>

      {/* Bottom Navigation */}
      <View style={[
        commonStyles.row, 
        { 
          padding: 12,
          backgroundColor: colors.backgroundAlt,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }
      ]}>
        <TabButton tab="calendar" icon="calendar" label="Calendar" />
        <TabButton tab="social" icon="chatbubbles" label="Community" />
        <TabButton tab="newsletter" icon="mail" label="Newsletters" />
        <TabButton tab="profile" icon="person" label="Profile" />
      </View>
    </SafeAreaView>
  );
}
