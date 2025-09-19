
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import SimpleBottomSheet from './BottomSheet';
import CreatePostScreen from './CreatePostScreen';
import NewsletterDetailScreen from './NewsletterDetailScreen';
import PreviousNewslettersScreen from './PreviousNewslettersScreen';
import { supabase } from '../lib/supabase';
import { Newsletter } from '../lib/types';

interface Post {
  id: string;
  author_id: string;
  author_name: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  isLiked?: boolean;
}

interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export default function SocialScreen() {
  const [latestNewsletter, setLatestNewsletter] = useState<Newsletter | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [showPreviousNewsletters, setShowPreviousNewsletters] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      await Promise.all([
        loadLatestNewsletter(),
        loadPosts(),
        loadComments()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading posts:', error);
        return;
      }

      setPosts(data || []);
      console.log('Loaded posts:', data?.length || 0);
    } catch (error) {
      console.error('Unexpected error loading posts:', error);
    }
  };

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading comments:', error);
        return;
      }

      setComments(data || []);
      console.log('Loaded comments:', data?.length || 0);
    } catch (error) {
      console.error('Unexpected error loading comments:', error);
    }
  };

  const handleDeletePost = (post: Post) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', post.id);

              if (error) {
                console.error('Error deleting post:', error);
                Alert.alert('Error', 'Failed to delete post');
                return;
              }

              console.log('Post deleted successfully');
              Alert.alert('Success', 'Post deleted successfully');
              await loadPosts();
            } catch (error) {
              console.error('Unexpected error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post');
            }
          }
        }
      ]
    );
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

  const handleLike = async (postId: string) => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to like posts');
      return;
    }

    try {
      // Check if user already liked this post
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', currentUser.id)
        .single();

      if (existingLike) {
        // Unlike the post
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUser.id);

        if (error) {
          console.error('Error unliking post:', error);
          return;
        }

        // Update likes count
        const { error: updateError } = await supabase
          .from('posts')
          .update({ likes_count: Math.max(0, posts.find(p => p.id === postId)?.likes_count - 1 || 0) })
          .eq('id', postId);

        if (updateError) {
          console.error('Error updating likes count:', updateError);
        }
      } else {
        // Like the post
        const { error } = await supabase
          .from('post_likes')
          .insert([{ post_id: postId, user_id: currentUser.id }]);

        if (error) {
          console.error('Error liking post:', error);
          return;
        }

        // Update likes count
        const { error: updateError } = await supabase
          .from('posts')
          .update({ likes_count: (posts.find(p => p.id === postId)?.likes_count || 0) + 1 })
          .eq('id', postId);

        if (updateError) {
          console.error('Error updating likes count:', updateError);
        }
      }

      await loadPosts();
      console.log('Toggled like for post:', postId);
    } catch (error) {
      console.error('Unexpected error toggling like:', error);
    }
  };

  const handleCreatePost = async (content: string) => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to create posts');
      return;
    }

    try {
      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', currentUser.id)
        .single();

      const { error } = await supabase
        .from('posts')
        .insert([{
          author_id: currentUser.id,
          author_name: profile?.name || 'Unknown User',
          content: content,
          likes_count: 0,
          comments_count: 0
        }]);

      if (error) {
        console.error('Error creating post:', error);
        Alert.alert('Error', 'Failed to create post');
        return;
      }

      console.log('Post created successfully');
      await loadPosts();
    } catch (error) {
      console.error('Unexpected error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost || !currentUser) return;

    try {
      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', currentUser.id)
        .single();

      const { error } = await supabase
        .from('comments')
        .insert([{
          post_id: selectedPost.id,
          author_id: currentUser.id,
          author_name: profile?.name || 'Unknown User',
          content: newComment.trim()
        }]);

      if (error) {
        console.error('Error adding comment:', error);
        Alert.alert('Error', 'Failed to add comment');
        return;
      }

      // Update comments count
      const { error: updateError } = await supabase
        .from('posts')
        .update({ comments_count: (selectedPost.comments_count || 0) + 1 })
        .eq('id', selectedPost.id);

      if (updateError) {
        console.error('Error updating comments count:', updateError);
      }

      setNewComment('');
      await loadComments();
      await loadPosts();
      console.log('Added comment to post:', selectedPost.id);
    } catch (error) {
      console.error('Unexpected error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  const PostCard = ({ post }: { post: Post }) => {
    const postComments = comments.filter(c => c.post_id === post.id);
    const canDelete = currentUser && currentUser.id === post.author_id;

    return (
      <View style={commonStyles.card}>
        <View style={[commonStyles.row, { marginBottom: 12 }]}>
          <View style={commonStyles.centerRow}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.grey,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
              <Icon name="person" size={20} color={colors.textSecondary} />
            </View>
            <View>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 2 }]}>
                {post.author_name}
              </Text>
              <Text style={commonStyles.textSecondary}>
                {formatDate(post.created_at)}
              </Text>
            </View>
          </View>
          {canDelete && (
            <TouchableOpacity
              onPress={() => handleDeletePost(post)}
              style={{
                backgroundColor: colors.error,
                padding: 6,
                borderRadius: 4,
              }}
            >
              <Icon name="trash" size={16} color={colors.backgroundAlt} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[commonStyles.text, { marginBottom: 12 }]}>
          {post.content}
        </Text>

        {post.image_url && (
          <Image
            source={{ uri: post.image_url }}
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
              {post.likes_count || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.centerRow, { marginLeft: 20 }]}
            onPress={() => setSelectedPost(post)}
          >
            <Icon name="chatbubble-outline" size={20} color={colors.textSecondary} />
            <Text style={[commonStyles.textSecondary, { marginLeft: 6 }]}>
              {post.comments_count || 0}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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
        <Text style={commonStyles.text}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={commonStyles.section}>
          {/* Latest Newsletter Section */}
          {latestNewsletter && (
            <>
              <View style={[commonStyles.row, { marginBottom: 16 }]}>
                <Text style={commonStyles.subtitle}>Latest Newsletter</Text>
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

              <LatestNewsletterCard newsletter={latestNewsletter} />
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

          {posts.length === 0 ? (
            <View style={[commonStyles.card, { alignItems: 'center', paddingVertical: 40 }]}>
              <Icon name="chatbubbles" size={48} color={colors.textSecondary} />
              <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
                No posts yet
              </Text>
              <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginTop: 4 }]}>
                Be the first to share something with your troop!
              </Text>
            </View>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
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

      {/* Previous Newsletters Modal */}
      <PreviousNewslettersScreen
        isVisible={showPreviousNewsletters}
        onClose={() => setShowPreviousNewsletters(false)}
      />

      {/* Comments Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={!!selectedPost}
        onClose={() => setSelectedPost(null)}
      >
        {selectedPost && (
          <View style={{ padding: 20, maxHeight: 600 }}>
            <Text style={[commonStyles.title, { marginBottom: 20 }]}>
              Comments
            </Text>

            <ScrollView style={{ maxHeight: 300, marginBottom: 20 }}>
              {comments.filter(c => c.post_id === selectedPost.id).length === 0 ? (
                <Text style={[commonStyles.textSecondary, { textAlign: 'center', paddingVertical: 20 }]}>
                  No comments yet. Be the first to comment!
                </Text>
              ) : (
                comments.filter(c => c.post_id === selectedPost.id).map((comment) => (
                  <View key={comment.id} style={[commonStyles.card, { marginBottom: 8 }]}>
                    <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
                      {comment.author_name}
                    </Text>
                    <Text style={commonStyles.text}>
                      {comment.content}
                    </Text>
                    <Text style={[commonStyles.textSecondary, { marginTop: 4 }]}>
                      {formatDate(comment.created_at)}
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
