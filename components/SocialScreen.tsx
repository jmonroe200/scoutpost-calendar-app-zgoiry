
import React from 'react';
import { View } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import CommunityFeedSection from './CommunityFeedSection';

export default function SocialScreen() {
  return (
    <View style={[commonStyles.container, { paddingTop: 0 }]}>
      {/* Content Area */}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <CommunityFeedSection />
      </View>
    </View>
  );
}
