import React, { useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../../../config/config';

const DriverSearchRideScreen = () => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [riderRides, setRiderRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [driverId, setDriverId] = useState(null);
  const [driverName, setDriverName] = useState(null);
  const [driverNumber, setDriverNumber] = useState(null);
  const [driverVechileNumber, setDriverVechileNumber] = useState(null);
  const [driverVechileColor, setDriverVechileColor] = useState(null);
  const [driverVechileModel, setDriverVechileModel] = useState(null);

  // Fetch driver data from AsyncStorage and API
  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const storedDriverId = await AsyncStorage.getItem('driverId');
        if (storedDriverId) {
          setDriverId(storedDriverId);
          const response = await axios.get(`${BASE_URL}/drivers/${storedDriverId}`);
          const driverData = response.data;
          setDriverName(driverData.basicInfo?.firstName || 'Unknown');
          setDriverNumber(driverData.basicInfo?.phoneNumber || null); // Assuming phoneNumber is in basicInfo
          // Determine vehicle type and extract details from bikeInfo or carInfo
          const vehicleInfo = driverData.vehicle?.bikeInfo || driverData.vehicle?.carInfo || {};
          setDriverVechileNumber(vehicleInfo.vehicleNumber || null);
          setDriverVechileColor(vehicleInfo.color || null);
          setDriverVechileModel(vehicleInfo.model || null);
        } else {
          Alert.alert('Error', 'No driver ID found. Please log in.');
        }
      } catch (error) {
        console.error('Error fetching driver data:', error);
        Alert.alert('Error', 'Failed to fetch driver information.');
      }
    };
    fetchDriverData();
  }, []);

  const fetchRiderName = async (riderId) => {
    try {
      const response = await axios.get(`${BASE_URL}/riders/${riderId}`);
      return response.data.firstName || 'Unknown';
    } catch (error) {
      console.error('Error fetching rider name:', error);
      return 'Unknown';
    }
  };

  const handleSearch = async () => {
    const trimmedPickup = pickup.trim().toLowerCase();
    const trimmedDestination = destination.trim().toLowerCase();

    if (!trimmedPickup && !trimmedDestination) {
      Alert.alert('Error', 'Please enter at least pickup or destination.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/riderpost/`);
      const allRides = response.data.rides || [];

      const filteredRides = allRides.filter(ride => {
        const ridePickup = ride.pickup?.toLowerCase() || '';
        const rideDropoff = ride.dropoff?.toLowerCase() || '';
        const matchesPickup = trimmedPickup ? ridePickup.includes(trimmedPickup) : true;
        const matchesDestination = trimmedDestination ? rideDropoff.includes(trimmedDestination) : true;
        return matchesPickup && matchesDestination && !ride.booked;
      });

      // Fetch rider names for each ride
      const ridesWithRiderNames = await Promise.all(
        filteredRides.map(async (ride) => {
          const riderName = await fetchRiderName(ride.riderId);
          return { ...ride, riderFirstName: riderName };
        })
      );

      setRiderRides(ridesWithRiderNames);
    } catch (error) {
      console.error('Error fetching rider rides:', error?.response || error);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to fetch rider rides. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

const handleConfirmRide = (rideId) => {
  const missingFields = [];
  if (!driverId) missingFields.push('driverId');
  if (!driverName) missingFields.push('driverName');
  if (!driverNumber) missingFields.push('driverNumber');
  if (!driverVechileNumber) missingFields.push('driverVechileNumber');
  if (!driverVechileColor) missingFields.push('driverVechileColor');
  if (!driverVechileModel) missingFields.push('driverVechileModel');

  if (missingFields.length > 0) {
    console.log('Missing driver fields:', missingFields);
    Alert.alert('Error', `Missing driver information: ${missingFields.join(', ')}. Please ensure all details are available.`);
    return;
  }

  // Rest of the function remains the same
  Alert.alert(
    'Confirm Booking',
    'Are you sure you want to book this ride?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            await axios.patch(`${BASE_URL}/rides/${rideId}/book`, {
              driverId,
              driverName,
              driverNumber,
              driverVechileNumber,
              driverVechileColor,
              driverVechileModel,
            });
            setRiderRides(riderRides.filter(ride => ride._id !== rideId));
            Alert.alert('Success', 'Ride booked successfully!');
          } catch (error) {
            console.error('Error booking ride:', error);
            Alert.alert('Error', 'Failed to book the ride. Please try again.');
          }
        },
      },
    ],
    { cancelable: true }
  );
};

  const renderRideItem = ({ item }) => (
    <View style={styles.rideItem}>
      <Text style={styles.detail}>
        <Text style={styles.label}>Name:</Text> {item.riderFirstName || 'Unknown'}
      </Text>
      <Text style={styles.detail}>
        <Text style={styles.label}>Pickup:</Text> {item.pickup}
      </Text>
      <Text style={styles.detail}>
        <Text style={styles.label}>Dropoff:</Text> {item.dropoff}
      </Text>
      <Text style={styles.detail}>
        <Text style={styles.label}>Vehicle:</Text> {item.vehicleType || 'Not specified'}
      </Text>
      <Text style={styles.detail}>
        <Text style={styles.label}>Distance:</Text> {item.distance ? item.distance.toFixed(2) : 'Unknown'} km
      </Text>
      <Text style={styles.detail}>
        <Text style={styles.label}>Fare:</Text> Rs. {item.totalFare || 'Not provided'}
      </Text>
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => handleConfirmRide(item._id)}
        activeOpacity={0.8}
      >
        <Text style={styles.confirmButtonText}>Confirm Ride</Text>
      </TouchableOpacity>
    </View>
  );

  const Header = memo(() => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Search Rider's Posted Rides</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Pickup Location"
        value={pickup}
        onChangeText={setPickup}
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Destination Location"
        value={destination}
        onChangeText={setDestination}
        placeholderTextColor="#888"
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch} activeOpacity={0.8}>
        <Text style={styles.searchButtonText}>Search Rides</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#1e90ff" style={styles.loader} />}
      {!loading && riderRides.length === 0 && (
        <Text style={styles.noRidesText}>No unbooked rider rides found.</Text>
      )}
    </View>
  ));

  return (
    <KeyboardAvoidingView style={styles.container} behavior="height">
      <FlatList
        data={riderRides}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderRideItem}
        ListHeaderComponent={Header}
        contentContainerStyle={styles.listContainer}
        keyboardShouldPersistTaps="handled"
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8eff8',
  },
  headerContainer: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#e8eff8',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e90ff',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButton: {
    backgroundColor: '#1e90ff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  listContainer: {
    paddingBottom: 20,
  },
  rideItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  detail: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    color: '#1e90ff',
  },
  noRidesText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loader: {
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default DriverSearchRideScreen;