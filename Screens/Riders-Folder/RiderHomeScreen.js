import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BASE_URL } from '../../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';

import HomeScreen from './Navigation Screens/HomeScreen';
import ConfirmBookingScreen from './Navigation Screens/ConfirmBookingScreen';
import PostRideScreen from './Navigation Screens/PostRideScreen';
import SearchRideScreen from './Navigation Screens/SearchRideScreen';
import ChatScreen from './Navigation Screens/ChatScreen';

const Tab = createBottomTabNavigator();

const RiderHomeScreen = () => {
  const [riderId, setRiderId] = useState(null);
  const [riderName, setRiderName] = useState('');

  useEffect(() => {
    const fetchRiderId = async () => {
      try {
        const id = await AsyncStorage.getItem('riderId');
        if (id) {
          setRiderId(id);
          fetchRiderDetails(id);
          console.log('Rider ID:', id);
        }
      } catch (error) {
        console.error('Error retrieving rider ID:', error);
      }
    };
    fetchRiderId();
  }, []);

  const fetchRiderDetails = async (id) => {
    try {
      const response = await axios.get(`${BASE_URL}/riders/${id}`);
      setRiderName(response.data.firstName);
    } catch (error) {
      console.error('Error fetching rider details:', error);
    }
  };

  if (!riderId) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeMessage}>Welcome, {riderName}!</Text>
      </View>
      
      <Tab.Navigator
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
          headerShown: false,
          title: ""
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="ConfirmBooking"
          component={ConfirmBookingScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="check-circle" size={size} color={color} />,
          }}
        />
       <Tab.Screen
  name="PostRide"
  component={PostRideScreen}
  options={({ navigation }) => ({  // Get navigation from props
    tabBarButton: () => (
      <TouchableOpacity
        style={styles.plusButtonContainer}
        onPress={() => navigation.navigate("PostRide")} // Navigate properly
      >
        <View style={styles.plusButton}>
          <Icon name="plus" size={26} color="white" />
        </View>
      </TouchableOpacity>
    ),
  })}
/>

        <Tab.Screen
          name="SearchRide"
          component={SearchRideScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="search" size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="comments" size={size} color={color} />,
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  welcomeMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343a40',
  },
  tabBar: {
    position: 'absolute',
    height: 70,
    borderRadius: 15,
    backgroundColor: '#ffffff',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },
  plusButtonContainer: {
    position: 'absolute',
    top: -30,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  plusButton: {
    width: 60,
    height: 60,
    backgroundColor: '#4A90E2',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
});

export default RiderHomeScreen;
