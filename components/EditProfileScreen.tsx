
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import Icon from './Icon';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import SimpleBottomSheet from './BottomSheet';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  troop: string;
  role: string;
  phone: string;
}

interface EditProfileScreenProps {
  initialProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onCancel: () => void;
}

export default function EditProfileScreen({ initialProfile, onSave, onCancel }: EditProfileScreenProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    if (!profile.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    
    if (!profile.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    console.log('Saving profile:', profile);
    onSave(profile);
  };

  const pickImage = async (source: 'camera' | 'library') => {
    try {
      setIsLoading(true);
      let result;

      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission needed', 'Camera permission is required to take photos');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission needed', 'Photo library permission is required to select photos');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setProfile(prev => ({ ...prev, avatar: result.assets[0].uri }));
        console.log('Image selected:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    } finally {
      setIsLoading(false);
      setShowImagePicker(false);
    }
  };

  const ImagePickerOptions = () => (
    <View style={{ padding: 20 }}>
      <Text style={[commonStyles.subtitle, { textAlign: 'center', marginBottom: 20 }]}>
        Choose Photo Source
      </Text>
      
      <TouchableOpacity
        style={[commonStyles.card, commonStyles.row, { marginBottom: 12 }]}
        onPress={() => pickImage('camera')}
      >
        <View style={commonStyles.centerRow}>
          <Icon name="camera" size={24} color={colors.primary} />
          <Text style={[commonStyles.text, { marginLeft: 16 }]}>Take Photo</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[commonStyles.card, commonStyles.row, { marginBottom: 12 }]}
        onPress={() => pickImage('library')}
      >
        <View style={commonStyles.centerRow}>
          <Icon name="images" size={24} color={colors.primary} />
          <Text style={[commonStyles.text, { marginLeft: 16 }]}>Choose from Library</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[commonStyles.card, commonStyles.row]}
        onPress={() => setShowImagePicker(false)}
      >
        <View style={commonStyles.centerRow}>
          <Icon name="close" size={24} color={colors.textSecondary} />
          <Text style={[commonStyles.text, { marginLeft: 16, color: colors.textSecondary }]}>Cancel</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={commonStyles.container}>
      {/* Header */}
      <View style={[commonStyles.row, { padding: 20, paddingBottom: 10 }]}>
        <TouchableOpacity onPress={onCancel}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[commonStyles.subtitle, { flex: 1, textAlign: 'center', marginBottom: 0 }]}>
          Edit Profile
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          <Text style={[commonStyles.text, { color: colors.primary, fontWeight: '600' }]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={commonStyles.section}>
          {/* Profile Photo - Generic Avatar */}
          <View style={{ alignItems: 'center', marginBottom: 30 }}>
            <TouchableOpacity
              onPress={() => setShowImagePicker(true)}
              style={{ position: 'relative' }}
            >
              <View style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: '#E5E5E5',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon name="person" size={60} color="#9E9E9E" />
              </View>
              <View style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: colors.primary,
                borderRadius: 20,
                padding: 8,
                borderWidth: 3,
                borderColor: colors.backgroundAlt,
              }}>
                <Icon name="camera" size={20} color={colors.backgroundAlt} />
              </View>
            </TouchableOpacity>
            <Text style={[commonStyles.textSecondary, { marginTop: 8, textAlign: 'center' }]}>
              Tap to change photo
            </Text>
          </View>

          {/* Form Fields - Auto-filled Name and Email */}
          <View style={{ marginBottom: 20 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Name</Text>
            <TextInput
              style={commonStyles.input}
              value={profile.name}
              onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
              placeholder="Enter your name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Email</Text>
            <TextInput
              style={commonStyles.input}
              value={profile.email}
              onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Phone</Text>
            <TextInput
              style={commonStyles.input}
              value={profile.phone}
              onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
              placeholder="Enter your phone number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Troop</Text>
            <TextInput
              style={commonStyles.input}
              value={profile.troop}
              onChangeText={(text) => setProfile(prev => ({ ...prev, troop: text }))}
              placeholder="Enter your troop"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={{ marginBottom: 30 }}>
            <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>Role</Text>
            <TextInput
              style={commonStyles.input}
              value={profile.role}
              onChangeText={(text) => setProfile(prev => ({ ...prev, role: text }))}
              placeholder="Enter your role"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>
      </ScrollView>

      {/* Image Picker Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
      >
        <ImagePickerOptions />
      </SimpleBottomSheet>
    </View>
  );
}
