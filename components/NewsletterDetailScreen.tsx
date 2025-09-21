
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import { Newsletter } from '../lib/types';
import * as Linking from 'expo-linking';

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

  const handleLinkPress = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        console.log('Opened URL:', url);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('Error', 'Failed to open link');
    }
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
            {renderInlineStyles(line.substring(2))}
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

    // Process links first [display text](url)
    while (remainingText.includes('[') && remainingText.includes('](') && remainingText.includes(')')) {
      const linkStartIndex = remainingText.indexOf('[');
      const linkMiddleIndex = remainingText.indexOf('](', linkStartIndex);
      const linkEndIndex = remainingText.indexOf(')', linkMiddleIndex);
      
      if (linkStartIndex === -1 || linkMiddleIndex === -1 || linkEndIndex === -1 || 
          linkMiddleIndex <= linkStartIndex || linkEndIndex <= linkMiddleIndex) {
        break;
      }

      // Add text before link
      if (linkStartIndex > 0) {
        const beforeLinkText = remainingText.substring(0, linkStartIndex);
        elements.push(processTextForOtherStyles(beforeLinkText, keyIndex));
        keyIndex += 100; // Increment to avoid key conflicts
      }

      // Extract link parts
      const displayText = remainingText.substring(linkStartIndex + 1, linkMiddleIndex);
      const url = remainingText.substring(linkMiddleIndex + 2, linkEndIndex);

      // Add clickable link
      elements.push(
        <TouchableOpacity 
          key={keyIndex++} 
          onPress={() => handleLinkPress(url)}
          style={{ display: 'contents' }}
        >
          <Text style={{ 
            color: colors.info, 
            textDecorationLine: 'underline',
            fontWeight: '500'
          }}>
            {displayText}
          </Text>
        </TouchableOpacity>
      );

      remainingText = remainingText.substring(linkEndIndex + 1);
    }

    // Process remaining text for other styles
    if (remainingText) {
      elements.push(processTextForOtherStyles(remainingText, keyIndex));
    }

    return elements.length > 0 ? elements : text;
  };

  const processTextForOtherStyles = (text: string, startKeyIndex: number) => {
    const elements: React.ReactNode[] = [];
    let remainingText = text;
    let keyIndex = startKeyIndex;

    // First, detect and process URLs (auto-linking)
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
    let lastIndex = 0;
    let match;

    while ((match = urlRegex.exec(remainingText)) !== null) {
      const url = match[0];
      const startIndex = match.index;

      // Add text before URL
      if (startIndex > lastIndex) {
        const beforeUrlText = remainingText.substring(lastIndex, startIndex);
        elements.push(processStylesWithoutUrls(beforeUrlText, keyIndex));
        keyIndex += 100;
      }

      // Add clickable URL
      elements.push(
        <TouchableOpacity 
          key={keyIndex++} 
          onPress={() => handleLinkPress(url)}
          style={{ display: 'contents' }}
        >
          <Text style={{ 
            color: colors.info, 
            textDecorationLine: 'underline',
            fontWeight: '500'
          }}>
            {url}
          </Text>
        </TouchableOpacity>
      );

      lastIndex = startIndex + url.length;
    }

    // Add remaining text after last URL
    if (lastIndex < remainingText.length) {
      const afterUrlText = remainingText.substring(lastIndex);
      elements.push(processStylesWithoutUrls(afterUrlText, keyIndex));
    }

    // If no URLs were found, process the whole text for other styles
    if (elements.length === 0) {
      return processStylesWithoutUrls(remainingText, keyIndex);
    }

    return elements;
  };

  const processStylesWithoutUrls = (text: string, startKeyIndex: number) => {
    const elements: React.ReactNode[] = [];
    let remainingText = text;
    let keyIndex = startKeyIndex;

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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        {/* Header */}
        <View style={[
          commonStyles.row,
          {
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: '#FFFFFF',
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

        {/* Content - White background */}
        <ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }} contentContainerStyle={{ paddingVertical: 20 }}>
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
