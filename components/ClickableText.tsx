
import React from 'react';
import { Text, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../styles/commonStyles';
import * as Linking from 'expo-linking';

interface ClickableTextProps {
  children: string;
  style?: any;
  numberOfLines?: number;
}

export default function ClickableText({ children, style, numberOfLines }: ClickableTextProps) {
  const handleLinkPress = async (url: string) => {
    try {
      // Add https:// if no protocol is specified
      let formattedUrl = url;
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }

      const canOpen = await Linking.canOpenURL(formattedUrl);
      if (canOpen) {
        await Linking.openURL(formattedUrl);
        console.log('Opened URL:', formattedUrl);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const renderClickableText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let keyIndex = 0;

    while ((match = urlRegex.exec(text)) !== null) {
      const url = match[0];
      const startIndex = match.index;

      // Add text before URL
      if (startIndex > lastIndex) {
        parts.push(
          <Text key={keyIndex++} style={{ color: 'inherit' }}>
            {text.substring(lastIndex, startIndex)}
          </Text>
        );
      }

      // Add clickable URL
      parts.push(
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
    if (lastIndex < text.length) {
      parts.push(
        <Text key={keyIndex++} style={{ color: 'inherit' }}>
          {text.substring(lastIndex)}
        </Text>
      );
    }

    // If no URLs were found, return the original text
    return parts.length > 0 ? parts : text;
  };

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {renderClickableText(children)}
    </Text>
  );
}
