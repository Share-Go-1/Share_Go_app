import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import { uploadImageToCloudinary } from '../../config/cloudinaryConfig';
import { PermissionsAndroid } from 'react-native';

const VehicleInfoScreen = ({ route, navigation }) => {
  const { setData } = route.params;
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [color, setColor] = useState('');  const [company, setCompany] = useState(null);
  const [model, setModel] = useState(null);
  const [engineNumber, setEngineNumber] = useState('');
  const [images, setImages] = useState({
    front: null,
    right: null,
    left: null,
    back: null,
  });
  const [isLoading, setIsLoading] = useState(false); // Loading state for the save action
  const [savedData, setSavedData] = useState(null);

  const exampleImages = {
    front: require('../../assets/bikefront.png'),
    right: require('../../assets/bikeright.png'),
    left: require('../../assets/bikeleft.png'),
    back: require('../../assets/bikeback.png'),
  };

  const companies = {
    Benelli: ['Benelli TNT150i', 'Benelli TNT25'],
    Hero: ['Hero RF70', 'Hero RF125'],
    HiSpeed: [
      'Hi-Speed Infinity 150',
      'Hi-Speed Alpha 100',
      'Hi-Speed SR70',
      'Hi-Speed SR125',
    ],
    Honda: [
      'Honda CD70',
      'Honda CG100',
      'Honda CG125',
      'Honda CG125 Special Edition',
      'Honda CB125F',
      'Honda CB150F',
      'Honda CBR500R',
      'Honda CB250F',
    ],
    Metro: ['Metro MR70', 'Metro MR125'],
    RoadPrince: [
      'Road Prince RP70',
      'Road Prince RP110',
      'Road Prince RP125',
      'Road Prince RX3 250',
    ],
    SuperPower: [
      'Super Power SP70',
      'Super Power SP100',
      'Super Power SP125',
      'Super Power Archi 150',
    ],
    Suzuki: [
      'Suzuki GD110S',
      'Suzuki GS150',
      'Suzuki GS150 SE',
      'Suzuki GR150',
      'Suzuki Gixxer 150',
    ],
    Unique: ['Unique UD70', 'Unique UD100', 'Unique UD125'],
    United: ['United US70', 'United US100', 'United US125', 'United US150'],
    Yamaha: [
      'Yamaha YBR125',
      'Yamaha YBR125G',
      'Yamaha YBZ125',
      'Yamaha YBR125Z-DX',
    ],
    Zxmco: ['Zxmco ZX70', 'Zxmco ZX100', 'Zxmco ZX125'],
  };

  const sortedCompanyNames = Object.keys(companies).sort();

  // Request camera permission
  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera to take photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Camera permission granted');
        return true;
      } else {
        console.log('Camera permission denied');
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const pickOrCaptureImage = async (side) => {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera access is required to take photos.');
      return;
    }

    const options = { mediaType: 'photo', cameraType: 'back', quality: 1 };

    Alert.alert('Select an option', 'Choose how to add the image', [
      {
        text: 'Take Photo',
        onPress: () => {
          console.log('Taking photo');
          launchCamera(options, (response) => {
            if (response.assets) {
              setImages((prev) => ({ ...prev, [side]: response.assets[0].uri }));
            }
          });
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: () => {
          console.log('Choosing from gallery');
          launchImageLibrary(options, (response) => {
            if (response.assets) {
              setImages((prev) => ({ ...prev, [side]: response.assets[0].uri }));
            }
          });
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    setIsLoading(true); // Start loading

    // Validate fields
    if (!vehicleNumber || !company || !model || !engineNumber) {
      Alert.alert('Please fill out all fields.');
      setIsLoading(false);
      return;
    }
    if (Object.values(images).includes(null)) {
      Alert.alert('Please upload all vehicle images.');
      setIsLoading(false);
      return;
    }

    try {
      // Upload images to Cloudinary
      const frontImageUrl = await uploadImageToCloudinary(images.front);
      const rightImageUrl = await uploadImageToCloudinary(images.right);
      const leftImageUrl = await uploadImageToCloudinary(images.left);
      const backImageUrl = await uploadImageToCloudinary(images.back);

      if (frontImageUrl && rightImageUrl && leftImageUrl && backImageUrl) {
        const vehicleData = {
          vehicleNumber,
          color,
          company,
          model,
          engineNumber,
          images: {
            front: frontImageUrl,
            right: rightImageUrl,
            left: leftImageUrl,
            back: backImageUrl,
          },
        };

        setSavedData(vehicleData);
        setData('vehicleInfo', vehicleData);

        navigation.goBack(); // Go back after saving
      } else {
        Alert.alert('Error', 'Failed to upload images. Please try again.');
      }
    } catch (error) {
      console.error('Error saving vehicle info:', error);
      console.log('uploadImageToCloudinary:', uploadImageToCloudinary);

      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Vehicle Information</Text>

        <Text style={styles.label}>Vehicle Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g: LEQ 7026"
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
        />
        <Text style={styles.label}>Color</Text>
         <TextInput
          style={styles.input}
          placeholder="e.g: Blue"
          value={color}
          onChangeText={setColor}
          maxLength={20}
        />

        <Text style={styles.label}>Company Name</Text>
        <RNPickerSelect
          style={styles.input1}
          value={company}
          onValueChange={(value) => {
            setCompany(value);
            setModel(null); // Reset model when company changes
          }}
          items={sortedCompanyNames.map((comp) => ({
            label: comp,
            value: comp,
          }))}
        />

        {company && (
          <>
            <Text style={styles.label}>Model</Text>
            <RNPickerSelect
              style={styles.input1}
              value={model}
              onValueChange={setModel}
              items={companies[company].map((mod) => ({
                label: mod,
                value: mod,
              }))}
            />
          </>
        )}

        <Text style={styles.label}>Engine Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g: 0912200"
          value={engineNumber}
          onChangeText={setEngineNumber}
          maxLength={7}
        />

        <Text style={styles.sectionTitle}>Upload Vehicle Images</Text>
        <View style={styles.imageGrid}>
          {['front', 'right', 'left', 'back'].map((side) => (
            <View key={side} style={styles.imageItem}>
              <Text style={styles.imageLabel}>{side.toUpperCase()}</Text>
              <Image
                source={
                  images[side] ? { uri: images[side] } : exampleImages[side]
                }
                style={styles.imageStyle}
              />
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => pickOrCaptureImage(side)}
              >
                <Text style={styles.uploadButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.disabledButton]}
          onPress={isLoading ? null : handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Next</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {paddingVertical: 20},
  container: {padding: 20},
  title: {fontSize: 24, fontWeight: 'bold', textAlign: 'center'},
  label: {fontSize: 16, marginVertical: 10},
  input: {borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 20},
  input1: {height: 50, borderWidth: 1, borderRadius: 5, marginBottom: 20},
  sectionTitle: {fontSize: 18, fontWeight: 'bold', marginTop: 20},
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Ensures items wrap to the next row
    alignItems: 'center',
    justifyContent: 'space-between', // Space between items
  },
  imageItem: {
    width: '48%', // Each item takes about half the width
    marginBottom: 10, // Space between rows
    alignItems: 'center', // Center content in each item
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  imageStyle: {
    width: '100%',
    height: 120, // Adjust height as needed
    borderRadius: 10,
    backgroundColor: '#f0f0f0', // Optional placeholder background
  },
  uploadButton: {
    marginTop: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },

  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 5,
  },
  disabledButton: {backgroundColor: '#BDBDBD'},
  saveButtonText: {color: '#fff', fontSize: 18, textAlign: 'center'},
});

export default VehicleInfoScreen;