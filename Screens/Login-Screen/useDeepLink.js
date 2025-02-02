import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { supabase } from '../../config/supabaseClient';  // Import Supabase client
import { useNavigation } from '@react-navigation/native';

const useDeepLink = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const handleDeepLink = async (event) => {
      const url = event.url;
      // You may need to extract the token or email from the URL if necessary
      const { error, data } = await supabase.auth.signInWithOtp({
        email: extractedEmailFromUrl, // Extract email/token from deep link URL
        options: { redirectTo: url },
      });

      if (error) {
        console.error("Login failed:", error.message);
        return;
      }

      // If successfully signed in, navigate to the Role Selection Screen
      if (data) {
        navigation.navigate('RoleSelection');
      }
    };

    Linking.addEventListener('url', handleDeepLink);

    return () => {
      Linking.removeEventListener('url', handleDeepLink);
    };
  }, [navigation]);

  return null;
};

export default useDeepLink;
