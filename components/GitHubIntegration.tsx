
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';

interface GitHubIntegrationProps {
  onClose: () => void;
}

export default function GitHubIntegration({ onClose }: GitHubIntegrationProps) {
  return (
    <ScrollView style={commonStyles.container}>
      {/* Header */}
      <View style={[commonStyles.row, { padding: 20, paddingBottom: 10 }]}>
        <TouchableOpacity onPress={onClose}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[commonStyles.subtitle, { flex: 1, textAlign: 'center', marginBottom: 0 }]}>
          GitHub Integration
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={commonStyles.section}>
        {/* Default State */}
        <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 40 }]}>
          <View style={{
            backgroundColor: colors.grey,
            padding: 20,
            borderRadius: 50,
            marginBottom: 20,
          }}>
            <Icon name="logo-github" size={40} color={colors.textSecondary} />
          </View>
          
          <Text style={[commonStyles.title, { marginBottom: 12, textAlign: 'center' }]}>
            GitHub Integration
          </Text>
          
          <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginBottom: 20, lineHeight: 22 }]}>
            Connect your GitHub account to enable advanced features like repository access, profile integration, and project collaboration.
          </Text>

          <TouchableOpacity
            style={[commonStyles.button, { 
              backgroundColor: '#24292e',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 24,
              opacity: 0.5,
            }]}
            disabled={true}
          >
            <Icon name="logo-github" size={20} color={colors.backgroundAlt} />
            <Text style={[commonStyles.buttonText, { marginLeft: 12 }]}>
              Connect with GitHub
            </Text>
          </TouchableOpacity>

          <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 12, fontSize: 12 }]}>
            Feature coming soon
          </Text>
        </View>

        {/* Features Preview */}
        <Text style={[commonStyles.subtitle, { marginTop: 30, marginBottom: 16 }]}>
          Planned Features
        </Text>

        <View style={[commonStyles.card, { marginBottom: 12 }]}>
          <View style={[commonStyles.row, { marginBottom: 8 }]}>
            <Icon name="person-circle" size={24} color={colors.grey} />
            <Text style={[commonStyles.text, { marginLeft: 12, flex: 1, fontWeight: '600', color: colors.textSecondary }]}>
              Profile Integration
            </Text>
            <Icon name="ellipse-outline" size={20} color={colors.grey} />
          </View>
          <Text style={commonStyles.textSecondary}>
            Sync your GitHub profile information with your Scoutpost profile
          </Text>
        </View>

        <View style={[commonStyles.card, { marginBottom: 12 }]}>
          <View style={[commonStyles.row, { marginBottom: 8 }]}>
            <Icon name="folder" size={24} color={colors.grey} />
            <Text style={[commonStyles.text, { marginLeft: 12, flex: 1, fontWeight: '600', color: colors.textSecondary }]}>
              Repository Access
            </Text>
            <Icon name="ellipse-outline" size={20} color={colors.grey} />
          </View>
          <Text style={commonStyles.textSecondary}>
            Access and share code repositories for troop projects
          </Text>
        </View>

        <View style={[commonStyles.card, { marginBottom: 12 }]}>
          <View style={[commonStyles.row, { marginBottom: 8 }]}>
            <Icon name="git-branch" size={24} color={colors.grey} />
            <Text style={[commonStyles.text, { marginLeft: 12, flex: 1, fontWeight: '600', color: colors.textSecondary }]}>
              Project Collaboration
            </Text>
            <Icon name="ellipse-outline" size={20} color={colors.grey} />
          </View>
          <Text style={commonStyles.textSecondary}>
            Collaborate on coding projects and merit badge work
          </Text>
        </View>

        {/* Info Section */}
        <View style={{
          backgroundColor: colors.info + '20',
          padding: 16,
          borderRadius: 8,
          marginTop: 20,
        }}>
          <View style={[commonStyles.centerRow, { marginBottom: 8, justifyContent: 'flex-start' }]}>
            <Icon name="information-circle" size={20} color={colors.info} />
            <Text style={{
              color: colors.info,
              fontSize: 16,
              fontWeight: '600',
              marginLeft: 8,
            }}>
              Coming Soon
            </Text>
          </View>
          <Text style={[commonStyles.textSecondary, { lineHeight: 20 }]}>
            GitHub integration is currently in development. This feature will allow you to:
            {'\n'}• Connect your GitHub account securely
            {'\n'}• Sync profile information
            {'\n'}• Access repositories for troop projects
            {'\n'}• Collaborate on coding merit badges
            {'\n'}• Share project progress with your troop
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </View>
    </ScrollView>
  );
}
