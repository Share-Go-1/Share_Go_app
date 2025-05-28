import React, {useState, useEffect} from 'react';
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
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import RNPickerSelect from 'react-native-picker-select';
import {uploadImageToCloudinary} from '../../config/cloudinaryConfig';
import {PermissionsAndroid} from 'react-native';

const CarVehicleInfoScreen = ({route, navigation}) => {
  const {setData} = route.params;
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [color, setColor] = useState('');
  const [company, setCompany] = useState(null);
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
    front: require('../../assets/carfront.png'),
    right: require('../../assets/carright.png'),
    left: require('../../assets/carleft.png'),
    back: require('../../assets/carback.png'),
  };

  const companies = {
    Toyota: [
      'Toyota Corolla Altis',
      'Toyota Corolla Grande',
      'Toyota Corolla GLi',
      'Toyota Corolla XLi',
      'Toyota Yaris ATIV',
      'Toyota Yaris GLi',
      'Toyota Fortuner 2.7 V',
      'Toyota Fortuner Sigma 4',
      'Toyota Hilux Revo',
      'Toyota Prius S',
      'Toyota Prius Alpha',
    ],
    Honda: [
      'Honda Civic 1.8 i-VTEC',
      'Honda Civic Oriel',
      'Honda Civic RS Turbo',
      'Honda City 1.2L',
      'Honda City 1.5L Aspire',
      'Honda BR-V S',
      'Honda Accord Hybrid',
    ],
    Suzuki: [
      'Suzuki Alto VXR',
      'Suzuki Alto VX',
      'Suzuki Alto AGS',
      'Suzuki Cultus VXL',
      'Suzuki Cultus AGS',
      'Suzuki Wagon R VXR',
      'Suzuki Wagon R AGS',
      'Suzuki Swift GL',
      'Suzuki Swift GLX',
      'Suzuki Bolan VX',
      'Suzuki Bolan Cargo',
    ],
    Hyundai: [
      'Hyundai Tucson GLS',
      'Hyundai Tucson AWD',
      'Hyundai Elantra GL',
      'Hyundai Sonata 2.0',
      'Hyundai Sonata 2.5',
      'Hyundai Santa Fe Base',
      'Hyundai Santa Fe Premium',
    ],
    Kia: [
      'Kia Sportage Alpha',
      'Kia Sportage AWD',
      'Kia Sportage FWD',
      'Kia Picanto AT',
      'Kia Picanto MT',
      'Kia Sorento 2.4L',
      'Kia Sorento 3.5L',
      'Kia Stonic EX+',
      'Kia Stonic EX',
    ],
    MG: ['MG HS 1.5T', 'MG ZS 1.5L', 'MG ZS EV'],
    Nissan: [
      'Nissan Dayz Highway Star',
      'Nissan Juke RS',
      'Nissan Note e-Power',
      'Nissan Sunny 1.6L',
    ],
    Mitsubishi: [
      'Mitsubishi Lancer GLX',
      'Mitsubishi Pajero Exceed',
      'Mitsubishi Mirage ES',
      'Mitsubishi Outlander PHEV',
    ],
    Audi: [
      'Audi A3 Sedan',
      'Audi A4 Avant',
      'Audi Q3 Premium',
      'Audi Q7 S-Line',
    ],
    'Mercedes-Benz': [
      'Mercedes-Benz C180',
      'Mercedes-Benz E200',
      'Mercedes-Benz S450',
      'Mercedes-Benz GLE 350',
    ],
    BMW: ['BMW 320i', 'BMW 530e', 'BMW X1 sDrive18i', 'BMW X5 xDrive40i'],
    Volkswagen: [
      'Volkswagen Passat SE',
      'Volkswagen Tiguan SEL',
      'Volkswagen Golf GTI',
      'Volkswagen Jetta R-Line',
    ],
    Chevrolet: [
      'Chevrolet Spark LS',
      'Chevrolet Malibu LT',
      'Chevrolet Cruze Premier',
    ],
    Ford: [
      'Ford Fiesta SE',
      'Ford Focus Titanium',
      'Ford EcoSport SE',
      'Ford Ranger XLT',
    ],
    Changan: [
      'Changan Alsvin Comfort',
      'Changan Alsvin Lumiere',
      'Changan Karvaan Plus',
      'Changan M9 Loader',
    ],
    Proton: ['Proton Saga Standard', 'Proton Saga Ace', 'Proton X70 Executive'],
    DFSK: ['DFSK Glory 580 1.8 CVT', 'DFSK Glory 580 Pro'],
    Haval: ['Haval H6 1.5T', 'Haval H6 2.0 AWD', 'Haval Jolion 1.5T'],
    Jeep: [
      'Jeep Wrangler Sport',
      'Jeep Wrangler Rubicon',
      'Jeep Grand Cherokee Limited',
    ],
    'Land Rover': [
      'Land Rover Defender 110',
      'Land Rover Range Rover Evoque',
      'Land Rover Range Rover Velar',
    ],
  };

  const sortedCompanyNames = Object.keys(companies).sort();

  useEffect(() => {
    const checkPermissions = async () => {
      const hasCameraPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      if (!hasCameraPermission) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to take photos.',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Denied',
            'Camera access is required to take photos.',
          );
        }
      }
    };

    checkPermissions(); // Check permissions when screen is focused
  }, []); // Empty dependency array to only run once on mount

  const pickOrCaptureImage = async side => {
    const options = {mediaType: 'photo', cameraType: 'back', quality: 1};

    Alert.alert('Select an option', 'Choose how to add the image', [
      {
        text: 'Take Photo',
        onPress: () => {
          launchCamera(options, response => {
            if (response.assets) {
              setImages(prev => ({...prev, [side]: response.assets[0].uri}));
            }
          });
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: () => {
          launchImageLibrary(options, response => {
            if (response.assets) {
              setImages(prev => ({...prev, [side]: response.assets[0].uri}));
            }
          });
        },
      },
      {text: 'Cancel', style: 'cancel'},
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
        const car_vehicleData = {
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

        setSavedData(car_vehicleData);
        setData('vehicleInfo', car_vehicleData);

        navigation.goBack(); // Go back after saving
      } else {
        Alert.alert('Error', 'Failed to upload images. Please try again.');
      }
    } catch (error) {
      console.error('Error saving vehicle info:', error);
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
          placeholder="e.g: Red"
          value={color}
          onChangeText={setColor}
        />
        <Text style={styles.label}>Company Name</Text>
        <RNPickerSelect
          style={styles.input1}
          value={company}
          onValueChange={value => {
            setCompany(value);
            setModel(null); // Reset model when company changes
          }}
          items={sortedCompanyNames.map(comp => ({
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
              items={companies[company].map(mod => ({
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
          {['front', 'right', 'left', 'back'].map(side => (
            <View key={side} style={styles.imageItem}>
              <Text style={styles.imageLabel}>{side.toUpperCase()}</Text>
              <Image
                source={
                  images[side] ? {uri: images[side]} : exampleImages[side]
                }
                style={styles.imageStyle}
              />
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => pickOrCaptureImage(side)}>
                <Text style={styles.uploadButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

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

export default CarVehicleInfoScreen;
