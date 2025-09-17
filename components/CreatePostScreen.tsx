
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';

interface CreatePostScreenProps {
  isVisible: boolean;
  onClose: () => void;
  onCreatePost: (content: string) => void;
}

export default function CreatePostScreen({ isVisible, onClose, onCreatePost }: CreatePostScreenProps) {
  const [postContent, setPostContent] = useState('');

  const handlePost = () => {
    if (!postContent.trim()) {
      Alert.alert('Error', 'Please enter some content for your post.');
      return;
    }

    onCreatePost(postContent);
    setPostContent('');
    onClose();
    console.log('Created new post with content:', postContent);
  };

  const handleClose = () => {
    if (postContent.trim()) {
      Alert.alert(
        'Discard Post?',
        'You have unsaved changes. Are you sure you want to discard this post?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              setPostContent('');
              onClose();
            }
          }
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.background,
        }}>
          <TouchableOpacity
            onPress={handleClose}
            style={{
              padding: 8,
              borderRadius: 20,
              backgroundColor: colors.grey + '20',
            }}
          >
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text style={[commonStyles.title, { fontSize: 18, flex: 1, textAlign: 'center', marginHorizontal: 16 }]}>
            Create New Post
          </Text>

          <TouchableOpacity
            onPress={handlePost}
            style={{
              backgroundColor: postContent.trim() ? colors.primary : colors.grey,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20,
            }}
            disabled={!postContent.trim()}
          >
            <Text style={{
              color: postContent.trim() ? colors.backgroundAlt : colors.textSecondary,
              fontSize: 16,
              fontWeight: '600',
            }}>
              Post
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={{ flex: 1, padding: 20 }}>
          <TextInput
            style={{
              flex: 1,
              fontSize: 18,
              color: colors.text,
              textAlignVertical: 'top',
              padding: 0,
              margin: 0,
            }}
            placeholder="What's happening in your troop?"
            placeholderTextColor={colors.textSecondary}
            value={postContent}
            onChangeText={setPostContent}
            multiline
            autoFocus
            maxLength={500}
          />

          {/* Character count */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}>
            <Text style={[commonStyles.textSecondary, { fontSize: 14 }]}>
              {postContent.length}/500 characters
            </Text>

            {/* Future: Add photo/attachment buttons here */}
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity
                style={{
                  padding: 12,
                  borderRadius: 20,
                  backgroundColor: colors.grey + '20',
                }}
                onPress={() => {
                  // Future: Add photo functionality
                  console.log('Add photo pressed');
                }}
              >
                <Icon name="camera-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  padding: 12,
                  borderRadius: 20,
                  backgroundColor: colors.grey + '20',
                }}
                onPress={() => {
                  // Future: Add location functionality
                  console.log('Add location pressed');
                }}
              >
                <Icon name="location-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
