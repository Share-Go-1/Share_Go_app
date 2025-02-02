import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { supabase } from '../../config/supabaseClient';  // Import the Supabase client

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Send magic link to the email
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { redirectTo: 'https://wasytsylagnmqfachwth.supabase.co' },  // Custom deep link
      });

      if (error) throw error;

      // Notify the user that a magic link has been sent
      Alert.alert('Check your email for the magic link!');
      
      // Navigate to the RoleSelectionScreen after the magic link is sent
      navigation.navigate('RoleSelection');  // Navigate to RoleSelectionScreen
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
      />
      {error ? <Text>{error}</Text> : null}
      <Button 
        title={loading ? 'Sending...' : 'Send Magic Link'}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
};

export default LoginScreen;
