
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import { Newsletter } from '../lib/types';

interface NewsletterDetailScreenProps {
  newsletter: Newsletter | null;
  isVisible: boolean;
  onClose: () => void;
}

export default function NewsletterDetailScreen({ newsletter, isVisible, onClose }: NewsletterDetailScreenProps) {
  if (!newsletter) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatContent = (content: string) => {
    // Split content by double line breaks to create paragraphs
    return content.split('\n\n').filter(paragraph => paragraph.trim().length > 0);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View style={[
          commonStyles.row,
          {
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          }
        ]}>
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: colors.backgroundAlt,
              padding: 8,
              borderRadius: 8,
              marginRight: 16,
            }}
          >
            <Icon name="close" size={20} color={colors.text} />
          </TouchableOpacity>
          
          <View style={{ flex: 1 }}>
            <View style={[commonStyles.row, { marginBottom: 4 }]}>
              <Icon name="mail" size={16} color={colors.primary} />
              <Text style={[
                commonStyles.textSecondary,
                { marginLeft: 6, fontSize: 12, fontWeight: '600' }
              ]}>
                NEWSLETTER
              </Text>
            </View>
            <Text style={[commonStyles.text, { fontSize: 16, fontWeight: '600' }]} numberOfLines={1}>
              {newsletter.title}
            </Text>
          </View>
        </View>

        {/* Content */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          {/* Newsletter Header */}
          <View style={[
            commonStyles.card,
            {
              backgroundColor: colors.backgroundAlt,
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
              marginBottom: 24,
            }
          ]}>
            <Text style={[commonStyles.title, { textAlign: 'left', marginBottom: 12 }]}>
              {newsletter.title}
            </Text>
            
            <View style={[commonStyles.row, { marginBottom: 8 }]}>
              <Icon name="person" size={16} color={colors.textSecondary} />
              <Text style={[commonStyles.textSecondary, { marginLeft: 6 }]}>
                By {newsletter.author_name}
              </Text>
            </View>
            
            <View style={commonStyles.row}>
              <Icon name="calendar" size={16} color={colors.textSecondary} />
              <Text style={[commonStyles.textSecondary, { marginLeft: 6 }]}>
                {newsletter.published_at 
                  ? formatDate(newsletter.published_at) 
                  : formatDate(newsletter.created_at)
                }
              </Text>
            </View>
          </View>

          {/* Newsletter Content */}
          <View style={commonStyles.card}>
            {formatContent(newsletter.content).map((paragraph, index) => (
              <Text
                key={index}
                style={[
                  commonStyles.text,
                  {
                    lineHeight: 24,
                    marginBottom: index < formatContent(newsletter.content).length - 1 ? 16 : 0,
                  }
                ]}
              >
                {paragraph.trim()}
              </Text>
            ))}
          </View>

          {/* Footer */}
          <View style={[
            commonStyles.card,
            {
              backgroundColor: colors.backgroundAlt,
              marginTop: 24,
              alignItems: 'center',
            }
          ]}>
            <Icon name="mail-outline" size={24} color={colors.primary} style={{ marginBottom: 8 }} />
            <Text style={[commonStyles.textSecondary, { textAlign: 'center', fontSize: 12 }]}>
              This newsletter was published on{' '}
              {newsletter.published_at 
                ? new Date(newsletter.published_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })
                : new Date(newsletter.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })
              }
            </Text>
          </View>

          {/* Bottom padding for safe scrolling */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
