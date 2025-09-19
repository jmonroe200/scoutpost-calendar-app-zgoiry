
import Icon from './Icon';
import { supabase } from '../lib/supabase';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Newsletter } from '../lib/types';
import React, { useState, useEffect } from 'react';
import NewsletterDetailScreen from './NewsletterDetailScreen';
import { commonStyles, colors } from '../styles/commonStyles';

export default function NewsletterSection() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);

  useEffect(() => {
    loadNewsletters();
  }, []);

  const loadNewsletters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Error loading newsletters:', error);
        return;
      }

      setNewsletters(data || []);
      console.log('Loaded newsletters:', data?.length || 0);
    } catch (error) {
      console.error('Error loading newsletters:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStyledPreview = (text: string, maxLines: number = 3) => {
    if (!text) return null;
    
    const lines = text.split('\n').filter(line => line.trim());
    const previewLines = lines.slice(0, maxLines);
    
    return previewLines.map((line, lineIndex) => {
      // Handle headings
      if (line.startsWith('# ')) {
        return (
          <Text key={lineIndex} style={[commonStyles.text, { 
            fontSize: 16, 
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
          <View key={lineIndex} style={{ flexDirection: 'row', marginBottom: 4 }}>
            <Text style={[commonStyles.text, { marginRight: 6, color: colors.primary }]}>•</Text>
            <Text style={[commonStyles.text, { flex: 1, color: colors.textSecondary }]} numberOfLines={1}>
              {renderInlineStylesPreview(line.substring(2))}
            </Text>
          </View>
        );
      }

      // Handle regular text with inline styles
      if (line.trim()) {
        return (
          <Text key={lineIndex} style={[commonStyles.text, { marginBottom: 4, color: colors.textSecondary }]} numberOfLines={1}>
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

  const NewsletterPreviewCard = ({ newsletter, isLatest }: { newsletter: Newsletter; isLatest?: boolean }) => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.backgroundAlt,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: isLatest ? colors.primary : colors.border,
        borderLeftWidth: isLatest ? 4 : 1,
        borderLeftColor: isLatest ? colors.primary : colors.border,
      }}
      onPress={() => setSelectedNewsletter(newsletter)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Icon name="mail" size={20} color={colors.primary} />
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={[commonStyles.text, { 
            fontWeight: '600',
            color: colors.text,
            fontSize: 16
          }]} numberOfLines={2}>
            {newsletter.title}
          </Text>
          {isLatest && (
            <View style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 4,
              alignSelf: 'flex-start',
              marginTop: 4,
            }}>
              <Text style={{
                color: colors.backgroundAlt,
                fontSize: 10,
                fontWeight: '600',
              }}>
                LATEST
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Author and Date */}
      <Text style={[commonStyles.textSmall, { 
        color: colors.textSecondary, 
        marginBottom: 12 
      }]}>
        By {newsletter.author_name} • {formatDate(newsletter.published_at || newsletter.created_at)}
      </Text>
      
      {/* Content Preview */}
      <View style={{ marginBottom: 16 }}>
        {renderStyledPreview(newsletter.content, 3)}
        {newsletter.content.split('\n').filter(line => line.trim()).length > 3 && (
          <Text style={[commonStyles.textSmall, { 
            color: colors.textSecondary,
            fontStyle: 'italic',
            marginTop: 4
          }]}>
            ...
          </Text>
        )}
      </View>
      
      {/* Read More Button */}
      <View style={{
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={[commonStyles.text, { 
          color: colors.backgroundAlt, 
          fontWeight: '600',
          marginRight: 8
        }]}>
          Read More
        </Text>
        <Icon name="chevron-forward" size={16} color={colors.backgroundAlt} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[commonStyles.container, { paddingTop: 0 }]}>
      <ScrollView 
        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={[commonStyles.text, { color: colors.textSecondary }]}>
              Loading newsletters...
            </Text>
          </View>
        ) : newsletters.length > 0 ? (
          <>
            <View style={{ marginBottom: 20 }}>
              <Text style={[commonStyles.text, { 
                fontWeight: '600', 
                marginBottom: 16,
                color: colors.text,
                fontSize: 18
              }]}>
                All Newsletters
              </Text>
              <Text style={[commonStyles.textSecondary, { 
                marginBottom: 20,
                textAlign: 'center'
              }]}>
                {newsletters.length} newsletter{newsletters.length !== 1 ? 's' : ''} available
              </Text>
              
              {newsletters.map((newsletter, index) => (
                <NewsletterPreviewCard 
                  key={newsletter.id} 
                  newsletter={newsletter} 
                  isLatest={index === 0}
                />
              ))}
            </View>
          </>
        ) : (
          <View style={{ 
            alignItems: 'center', 
            paddingVertical: 60,
            backgroundColor: colors.backgroundAlt,
            borderRadius: 12,
            marginTop: 20,
          }}>
            <Icon name="mail-outline" size={48} color={colors.textSecondary} />
            <Text style={[commonStyles.textLarge, { 
              marginTop: 16,
              marginBottom: 8,
              fontWeight: '600',
              color: colors.text
            }]}>
              No Newsletters Yet
            </Text>
            <Text style={[commonStyles.text, { 
              color: colors.textSecondary,
              textAlign: 'center',
              paddingHorizontal: 20
            }]}>
              Check back soon for the latest updates and announcements from your troop.
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
    </View>
  );
}
