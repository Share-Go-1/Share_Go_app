import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Feather from 'react-native-vector-icons/Feather';
import { uploadImageToCloudinary } from '../../config/cloudinaryConfig';
import RNPickerSelect from 'react-native-picker-select'; // Import react-native-picker-select
import ImagePicker from 'react-native-image-crop-picker';
import selfie from '../../assets/selfiepicture.png';


const BasicInfoScreen = ({ route, navigation }) => {
  const { setData } = route.params;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('male');
  const [genderVisible, setGenderVisible] = useState(false); // Controls the visibility of the dropdown
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [phoneNumberError, setPhoneNumberError] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDateOfBirth(selectedDate);
  };

  const validateFields = () => {
    const newErrors = {};
    if (!firstName) newErrors.firstName = 'First name is required';
    if (!lastName) newErrors.lastName = 'Last name is required';
    if (!email || !email.includes('@'))
      newErrors.email = 'Valid email is required';
    if (phoneNumber.length !== 11 || !/^\d{11}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 11 digits';
    }
    if (!gender) newErrors.gender = 'Gender is required';
    if (!address) newErrors.address = 'Address is required';
    if (!dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!imageUri) newErrors.imageUri = 'Image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateFields()) {
      setIsLoading(true); // Start loading

      try {
        const uploadedImageUrl = imageUri
          ? await uploadImageToCloudinary(imageUri)
          : null;

        if (uploadedImageUrl) {
          const basicInfo = {
            firstName,
            lastName,
            email,
            phoneNumber,
            gender,
            address,
            dateOfBirth: dateOfBirth?.toLocaleDateString(),
            imageUri: uploadedImageUrl,
          };

          setData('basicInfo', basicInfo);
          navigation.goBack();
        } else {
          Alert.alert('Error', 'Failed to upload image. Please try again.');
        }
      } catch (error) {
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false); // End loading
      }
    }
  };

  const pickOrCaptureImage = () => {
    Alert.alert('Select an option', 'Choose how you want to add the image', [
      {
        text: 'Take Photo',
        onPress: () =>
          ImagePicker.openCamera({
            width: 300,
            height: 300,
            cropping: true,
          })
            .then(image => setImageUri(image.path))
            .catch(error => console.log('Camera error:', error)),
      },
      {
        text: 'Choose from Gallery',
        onPress: () =>
          ImagePicker.openPicker({
            width: 300,
            height: 300,
            cropping: true,
          })
            .then(image => setImageUri(image.path))
            .catch(error => console.log('Gallery error:', error)),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <Feather name="user" size={24} color="#4CAF50" />
          <Text style={styles.title}>Basic Information</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={imageUri ? { uri: imageUri } : selfie} // Conditionally display the selected image or placeholder
            style={styles.imagePreview}
          />
          <TouchableOpacity
            style={styles.imageButton}
            onPress={pickOrCaptureImage}>
            <Text style={styles.imageButtonText}>Upload Picture</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Feather
            name="user"
            size={16}
            color="#999"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>
        {errors.firstName && (
          <Text style={styles.errorText}>{errors.firstName}</Text>
        )}
        <View style={styles.inputGroup}>
          <Feather
            name="user"
            size={16}
            color="#999"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
        {errors.lastName && (
          <Text style={styles.errorText}>{errors.lastName}</Text>
        )}

        <View style={styles.inputGroup}>
          <MaterialCommunityIcons
            name="gender-male"
            size={16}
            color="#999"
            style={styles.inputIcon}
          />
          <TouchableOpacity
            onPress={() => setGenderVisible(true)} // Show the dropdown when clicked
            style={[
              styles.input,
              {flexDirection: 'row', alignItems: 'center'},
            ]}>
            <Text style={styles.inputText}>
              {gender === 'male'
                ? 'Male'
                : gender === 'female'
                ? 'Female'
                : 'Other'}
            </Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color="#999"
            />
          </TouchableOpacity>

          {/* Show the dropdown within the field when clicked */}
          {genderVisible && (
            <RNPickerSelect
              onValueChange={value => {
                setGender(value);
                setGenderVisible(false); // Close the dropdown after selection
              }}
              value={gender}
              items={[
                {label: 'Male', value: 'male'},
                {label: 'Female', value: 'female'},
                {label: 'Other', value: 'other'},
              ]}
              style={{
                inputIOS: {
                  height: 40,
                  borderColor: '#ccc',
                  borderWidth: 1,
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  marginBottom: 10,
                  fontSize: 16,
                  color: '#000',
                },
                inputAndroid: {
                  height: 40,
                  borderColor: '#ccc',
                  borderWidth: 1,
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  marginBottom: 10,
                  fontSize: 16,
                  color: '#000',
                },
              }}
            />
          )}
        </View>

        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

        <View style={styles.inputGroup}>
          <Feather
            name="phone"
            size={16}
            color="#999"
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, phoneNumberError ? styles.errorInput : null]}
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={text => {
              setPhoneNumber(text);
              setPhoneNumberError(text.length < 11 && text.length > 0);
            }}
            keyboardType="phone-pad"
            maxLength={11}
          />
        </View>
        {errors.phoneNumber && (
          <Text style={styles.errorText}>{errors.phoneNumber}</Text>
        )}
        <View style={styles.inputGroup}>
          <Feather
            name="calendar"
            size={16}
            color="#999"
            style={styles.inputIcon}
          />
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}>
            <Text style={styles.dateButtonText}>
              {dateOfBirth
                ? dateOfBirth.toLocaleDateString()
                : 'Select Date of Birth'}
            </Text>
          </TouchableOpacity>
        </View>
        {errors.dateOfBirth && (
          <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
        )}
        {showDatePicker && (
          <Modal visible={showDatePicker} transparent>
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={dateOfBirth || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            </View>
          </Modal>
        )}
        <View style={styles.inputGroup}>
          <Feather
            name="mail"
            size={16}
            color="#999"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        <View style={styles.inputGroup}>
          <Feather
            name="map-pin"
            size={16}
            color="#999"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Home Address"
            value={address}
            onChangeText={setAddress}
          />
        </View>
        {errors.address && (
          <Text style={styles.errorText}>{errors.address}</Text>
        )}
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.disabledButton]}
          onPress={isLoading ? null : handleSave}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Next</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  inputIOS: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  inputAndroid: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#4CAF50',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  imageButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    height: 50,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  dateButton: {
    flex: 1,
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#555',
  },
  inputIcon: {
    marginRight: 10,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  datePickerContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorInput: {
    borderColor: 'red',
  },
});

export default BasicInfoScreen;
