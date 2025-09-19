
import React from 'react';
import { View, Text } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import CommunityFeedSection from './CommunityFeedSection';

export default function SocialScreen() {
  return (
    <View style={[commonStyles.container, { paddingTop: 0 }]}>
      {/* Header with centered title */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 16 }]}>
          Community Feed
        </Text>
      </View>

      {/* Content Area */}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <CommunityFeedSection />
      </View>
    </View>
  );
}
