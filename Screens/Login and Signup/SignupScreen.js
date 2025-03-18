import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {supabase} from '../../config/supabaseClient';

export default function SignupScreen({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignup = async () => {
    setErrors({});
    setSuccessMessage('');
  
    let newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8)
      newErrors.password = 'Password must be at least 8 characters long';
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    setLoading(true);
  
    try {
      console.log("🔍 Checking if email already exists in database:", email);
  
      // 🔹 Step 1: Check if Email Already Exists in `profiles` Table
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .single();
  
      if (checkError && checkError.code !== 'PGRST116') { // Ignore "no match found" error
        console.error("❌ Error checking existing email:", checkError.message);
        setErrors({ general: 'Error checking email. Try again later.' });
        setLoading(false);
        return;
      }
  
      if (existingProfile) {
        console.log("⛔ Email already exists:", existingProfile.email);
        setErrors({ email: 'This email is already registered.' });
        setLoading(false);
        return;
      }
  
      console.log("✅ Email is new, inserting into profiles table...");
  
      // 🔹 Step 2: Insert into Profiles Table FIRST
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{ email: email, created_at: new Date() }]);
  
      if (profileError) {
        console.error("❌ Profile Insert Error:", profileError.message);
        setErrors({ general: 'Error saving profile data. Please try again.' });
        setLoading(false);
        return;  // Stop execution here if insert fails
      }
  
      console.log("✅ Profile inserted successfully. Proceeding with authentication...");
  
      // 🔹 Step 3: Now Proceed with Authentication
      const { data, error } = await supabase.auth.signUp({ email, password });
  
      if (error) {
        console.error("❌ Signup Error:", error.message);
        setErrors({ general: error.message });
      } else {
        console.log("✅ User signed up successfully!");
        setSuccessMessage('Check your email for verification.');
      }
    } catch (err) {
      console.log("❌ General Error:", err.message);
      setErrors({ general: err.message });
    }
  
    setLoading(false);
  };
    

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={{flexGrow: 1}}
          keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>

            {successMessage ? (
              <Text style={styles.successText}>{successMessage}</Text>
            ) : null}

            <TextInput
              placeholder="Email"
              placeholderTextColor="#ccc"
              style={[styles.input, errors.email && styles.errorInput]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}

            <TextInput
              placeholder="Password"
              placeholderTextColor="#ccc"
              style={[styles.input, errors.password && styles.errorInput]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {errors.general && (
              <Text style={styles.errorText}>{errors.general}</Text>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleSignup}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signupText}>
                Already have an account? Log In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 200,
    height: 200,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 5},
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  successText: {
    color: 'green',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#3b5998',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signupText: {
    color: '#3b5998',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});
