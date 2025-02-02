import React, {useEffect, useState} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {BASE_URL} from '../../config/config';


const RiderHomeScreen = () => {

    const [riderId, setriderId] = useState(null);
    const [riderName, setriderName] = useState('');


    useEffect(() => {
      const fetchriderId = async () => {
        try {
          const id = await AsyncStorage.getItem('riderId');
          if (id) {
            setriderId(id);
            fetchriderDetails(id);
            console.log('rider ID:', id);
          }
        } catch (error) {
          console.error('Error retrieving rider ID:', error);
        }
      };
      fetchriderId();
  
      const interval = setInterval(() => {
        if (riderId) {
          fetchriderDetails(riderId);
        }
      }, 5000); // Check every 5 seconds
  
      // Cleanup interval on unmount
      return () => clearInterval(interval);
    }, [riderId]);
  
    const fetchriderDetails = async id => {
      try {
        const response = await axios.get(`${BASE_URL}/riders/${id}`);
        setriderName(response.data.firstName + ' ' + response.data.lastName);
      } catch (error) {
        console.error('Error fetching rider details:', error);
      }
    };
  
    if (!riderId) return <Text>Loading...</Text>;
  return (
    
    <View style={styles.container}>
      <Text style={styles.welcomeMessage}>Welcome!</Text>
      <Text style={styles.welcomeMessage}> {riderName}!</Text>

      <Text style={styles.welcomeMessage1}>Futher App in under process....</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  welcomeMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
  },
  welcomeMessage1: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#343a40',
  },
});

export default RiderHomeScreen;
