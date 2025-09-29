
import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, TextInput, Alert, Image, ImageBackground } from 'react-native';
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('User already logged in, redirecting to main');
        router.replace('/main');
      }
    };
    checkSession();
  }, []);

  const signUpWithEmail = async () => {
    if (!email || !password || !name || !troop || !role) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    console.log('Attempting signup with:', { email, name, troop, role });

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            name: name,
            troop: troop,
            role: role,
          },
        },
      });

      if (error) {
        console.error('Signup error:', error);
        Alert.alert('Signup Error', error.message);
        return;
      }

      if (data.user) {
        console.log('Signup successful:', data.user);
        
        // Create profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: data.user.id,
              name: name,
              email: email,
              troop: troop,
              role: role,
            },
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
        } else {
          console.log('Profile created successfully');
        }

        Alert.alert(
          'Check your email',
          'We sent you a confirmation link. Please check your email and click the link to verify your account.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    console.log('Attempting signin with:', { email });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Signin error:', error);
        Alert.alert('Sign In Error', error.message);
        return;
      }

      if (data.user) {
        console.log('Signin successful:', data.user);
        router.replace('/main');
      }
    } catch (error) {
      console.error('Unexpected error during signin:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = () => {
    if (isLogin) {
      signInWithEmail();
    } else {
      signUpWithEmail();
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/images/ac7e15fa-5ebf-43dd-8720-13b81d54169e.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* Dark overlay for better text readability */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
      }} />
      
      <SafeAreaView style={[commonStyles.container, { backgroundColor: 'transparent' }]}>
        <View style={[commonStyles.content, { backgroundColor: 'transparent' }]}>
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View style={{
              width: 80,
              height: 80,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 40,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}>
              <Image 
                source={require('../assets/images/f0132970-09ee-4263-8f68-99f3ca068743.png')}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </View>
            <Text style={[commonStyles.title, { 
              fontSize: 32, 
              color: '#FFFFFF',
              fontFamily: 'Sansita_700Bold',
              textShadowColor: 'rgba(0, 0, 0, 0.75)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 3,
            }]}>
              Scoutpost
            </Text>
            <Text style={[commonStyles.textSecondary, { 
              textAlign: 'center',
              color: '#FFFFFF',
              textShadowColor: 'rgba(0, 0, 0, 0.75)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
            }]}>
              Your scouting calendar and community
            </Text>
          </View>

          <View style={commonStyles.section}>
            <View style={[commonStyles.card, {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }]}>
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
                  editable={!loading}
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
                editable={!loading}
              />

              <TextInput
                style={[commonStyles.input, { marginBottom: !isLogin ? 16 : 24 }]}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={colors.textSecondary}
                editable={!loading}
              />

              {!isLogin && (
                <>
                  <TextInput
                    style={[commonStyles.input, { marginBottom: 16 }]}
                    placeholder="Troop (e.g., Troop 123)"
                    value={troop}
                    onChangeText={setTroop}
                    placeholderTextColor={colors.textSecondary}
                    editable={!loading}
                  />

                  <TextInput
                    style={[commonStyles.input, { marginBottom: 24 }]}
                    placeholder="Role (e.g., Scout, Scoutmaster, Assistant)"
                    value={role}
                    onChangeText={setRole}
                    placeholderTextColor={colors.textSecondary}
                    editable={!loading}
                  />
                </>
              )}

              <TouchableOpacity
                style={[commonStyles.button, loading && { opacity: 0.6 }]}
                onPress={handleAuth}
                disabled={loading}
              >
                <Text style={commonStyles.buttonText}>
                  {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginTop: 16, alignItems: 'center' }}
                onPress={() => setIsLogin(!isLogin)}
                disabled={loading}
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
    </ImageBackground>
  );
}
