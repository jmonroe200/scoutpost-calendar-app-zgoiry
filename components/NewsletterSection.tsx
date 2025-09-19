
import Icon from './Icon';
import { supabase } from '../lib/supabase';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Newsletter } from '../lib/types';
import React, { useState, useEffect } from 'react';
import PreviousNewslettersScreen from './PreviousNewslettersScreen';
import NewsletterDetailScreen from './NewsletterDetailScreen';
import { commonStyles, colors } from '../styles/commonStyles';

export default function NewsletterSection() {
  const [latestNewsletter, setLatestNewsletter] = useState<Newsletter | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPrevious, setShowPrevious] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);

  useEffect(() => {
    loadLatestNewsletter();
  }, []);

  const loadLatestNewsletter = async () => {
    try {
      setLoading(true);
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

      setLatestNewsletter(data?.[0] || null);
    } catch (error) {
      console.error('Error loading latest newsletter:', error);
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
    
    // Remove style markers for preview
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1');
    
    const lines = cleanText.split('\n').slice(0, maxLines);
    const previewText = lines.join('\n');
    
    return renderInlineStylesPreview(previewText);
  };

  const renderInlineStylesPreview = (text: string) => {
    const parts = [];
    let currentIndex = 0;
    
    // Bold (**text**)
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > currentIndex) {
        parts.push(
          <Text key={`text-${currentIndex}`} style={{ color: colors.textSecondary }}>
            {text.slice(currentIndex, match.index)}
          </Text>
        );
      }
      parts.push(
        <Text key={`bold-${match.index}`} style={{ fontWeight: 'bold', color: colors.text }}>
          {match[1]}
        </Text>
      );
      currentIndex = match.index + match[0].length;
    }
    
    if (currentIndex < text.length) {
      parts.push(
        <Text key={`text-${currentIndex}`} style={{ color: colors.textSecondary }}>
          {text.slice(currentIndex)}
        </Text>
      );
    }
    
    return <Text>{parts}</Text>;
  };

  const LatestNewsletterCard = ({ newsletter }: { newsletter: Newsletter }) => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.backgroundAlt,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
      }}
      onPress={() => setSelectedNewsletter(newsletter)}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Icon name="mail" size={20} color={colors.primary} />
        <Text style={[commonStyles.textMedium, { 
          marginLeft: 8, 
          fontWeight: '600',
          color: colors.text,
          flex: 1
        }]}>
          {newsletter.title}
        </Text>
      </View>
      
      <Text style={[commonStyles.textSmall, { 
        color: colors.textSecondary, 
        marginBottom: 12 
      }]}>
        By {newsletter.author_name} • {formatDate(newsletter.published_at || newsletter.created_at)}
      </Text>
      
      <View style={{ marginBottom: 12 }}>
        {renderStyledPreview(newsletter.content, 3)}
      </View>
      
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[commonStyles.textSmall, { 
          color: colors.primary, 
          fontWeight: '600' 
        }]}>
          Read Full Newsletter
        </Text>
        <Icon name="chevron-forward" size={16} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[commonStyles.container, { paddingTop: 0 }]}>
      {/* Header with centered title */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={[commonStyles.title, { textAlign: 'center', marginBottom: 16 }]}>
          Newsletter
        </Text>
      </View>

      <ScrollView 
        style={{ flex: 1, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={[commonStyles.text, { color: colors.textSecondary }]}>
              Loading newsletter...
            </Text>
          </View>
        ) : latestNewsletter ? (
          <>
            <View style={{ marginBottom: 20 }}>
              <Text style={[commonStyles.textMedium, { 
                fontWeight: '600', 
                marginBottom: 8,
                color: colors.text
              }]}>
                Latest Newsletter
              </Text>
              <LatestNewsletterCard newsletter={latestNewsletter} />
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
              onPress={() => setShowPrevious(true)}
              activeOpacity={0.8}
            >
              <Icon name="library" size={20} color={colors.backgroundAlt} />
              <Text style={[commonStyles.textMedium, { 
                marginLeft: 8,
                color: colors.backgroundAlt,
                fontWeight: '600'
              }]}>
                View Previous Newsletters
              </Text>
            </TouchableOpacity>
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

      {/* Previous Newsletters Modal */}
      <PreviousNewslettersScreen
        isVisible={showPrevious}
        onClose={() => setShowPrevious(false)}
      />

      {/* Newsletter Detail Modal */}
      <NewsletterDetailScreen
        newsletter={selectedNewsletter}
        isVisible={!!selectedNewsletter}
        onClose={() => setSelectedNewsletter(null)}
      />
    </View>
  );
}
