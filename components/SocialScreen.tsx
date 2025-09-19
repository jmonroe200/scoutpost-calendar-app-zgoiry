
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import CommunityFeedSection from './CommunityFeedSection';
import NewsletterSection from './NewsletterSection';

export default function SocialScreen() {
  const [activeSection, setActiveSection] = useState<'feed' | 'newsletter'>('feed');

  const TabButton = ({ 
    section, 
    icon, 
    label, 
    isActive 
  }: { 
    section: 'feed' | 'newsletter'; 
    icon: string; 
    label: string; 
    isActive: boolean; 
  }) => (
    <TouchableOpacity
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: isActive ? colors.primary : colors.backgroundAlt,
        borderRadius: 8,
        marginHorizontal: 4,
      }}
      onPress={() => setActiveSection(section)}
      activeOpacity={0.7}
    >
      <Icon 
        name={icon} 
        size={18} 
        color={isActive ? colors.backgroundAlt : colors.textSecondary} 
      />
      <Text style={{
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: isActive ? colors.backgroundAlt : colors.textSecondary,
      }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[commonStyles.container, { paddingTop: 0 }]}>
      {/* Header with centered title */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 16 }]}>
          Social Hub
        </Text>

        {/* Tab Navigation */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: colors.grey,
          borderRadius: 12,
          padding: 4,
          marginBottom: 16,
        }}>
          <TabButton
            section="feed"
            icon="chatbubbles"
            label="Community Feed"
            isActive={activeSection === 'feed'}
          />
          <TabButton
            section="newsletter"
            icon="mail"
            label="Newsletter"
            isActive={activeSection === 'newsletter'}
          />
        </View>
      </View>

      {/* Content Area */}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {activeSection === 'feed' ? (
          <CommunityFeedSection />
        ) : (
          <NewsletterSection />
        )}
      </View>
    </View>
  );
}
