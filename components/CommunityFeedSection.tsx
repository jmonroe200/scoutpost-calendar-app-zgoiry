
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import SimpleBottomSheet from './BottomSheet';
import CreatePostScreen from './CreatePostScreen';
import { supabase } from '../lib/supabase';

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

export default function CommunityFeedSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
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
        loadPosts(),
        loadComments()
      ]);
    } catch (error) {
      console.error('Error loading community feed data:', error);
    } finally {
      setLoading(false);
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

  const isNewPost = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    return diffInHours < 24; // Consider posts within 24 hours as "new"
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
    const isNew = isNewPost(post.created_at);

    // Style for new posts: white background and larger text
    const cardStyle = isNew ? {
      ...commonStyles.card,
      backgroundColor: '#FFFFFF',
      borderWidth: 2,
      borderColor: colors.primary,
      boxShadow: '0px 4px 12px rgba(46, 125, 50, 0.15)',
      elevation: 5,
    } : commonStyles.card;

    const contentTextStyle = isNew ? {
      fontSize: 20,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 12,
      lineHeight: 28,
    } : [commonStyles.text, { marginBottom: 12 }];

    return (
      <View style={cardStyle}>
        {isNew && (
          <View style={{
            position: 'absolute',
            top: -1,
            right: 12,
            backgroundColor: colors.primary,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            zIndex: 1,
          }}>
            <Text style={{
              color: colors.backgroundAlt,
              fontSize: 12,
              fontWeight: '600',
            }}>
              NEW
            </Text>
          </View>
        )}

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

        <Text style={contentTextStyle}>
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

  if (loading) {
    return (
      <View style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={commonStyles.text}>Loading community feed...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Centered Round New Post Button with Adobe Asset */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <TouchableOpacity
          onPress={() => setShowCreatePost(true)}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0px 4px 12px rgba(46, 125, 50, 0.3)',
            elevation: 6,
          }}
        >
          <Image
            source={{ uri: 'https://assets.adobe.com/id/urn:aaid:sc:US:5211f370-3b76-4574-8bdc-9899e22dd324?view=published' }}
            style={{
              width: 32,
              height: 32,
              tintColor: colors.backgroundAlt,
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Posts List */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
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
      </ScrollView>

      {/* Full-screen Create Post Modal */}
      <CreatePostScreen
        isVisible={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onCreatePost={handleCreatePost}
      />

      {/* Comments Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={!!selectedPost}
        onClose={() => setSelectedPost(null)}
      >
        {selectedPost && (
          <View style={{ padding: 20, maxHeight: 600 }}>
            <Text style={[commonStyles.title, { marginBottom: 20, textAlign: 'center' }]}>
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
