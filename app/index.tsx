
import React, { useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Icon from '../components/Icon';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleAuth = () => {
    console.log('Auth attempt:', { isLogin, email, name });
    
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Simple validation for demo
    if (email.includes('@') && password.length >= 6) {
      console.log('Authentication successful, navigating to main app');
      router.replace('/main');
    } else {
      Alert.alert('Error', 'Invalid email or password (min 6 characters)');
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.content}>
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={{
            width: 80,
            height: 80,
            backgroundColor: colors.primary,
            borderRadius: 40,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
            <Icon name="compass" size={40} color={colors.backgroundAlt} />
          </View>
          <Text style={[commonStyles.title, { fontSize: 32, color: colors.primary }]}>
            Scoutpost
          </Text>
          <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
            Your scouting calendar and community
          </Text>
        </View>

        <View style={commonStyles.section}>
          <View style={commonStyles.card}>
            <Text style={[commonStyles.subtitle, { textAlign: 'center', marginBottom: 20 }]}>
              {isLogin ? 'Welcome Back' : 'Join Scoutpost'}
            </Text>

            {!isLogin && (
              <TextInput
                style={[commonStyles.input, { marginBottom: 16 }]}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                placeholderTextColor={colors.textSecondary}
              />
            )}

            <TextInput
              style={[commonStyles.input, { marginBottom: 16 }]}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.textSecondary}
            />

            <TextInput
              style={[commonStyles.input, { marginBottom: 24 }]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={colors.textSecondary}
            />

            <TouchableOpacity
              style={commonStyles.button}
              onPress={handleAuth}
            >
              <Text style={commonStyles.buttonText}>
                {isLogin ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 16, alignItems: 'center' }}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={[commonStyles.textSecondary, { textAlign: 'center' }]}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Text style={{ color: colors.primary, fontWeight: '600' }}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
