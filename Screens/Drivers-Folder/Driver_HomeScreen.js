import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {BASE_URL} from '../../config/config';
import {useNavigation} from '@react-navigation/native';

const Driver_HomeScreen = () => {
  const [verificationStatus, setVerificationStatus] = useState('');
  const [driverId, setDriverId] = useState(null);
  const [driverName, setDriverName] = useState('');

  const navigation = useNavigation(); // Hook to get navigation object

  useEffect(() => {
    const fetchDriverId = async () => {
      try {
        const id = await AsyncStorage.getItem('driverId');
        if (id) {
          setDriverId(id);
          fetchDriverDetails(id);
          console.log('Driver ID:', id);
        } else {
          console.log('Driver ID not found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error retrieving driver ID:', error);
      }
    };
    fetchDriverId();

    const interval = setInterval(() => {
      if (driverId) {
        fetchDriverDetails(driverId);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [driverId]);

  useEffect(() => {
    if (verificationStatus === 'verified') {
      navigation.replace('DriverMainHomeScreen'); // Navigate when verified
    }
  }, [verificationStatus, navigation]);

  const fetchDriverDetails = async id => {
    try {
      const response = await axios.get(`${BASE_URL}/drivers/${id}`);
      console.log('Driver Details Response:', response.data);

      const basicInfo = response.data.basicInfo || {};
      const firstName = basicInfo.firstName || 'Unknown';
      const lastName = basicInfo.lastName || 'Driver';

      setDriverName(`${firstName} ${lastName}`);
      setVerificationStatus(response.data.verification);
    } catch (error) {
      console.error('Error fetching driver details:', error);
    }
  };

  if (!driverId) return <Text>Loading...</Text>;

  const renderVerificationMessage = () => {
    switch (verificationStatus) {
      case 'pending':
        return {message: 'Your verification is pending. We will inform you soon.', color: 'orange'};
      case 'verified':
        return {message: 'You are verified! Welcome to ShareGo.', color: 'green'};
      case 'rejected':
        return {
          message: (
            <>
              <Text>Your verification has been rejected.</Text>
              <Text style={styles.contactText}>
                Kindly contact us at{' '}
                <Text style={styles.emailText}>shaegoapp.f@gmail.com</Text>
              </Text>
            </>
          ),
          color: 'red',
        };
      default:
        return {message: '', color: 'gray'};
    }
  };

  const {message, color} = renderVerificationMessage();

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome !</Text>
      <Text style={styles.welcome}>{driverName}!</Text>
      <View style={styles.statusContainer}>
        <Text style={[styles.status, {color: color}]}>{message}</Text>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcome: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  status: {
    fontSize: 18,
    textAlign: 'center',
  },
  contactText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF', // Attractive blue color for the email
    textDecorationLine: 'underline', // Makes the email look clickable
  },
});

export default Driver_HomeScreen;
