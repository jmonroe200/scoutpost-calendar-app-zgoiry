
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import SimpleBottomSheet from './BottomSheet';
import CreatePostScreen from './CreatePostScreen';
import NewsletterDetailScreen from './NewsletterDetailScreen';
import { supabase } from '../lib/supabase';
import { Newsletter } from '../lib/types';

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export default function SocialScreen() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [showNewsletters, setShowNewsletters] = useState(true);
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'Alex Thompson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      content: 'Just finished our winter camping trip! The scouts showed incredible resilience in the cold weather. Proud of everyone who participated! 🏕️❄️',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=300&fit=crop',
      timestamp: '2 hours ago',
      likes: 12,
      comments: [
        {
          id: '1',
          author: 'Sarah Miller',
          content: 'Amazing photos! The scouts look so happy despite the cold.',
          timestamp: '1 hour ago'
        }
      ],
      isLiked: false
    },
    {
      id: '2',
      author: 'Mike Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      content: 'Community service day was a huge success! We collected over 200 canned goods for the local food bank. Thank you to all the families who participated! 🥫❤️',
      timestamp: '5 hours ago',
      likes: 18,
      comments: [],
      isLiked: true
    },
    {
      id: '3',
      author: 'Emma Davis',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      content: 'Badge work session this Saturday! We&apos;ll be working on Cooking and First Aid badges. Don&apos;t forget to bring your handbooks! 📚',
      timestamp: '1 day ago',
      likes: 8,
      comments: [
        {
          id: '2',
          author: 'Tom Wilson',
          content: 'Can&apos;t wait! My son has been looking forward to the cooking badge.',
          timestamp: '12 hours ago'
        }
      ],
      isLiked: false
    }
  ]);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadPublishedNewsletters();
  }, []);

  const loadPublishedNewsletters = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3); // Show only the 3 most recent newsletters

      if (error) {
        console.error('Error loading newsletters:', error);
        return;
      }

      setNewsletters(data || []);
      console.log('Loaded published newsletters:', data?.length || 0);
    } catch (error) {
      console.error('Unexpected error loading newsletters:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
    console.log('Toggled like for post:', postId);
  };

  const handleCreatePost = (content: string) => {
    const post: Post = {
      id: Date.now().toString(),
      author: 'You',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
      content: content,
      timestamp: 'Just now',
      likes: 0,
      comments: [],
      isLiked: false
    };

    setPosts([post, ...posts]);
    console.log('Added new post:', post);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedPost) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'You',
      content: newComment,
      timestamp: 'Just now'
    };

    setPosts(posts.map(post => {
      if (post.id === selectedPost.id) {
        return {
          ...post,
          comments: [...post.comments, comment]
        };
      }
      return post;
    }));

    setNewComment('');
    console.log('Added comment to post:', selectedPost.id);
  };

  const PostCard = ({ post }: { post: Post }) => (
    <View style={commonStyles.card}>
      <View style={[commonStyles.row, { marginBottom: 12 }]}>
        <View style={commonStyles.centerRow}>
          <Image
            source={{ uri: post.avatar }}
            style={[commonStyles.avatar, { marginRight: 12 }]}
          />
          <View>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 2 }]}>
              {post.author}
            </Text>
            <Text style={commonStyles.textSecondary}>
              {post.timestamp}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[commonStyles.text, { marginBottom: 12 }]}>
        {post.content}
      </Text>

      {post.image && (
        <Image
          source={{ uri: post.image }}
          style={{
            width: '100%',
            height: 200,
            borderRadius: 8,
            marginBottom: 12,
          }}
          resizeMode="cover"
        />
      )}

      <View style={commonStyles.row}>
        <TouchableOpacity
          style={commonStyles.centerRow}
          onPress={() => handleLike(post.id)}
        >
          <Icon
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={post.isLiked ? colors.like : colors.textSecondary}
          />
          <Text style={[
            commonStyles.textSecondary,
            { marginLeft: 6, color: post.isLiked ? colors.like : colors.textSecondary }
          ]}>
            {post.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[commonStyles.centerRow, { marginLeft: 20 }]}
          onPress={() => setSelectedPost(post)}
        >
          <Icon name="chatbubble-outline" size={20} color={colors.textSecondary} />
          <Text style={[commonStyles.textSecondary, { marginLeft: 6 }]}>
            {post.comments.length}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const NewsletterCard = ({ newsletter }: { newsletter: Newsletter }) => (
    <TouchableOpacity
      style={[commonStyles.card, { backgroundColor: colors.backgroundAlt, borderLeftWidth: 4, borderLeftColor: colors.primary }]}
      onPress={() => setSelectedNewsletter(newsletter)}
      activeOpacity={0.7}
    >
      <View style={[commonStyles.row, { marginBottom: 8 }]}>
        <Icon name="mail" size={20} color={colors.primary} />
        <Text style={[commonStyles.text, { fontWeight: '600', marginLeft: 8, flex: 1 }]}>
          {newsletter.title}
        </Text>
        <View style={{
          backgroundColor: colors.success,
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 4,
        }}>
          <Text style={{
            color: colors.backgroundAlt,
            fontSize: 10,
            fontWeight: '600',
          }}>
            NEWSLETTER
          </Text>
        </View>
      </View>
      
      <Text style={[commonStyles.text, { marginBottom: 12, lineHeight: 20 }]} numberOfLines={3}>
        {newsletter.content}
      </Text>
      
      <View style={commonStyles.row}>
        <Text style={commonStyles.textSecondary}>
          By {newsletter.author_name}
        </Text>
        <Text style={commonStyles.textSecondary}>
          {newsletter.published_at ? formatDate(newsletter.published_at) : formatDate(newsletter.created_at)}
        </Text>
      </View>
      
      <View style={[commonStyles.row, { marginTop: 8, justifyContent: 'center' }]}>
        <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
          Tap to read full newsletter
        </Text>
        <Icon name="chevron-forward" size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={commonStyles.section}>
          {/* Newsletter Section */}
          {newsletters.length > 0 && (
            <>
              <View style={commonStyles.row}>
                <Text style={commonStyles.subtitle}>Latest Newsletters</Text>
                <TouchableOpacity
                  onPress={() => setShowNewsletters(!showNewsletters)}
                  style={{
                    backgroundColor: colors.info,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                  }}
                >
                  <Icon 
                    name={showNewsletters ? 'chevron-up' : 'chevron-down'} 
                    size={16} 
                    color={colors.backgroundAlt} 
                  />
                </TouchableOpacity>
              </View>

              {showNewsletters && newsletters.map((newsletter) => (
                <NewsletterCard key={newsletter.id} newsletter={newsletter} />
              ))}
            </>
          )}

          {/* Community Feed Section */}
          <View style={commonStyles.row}>
            <Text style={commonStyles.subtitle}>Community Feed</Text>
            <TouchableOpacity
              onPress={() => setShowCreatePost(true)}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: colors.backgroundAlt, fontSize: 14, fontWeight: '600' }}>
                New Post
              </Text>
            </TouchableOpacity>
          </View>

          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </View>
      </ScrollView>

      {/* Full-screen Create Post Modal */}
      <CreatePostScreen
        isVisible={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onCreatePost={handleCreatePost}
      />

      {/* Newsletter Detail Modal */}
      <NewsletterDetailScreen
        newsletter={selectedNewsletter}
        isVisible={!!selectedNewsletter}
        onClose={() => setSelectedNewsletter(null)}
      />

      {/* Comments Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={!!selectedPost}
        onClose={() => setSelectedPost(null)}
      >
        {selectedPost && (
          <View style={{ padding: 20, maxHeight: 600 }}>
            <Text style={[commonStyles.title, { textAlign: 'left', marginBottom: 20 }]}>
              Comments
            </Text>

            <ScrollView style={{ maxHeight: 300, marginBottom: 20 }}>
              {selectedPost.comments.length === 0 ? (
                <Text style={[commonStyles.textSecondary, { textAlign: 'center', paddingVertical: 20 }]}>
                  No comments yet. Be the first to comment!
                </Text>
              ) : (
                selectedPost.comments.map((comment) => (
                  <View key={comment.id} style={[commonStyles.card, { marginBottom: 8 }]}>
                    <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
                      {comment.author}
                    </Text>
                    <Text style={commonStyles.text}>
                      {comment.content}
                    </Text>
                    <Text style={[commonStyles.textSecondary, { marginTop: 4 }]}>
                      {comment.timestamp}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TextInput
                style={[commonStyles.input, { flex: 1 }]}
                placeholder="Add a comment..."
                value={newComment}
                onChangeText={setNewComment}
                placeholderTextColor={colors.textSecondary}
              />
              <TouchableOpacity
                style={[commonStyles.button, { paddingHorizontal: 16 }]}
                onPress={handleAddComment}
              >
                <Icon name="send" size={16} color={colors.backgroundAlt} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SimpleBottomSheet>
    </View>
  );
}
