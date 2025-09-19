
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import { supabase } from '../lib/supabase';
import { Newsletter } from '../lib/types';
import NewsletterDetailScreen from './NewsletterDetailScreen';

interface PreviousNewslettersScreenProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function PreviousNewslettersScreen({ isVisible, onClose }: PreviousNewslettersScreenProps) {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isVisible) {
      loadPreviousNewsletters();
    }
  }, [isVisible]);

  const loadPreviousNewsletters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Error loading previous newsletters:', error);
        return;
      }

      setNewsletters(data || []);
      console.log('Loaded previous newsletters:', data?.length || 0);
    } catch (error) {
      console.error('Unexpected error loading previous newsletters:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStyledPreview = (text: string, maxLines: number = 2) => {
    const lines = text.split('\n').filter(line => line.trim());
    const previewLines = lines.slice(0, maxLines);
    
    return previewLines.map((line, lineIndex) => {
      // Handle headings
      if (line.startsWith('# ')) {
        return (
          <Text key={lineIndex} style={[commonStyles.text, { 
            fontSize: 14, 
            fontWeight: 'bold', 
            marginBottom: 4,
            color: colors.primary 
          }]} numberOfLines={1}>
            {line.substring(2)}
          </Text>
        );
      }

      // Handle bullet points
      if (line.startsWith('• ')) {
        return (
          <View key={lineIndex} style={{ flexDirection: 'row', marginBottom: 2 }}>
            <Text style={[commonStyles.text, { marginRight: 6, color: colors.primary, fontSize: 12 }]}>•</Text>
            <Text style={[commonStyles.text, { flex: 1, fontSize: 12 }]} numberOfLines={1}>
              {renderInlineStylesPreview(line.substring(2))}
            </Text>
          </View>
        );
      }

      // Handle regular text with inline styles
      if (line.trim()) {
        return (
          <Text key={lineIndex} style={[commonStyles.text, { marginBottom: 4, lineHeight: 18, fontSize: 12 }]} numberOfLines={1}>
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

  const NewsletterCard = ({ newsletter }: { newsletter: Newsletter }) => (
    <TouchableOpacity
      style={[commonStyles.card, { 
        backgroundColor: colors.backgroundAlt, 
        borderLeftWidth: 3, 
        borderLeftColor: colors.primary,
        borderRadius: 8,
        marginBottom: 12,
      }]}
      onPress={() => setSelectedNewsletter(newsletter)}
      activeOpacity={0.7}
    >
      <View style={[commonStyles.row, { marginBottom: 8 }]}>
        <Icon name="mail" size={16} color={colors.primary} />
        <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 8, flex: 1, fontSize: 14 }]} numberOfLines={1}>
          {newsletter.title}
        </Text>
      </View>
      
      <View style={{ marginBottom: 8 }}>
        {renderStyledPreview(newsletter.content, 2)}
      </View>
      
      <View style={[commonStyles.row, { marginBottom: 6 }]}>
        <Text style={[commonStyles.textSecondary, { fontSize: 11 }]}>
          By {newsletter.author_name}
        </Text>
        <Text style={[commonStyles.textSecondary, { fontSize: 11 }]}>
          {newsletter.published_at ? formatDate(newsletter.published_at) : formatDate(newsletter.created_at)}
        </Text>
      </View>
      
      <View style={[commonStyles.row, { justifyContent: 'center', paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.border }]}>
        <Text style={[commonStyles.textSecondary, { fontSize: 10, fontWeight: '500' }]}>
          Tap to read full newsletter
        </Text>
        <Icon name="chevron-forward" size={12} color={colors.textSecondary} style={{ marginLeft: 4 }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={[commonStyles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[commonStyles.row, { 
          paddingHorizontal: 20, 
          paddingVertical: 16, 
          borderBottomWidth: 1, 
          borderBottomColor: colors.border 
        }]}>
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: colors.grey,
              padding: 8,
              borderRadius: 8,
            }}
          >
            <Icon name="close" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[commonStyles.title, { flex: 1, textAlign: 'center', marginRight: 36 }]}>
            Previous Newsletters
          </Text>
        </View>

        {/* Content */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={commonStyles.text}>Loading newsletters...</Text>
            </View>
          ) : newsletters.length === 0 ? (
            <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 40 }]}>
              <Icon name="mail" size={48} color={colors.textSecondary} />
              <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
                No newsletters found
              </Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 4 }]}>
                Check back later for new newsletters from your troop!
              </Text>
            </View>
          ) : (
            <>
              <Text style={[commonStyles.textSecondary, { marginBottom: 16, textAlign: 'center' }]}>
                {newsletters.length} newsletter{newsletters.length !== 1 ? 's' : ''} available
              </Text>
              {newsletters.map((newsletter) => (
                <NewsletterCard key={newsletter.id} newsletter={newsletter} />
              ))}
            </>
          )}
        </ScrollView>

        {/* Newsletter Detail Modal */}
        <NewsletterDetailScreen
          newsletter={selectedNewsletter}
          isVisible={!!selectedNewsletter}
          onClose={() => setSelectedNewsletter(null)}
        />
      </SafeAreaView>
    </Modal>
  );
}
