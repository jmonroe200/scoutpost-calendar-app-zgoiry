
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import NewsletterDetailScreen from './NewsletterDetailScreen';
import PreviousNewslettersScreen from './PreviousNewslettersScreen';
import { supabase } from '../lib/supabase';
import { Newsletter } from '../lib/types';

export default function NewsletterSection() {
  const [latestNewsletter, setLatestNewsletter] = useState<Newsletter | null>(null);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [showPreviousNewsletters, setShowPreviousNewsletters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLatestNewsletter();
  }, []);

  const loadLatestNewsletter = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error loading latest newsletter:', error);
        return;
      }

      setLatestNewsletter(data && data.length > 0 ? data[0] : null);
      console.log('Loaded latest newsletter:', data && data.length > 0 ? data[0].title : 'None');
    } catch (error) {
      console.error('Unexpected error loading latest newsletter:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
    }
  };

  const renderStyledPreview = (text: string, maxLines: number = 3) => {
    const lines = text.split('\n').filter(line => line.trim());
    const previewLines = lines.slice(0, maxLines);
    
    return previewLines.map((line, lineIndex) => {
      // Handle headings
      if (line.startsWith('# ')) {
        return (
          <Text key={lineIndex} style={[commonStyles.text, { 
            fontSize: 16, 
            fontWeight: 'bold', 
            marginBottom: 6,
            color: colors.primary 
          }]} numberOfLines={1}>
            {line.substring(2)}
          </Text>
        );
      }

      // Handle bullet points
      if (line.startsWith('• ')) {
        return (
          <View key={lineIndex} style={{ flexDirection: 'row', marginBottom: 4 }}>
            <Text style={[commonStyles.text, { marginRight: 8, color: colors.primary }]}>•</Text>
            <Text style={[commonStyles.text, { flex: 1 }]} numberOfLines={1}>
              {renderInlineStylesPreview(line.substring(2))}
            </Text>
          </View>
        );
      }

      // Handle regular text with inline styles
      if (line.trim()) {
        return (
          <Text key={lineIndex} style={[commonStyles.text, { marginBottom: 6, lineHeight: 20 }]} numberOfLines={2}>
            {renderInlineStylesPreview(line)}
          </Text>
        );
      }
      return null;
    }).filter(Boolean);
  };

  const renderInlineStylesPreview = (text: string) => {
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
        <Text key={keyIndex++} style={{ fontWeight: 'bold' }}>
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
        <Text key={keyIndex++} style={{ fontStyle: 'italic' }}>
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

  const LatestNewsletterCard = ({ newsletter }: { newsletter: Newsletter }) => (
    <TouchableOpacity
      style={[commonStyles.card, { 
        backgroundColor: colors.backgroundAlt, 
        borderLeftWidth: 4, 
        borderLeftColor: colors.primary,
        borderRadius: 12,
        marginBottom: 16,
      }]}
      onPress={() => setSelectedNewsletter(newsletter)}
      activeOpacity={0.7}
    >
      <View style={[commonStyles.row, { marginBottom: 12 }]}>
        <Icon name="mail" size={20} color={colors.primary} />
        <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 8, flex: 1 }]}>
          {newsletter.title}
        </Text>
        <View style={{
          backgroundColor: colors.success,
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 6,
        }}>
          <Text style={{
            color: colors.backgroundAlt,
            fontSize: 10,
            fontWeight: '600',
          }}>
            LATEST
          </Text>
        </View>
      </View>
      
      <View style={{ marginBottom: 12 }}>
        {renderStyledPreview(newsletter.content, 4)}
      </View>
      
      <View style={[commonStyles.row, { marginBottom: 8 }]}>
        <Text style={commonStyles.textSecondary}>
          By {newsletter.author_name}
        </Text>
        <Text style={commonStyles.textSecondary}>
          {newsletter.published_at ? formatDate(newsletter.published_at) : formatDate(newsletter.created_at)}
        </Text>
      </View>
      
      <View style={[commonStyles.row, { justifyContent: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }]}>
        <Text style={[commonStyles.textSecondary, { fontSize: 12, fontWeight: '500' }]}>
          Tap to read full newsletter
        </Text>
        <Icon name="chevron-forward" size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={commonStyles.text}>Loading newsletter...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Newsletter Header */}
      <View style={[commonStyles.row, { marginBottom: 16 }]}>
        <Text style={[commonStyles.title, { textAlign: 'center', flex: 1 }]}>Newsletter</Text>
        <TouchableOpacity
          onPress={() => setShowPreviousNewsletters(true)}
          style={{
            backgroundColor: colors.info,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Icon name="library" size={14} color={colors.backgroundAlt} />
          <Text style={{ 
            color: colors.backgroundAlt, 
            fontSize: 12, 
            fontWeight: '600',
            marginLeft: 4,
          }}>
            View Previous
          </Text>
        </TouchableOpacity>
      </View>

      {/* Newsletter Content */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {latestNewsletter ? (
          <LatestNewsletterCard newsletter={latestNewsletter} />
        ) : (
          <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 40 }]}>
            <Icon name="mail-outline" size={48} color={colors.textSecondary} />
            <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
              No newsletters yet
            </Text>
            <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 4 }]}>
              Check back later for the latest troop updates!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Newsletter Detail Modal */}
      <NewsletterDetailScreen
        newsletter={selectedNewsletter}
        isVisible={!!selectedNewsletter}
        onClose={() => setSelectedNewsletter(null)}
      />

      {/* Previous Newsletters Modal */}
      <PreviousNewslettersScreen
        isVisible={showPreviousNewsletters}
        onClose={() => setShowPreviousNewsletters(false)}
      />
    </View>
  );
}
