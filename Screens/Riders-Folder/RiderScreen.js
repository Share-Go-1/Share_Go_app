import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../../config/config';

const RiderScreen = () => {
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhone] = useState('');
  const [dob, setDob] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // 👈 New loading state

  const handleSave = async () => {
    const validationErrors = {};

    if (!firstName) validationErrors.firstName = 'First name is required';
    if (!lastName) validationErrors.lastName = 'Last name is required';
    if (!email) validationErrors.email = 'Email is required';
    if (!phoneNumber) validationErrors.phone = 'Phone number is required';
    if (!dob) validationErrors.dob = 'Date of birth is required';
    if (email && !email.includes('@')) validationErrors.email = 'Email must contain "@"';
    if (phoneNumber && phoneNumber.length !== 11) validationErrors.phone = 'Phone number must be 11 digits';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const userData = {
      firstName,
      lastName,
      email,
      phoneNumber,
      dob: dob.toISOString(),
    };

    try {
      setLoading(true); // 👈 Show loading spinner

      const response = await fetch(`${BASE_URL}/riders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      console.log('Backend response:', result);

      if (response.ok) {
        if (result._id) {
          await AsyncStorage.setItem('riderId', result._id);
          const storedId = await AsyncStorage.getItem('riderId');
          console.log('Stored riderId:', storedId);

          Alert.alert('Success', 'Data has been uploaded successfully!', [
            {
              text: 'OK',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Rider_HomeScreen' }],
                });
              },
            },
          ]);
          setFirstName('');
          setLastName('');
          setEmail('');
          setPhone('');
          setDob(null);
          setErrors({});
        } else {
          Alert.alert('Error', 'Invalid response from server. No rider ID found.');
        }
      } else {
        Alert.alert('Error', result.message || 'Something went wrong!');
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to connect to the server.');
    } finally {
      setLoading(false); // 👈 Hide loading spinner
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Rider Information</Text>

        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={[styles.input, errors.firstName && styles.errorInput]}
          placeholder="e.g: John"
          value={firstName}
          onChangeText={setFirstName}
        />
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={[styles.input, errors.lastName && styles.errorInput]}
          value={lastName}
          placeholder="e.g: Smith"
          onChangeText={setLastName}
        />
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.errorInput]}
          value={email}
          placeholder="e.g: abc@gmail.com"
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={[styles.input, errors.phone && styles.errorInput]}
          value={phoneNumber}
          onChangeText={setPhone}
          placeholder="e.g: 03123456789"
          keyboardType="phone-pad"
          maxLength={11}
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

        <Text style={styles.label}>Date of Birth</Text>
        <View style={styles.inputGroup}>
          <Feather name="calendar" size={16} color="#999" style={styles.inputIcon} />
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            <Text style={styles.dateButtonText}>
              {dob ? dob.toLocaleDateString() : 'Select Date of Birth'}
            </Text>
          </TouchableOpacity>
        </View>
        {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

        {showDatePicker && (
          <DateTimePicker
            value={dob || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDob(selectedDate);
            }}
            maximumDate={new Date()}
          />
        )}

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  errorInput: {
    borderColor: '#f44336',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 10,
  },
  dateButton: {
    flex: 1,
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 6,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginTop: -10,
    marginBottom: 10,
  },
});

export default RiderScreen;
