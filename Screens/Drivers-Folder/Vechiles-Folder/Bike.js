import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-elements/dist/icons/Icon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../../config/config';
import { color } from 'react-native-elements/dist/helpers';

const BikeScreen = ({ navigation }) => {
  const [basicInfo, setBasicInfo] = useState(null);
  const [cnic, setCnic] = useState(null);
  const [license, setLicense] = useState(null);
  const [vehicleInfo, setVehicleInfo] = useState(null);

  const navigateTo = (screen) => {
    navigation.navigate(screen, { setData: handleSetData });
  };

  const handleSetData = (section, data) => {
    switch (section) {
      case 'basicInfo':
        setBasicInfo(data);
        break;
      case 'cnic':
        setCnic(data);
        break;
      case 'license':
        setLicense(data);
        break;
      case 'vehicleInfo':
        setVehicleInfo(data);
        break;
      default:
        break;
    }
  };



  const handleSubmit = async () => {
    const payload = {
      basicInfo: {
        firstName: basicInfo?.firstName,
        lastName: basicInfo?.lastName,
        email: basicInfo?.email,
        phoneNumber: basicInfo?.phoneNumber,
        gender: basicInfo?.gender,
        address: basicInfo?.address,
        dateOfBirth: basicInfo?.dateOfBirth,
        profileImage: basicInfo?.imageUri,
      },
      cnic: {
        cnicNumber: cnic?.cnicNumber,
      },
      license: {
        licenseNumber: license?.licenseNumber,
        issueDate: license?.issueDate?.toISOString(),
        expiryDate: license?.expiryDate?.toISOString(),
        frontImage: license?.frontImage,
        backImage: license?.backImage,
      },
      vehicle: {
        type: 'Bike',
        bikeInfo: {
          color: vehicleInfo?.color,
          vehicleNumber: vehicleInfo?.vehicleNumber,
          company: vehicleInfo?.company,
          model: vehicleInfo?.model,
          engineNumber: vehicleInfo?.engineNumber,
          front: vehicleInfo?.images?.front,
          back: vehicleInfo?.images?.back,
          right: vehicleInfo?.images?.right,
          left: vehicleInfo?.images?.left,
        },
      },
      verification: 'pending',
    };
  
    try {
      const response = await fetch(`${BASE_URL}/drivers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        // Save driver ID to AsyncStorage
        await AsyncStorage.setItem('driverId', result.id);
  
        Alert.alert('Success', 'Data has been uploaded successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to Home without back navigation
              navigation.reset({
                index: 0,
                routes: [{ name: 'Driver_HomeScreen' }],
              });
            },
          },
        ]);
  
        setBasicInfo(null);
        setCnic(null);
        setLicense(null);
        setVehicleInfo(null);
      } else {
        const errorMessage = result.message || 'An error occurred';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Unable to connect to the server.');
    }
  };
  
  

  const allSectionsCompleted = basicInfo && cnic && license && vehicleInfo;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.section}
        onPress={() => navigateTo('BasicInfoScreen')}
      >
        <Text style={styles.sectionText}>Basic Info</Text>
        <Icon name="check-circle" type="feather" color={basicInfo ? 'green' : 'gray'} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.section}
        onPress={() => navigateTo('CNICScreen')}
      >
        <Text style={styles.sectionText}>CNIC</Text>
        <Icon name="check-circle" type="feather" color={cnic ? 'green' : 'gray'} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.section}
        onPress={() => navigateTo('LincenseScreen')}
      >
        <Text style={styles.sectionText}>License Info</Text>
        <Icon name="check-circle" type="feather" color={license ? 'green' : 'gray'} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.section}
        onPress={() => navigateTo('VehicleInfoScreen')}
      >
        <Text style={styles.sectionText}>Vehicle Info</Text>
        <Icon name="check-circle" type="feather" color={vehicleInfo ? 'green' : 'gray'} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: allSectionsCompleted ? '#90EE90' : '#d3d3d3' },
        ]}
        disabled={!allSectionsCompleted}
        onPress={handleSubmit}
      >
        <Text
          style={[
            styles.submitText,
            { color: allSectionsCompleted ? '#333' : '#a9a9a9' },
          ]}
        >
          Submit
        </Text>
      </TouchableOpacity>


    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', padding: 20 },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  sectionText: { fontSize: 16 },
  submitButton: { padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 20 },
  submitText: { fontSize: 18 },
  dataContainer: { marginTop: 20, padding: 10, backgroundColor: '#f5f5f5' },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, marginTop: 10 },
});

export default BikeScreen;
