
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

  const renderStyledContent = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Skip empty lines
      if (!line.trim()) {
        return <View key={lineIndex} style={{ height: 16 }} />;
      }

      // Handle headings - Made larger
      if (line.startsWith('# ')) {
        return (
          <Text key={lineIndex} style={[commonStyles.text, { 
            fontSize: 28, 
            fontWeight: 'bold', 
            marginBottom: 20,
            marginTop: lineIndex > 0 ? 12 : 0,
            color: colors.primary 
          }]}>
            {line.substring(2)}
          </Text>
        );
      }

      // Handle bullet points - Made larger
      if (line.startsWith('• ')) {
        return (
          <View key={lineIndex} style={{ flexDirection: 'row', marginBottom: 16 }}>
            <Text style={[commonStyles.text, { marginRight: 16, color: colors.primary, fontSize: 20 }]}>•</Text>
            <Text style={[commonStyles.text, { flex: 1, lineHeight: 28, fontSize: 18 }]}>
              {renderInlineStyles(line.substring(2))}
            </Text>
          </View>
        );
      }

      // Handle regular paragraphs with inline styles - Made larger
      return (
        <Text key={lineIndex} style={[commonStyles.text, { 
          marginBottom: 20,
          lineHeight: 28,
          fontSize: 18
        }]}>
          {renderInlineStyles(line)}
        </Text>
      );
    });
  };

  const renderInlineStyles = (text: string) => {
    const elements: React.ReactNode[] = [];
    let remainingText = text;
    let keyIndex = 0;

    // Process bold text (**text**)
    while (remainingText.includes('**')) {
      const startIndex = remainingText.indexOf('**');
      const endIndex = remainingText.indexOf('**', startIndex + 2);
      
      if (endIndex === -1) break;

      // Add text before bold
      if (startIndex > 0) {
        elements.push(remainingText.substring(0, startIndex));
      }

      // Add bold text
      const boldText = remainingText.substring(startIndex + 2, endIndex);
      elements.push(
        <Text key={keyIndex++} style={{ fontWeight: 'bold', color: colors.text }}>
          {boldText}
        </Text>
      );

      remainingText = remainingText.substring(endIndex + 2);
    }

    // Process italic text (*text*) on remaining text
    let processedText = remainingText;
    remainingText = '';
    let tempElements: React.ReactNode[] = [];

    while (processedText.includes('*')) {
      const startIndex = processedText.indexOf('*');
      const endIndex = processedText.indexOf('*', startIndex + 1);
      
      if (endIndex === -1) break;

      // Add text before italic
      if (startIndex > 0) {
        tempElements.push(processedText.substring(0, startIndex));
      }

      // Add italic text
      const italicText = processedText.substring(startIndex + 1, endIndex);
      tempElements.push(
        <Text key={keyIndex++} style={{ fontStyle: 'italic', color: colors.text }}>
          {italicText}
        </Text>
      );

      processedText = processedText.substring(endIndex + 1);
    }

    // Add remaining text
    if (processedText) {
      tempElements.push(processedText);
    }

    elements.push(...tempElements);

    // If no styling was applied, return the original text
    if (elements.length === 0) {
      return remainingText || text;
    }

    return elements;
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
              <Text style={[
                commonStyles.textSecondary,
                { fontSize: 12, fontWeight: '600' }
              ]}>
                NEWSLETTER
              </Text>
            </View>
            <Text style={[commonStyles.text, { fontSize: 16, fontWeight: '600' }]} numberOfLines={1}>
              {newsletter.title}
            </Text>
          </View>
        </View>

        {/* Content - Removed margins and made text larger */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 20 }}>
          {/* Newsletter Header */}
          <View style={{
            backgroundColor: colors.backgroundAlt,
            borderLeftWidth: 4,
            borderLeftColor: colors.primary,
            marginBottom: 24,
            paddingHorizontal: 20,
            paddingVertical: 20,
          }}>
            <Text style={[commonStyles.title, { textAlign: 'left', marginBottom: 16, fontSize: 24 }]}>
              {newsletter.title}
            </Text>
            
            <View style={[commonStyles.row, { marginBottom: 12 }]}>
              <Icon name="person" size={18} color={colors.textSecondary} />
              <Text style={[commonStyles.textSecondary, { marginLeft: 8, fontSize: 16 }]}>
                By {newsletter.author_name}
              </Text>
            </View>
            
            <View style={commonStyles.row}>
              <Icon name="calendar" size={18} color={colors.textSecondary} />
              <Text style={[commonStyles.textSecondary, { marginLeft: 8, fontSize: 16 }]}>
                {newsletter.published_at 
                  ? formatDate(newsletter.published_at) 
                  : formatDate(newsletter.created_at)
                }
              </Text>
            </View>
          </View>

          {/* Newsletter Content with Styling - Removed margins */}
          <View style={{ paddingHorizontal: 20 }}>
            {renderStyledContent(newsletter.content)}
          </View>

          {/* Footer */}
          <View style={{
            backgroundColor: colors.backgroundAlt,
            marginTop: 32,
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 20,
          }}>
            <Icon name="mail-outline" size={28} color={colors.primary} style={{ marginBottom: 12 }} />
            <Text style={[commonStyles.textSecondary, { textAlign: 'center', fontSize: 14 }]}>
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
