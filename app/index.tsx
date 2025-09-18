
import React, { useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Icon from '../components/Icon';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [troop, setTroop] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    console.log('Auth attempt:', { isLogin, email, name, troop, role });
    
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in email and password');
      return;
    }

    if (!isLogin && (!name || !troop || !role)) {
      Alert.alert('Error', 'Please fill in all fields for signup');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Login error:', error);
          Alert.alert('Login Error', error.message);
          return;
        }

        console.log('Login successful:', data);
        router.replace('/main');
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: 'https://natively.dev/email-confirmed'
          }
        });

        if (error) {
          console.error('Signup error:', error);
          Alert.alert('Signup Error', error.message);
          return;
        }

        if (data.user) {
          // Create profile with troop and role
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: data.user.id,
              name,
              email,
              troop,
              role,
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            Alert.alert('Profile Error', 'Account created but profile setup failed. Please complete your profile in settings.');
          } else {
            console.log('Profile created successfully');
          }

          Alert.alert(
            'Registration Successful!', 
            'Please check your email to verify your account before signing in.',
            [
              {
                text: 'OK',
                onPress: () => setIsLogin(true)
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
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
          <Text style={[commonStyles.title, { 
            fontSize: 32, 
            color: colors.primary,
            fontFamily: 'Sansita_700Bold'
          }]}>
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
                editable={!isLoading}
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
              editable={!isLoading}
            />

            <TextInput
              style={[commonStyles.input, { marginBottom: !isLogin ? 16 : 24 }]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={colors.textSecondary}
              editable={!isLoading}
            />

            {!isLogin && (
              <>
                <TextInput
                  style={[commonStyles.input, { marginBottom: 16 }]}
                  placeholder="Troop (e.g., Troop 123)"
                  value={troop}
                  onChangeText={setTroop}
                  placeholderTextColor={colors.textSecondary}
                  editable={!isLoading}
                />

                <TextInput
                  style={[commonStyles.input, { marginBottom: 24 }]}
                  placeholder="Role (e.g., Scout, Scoutmaster, Parent)"
                  value={role}
                  onChangeText={setRole}
                  placeholderTextColor={colors.textSecondary}
                  editable={!isLoading}
                />
              </>
            )}

            <TouchableOpacity
              style={[commonStyles.button, isLoading && { opacity: 0.6 }]}
              onPress={handleAuth}
              disabled={isLoading}
            >
              <Text style={commonStyles.buttonText}>
                {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginTop: 16, alignItems: 'center' }}
              onPress={() => setIsLogin(!isLogin)}
              disabled={isLoading}
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
