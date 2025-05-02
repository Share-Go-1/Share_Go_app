import React, { useState, useEffect, useCallback, memo } from 'react';
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
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../../../config/config';

const SearchRideScreen = () => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [driverRides, setDriverRides] = useState([]);
  const [driverNames, setDriverNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [riderId, setRiderId] = useState(null);
  const [riderName, setRiderName] = useState(null);

  // Fetch rider ID from AsyncStorage and rider name from API
  useEffect(() => {
    const fetchRiderData = async () => {
      try {
        const storedRiderId = await AsyncStorage.getItem('riderId');
        if (storedRiderId) {
          setRiderId(storedRiderId);
          const response = await axios.get(`${BASE_URL}/riders/${storedRiderId}`);
          const firstName = response.data.firstName || 'Unknown';
          setRiderName(firstName);
        } else {
          Alert.alert('Error', 'No rider ID found. Please log in.');
        }
      } catch (error) {
        console.error('Error fetching rider data:', error);
        Alert.alert('Error', 'Failed to fetch rider information.');
      }
    };
    fetchRiderData();
  }, []);

  const fetchDriverName = async (driverId) => {
    try {
      const response = await axios.get(`${BASE_URL}/drivers/${driverId}`);
      const firstName = response.data.basicInfo?.firstName || 'Unknown';
      return firstName;
    } catch (error) {
      console.error(`Error fetching driver name for ID ${driverId}:`, error);
      return 'Unknown';
    }
  };

  const handleSearch = async () => {
    if (!pickup.trim() && !destination.trim()) {
      Alert.alert('Error', 'Please enter either a pickup or destination location to search.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/driverpost`, {
        params: { pickup, dropoff: destination },
      });

      const unbookedRides = (response.data.posts || []).filter(ride => !ride.booked);

      const namePromises = unbookedRides.map(async (ride) => ({
        id: ride.driverId,
        name: await fetchDriverName(ride.driverId),
      }));

      const names = await Promise.all(namePromises);
      const namesMap = names.reduce((acc, { id, name }) => ({
        ...acc,
        [id]: name,
      }), {});

      setDriverNames(namesMap);
      setDriverRides(unbookedRides);
    } catch (error) {
      console.error('Error fetching driver rides:', error);
      Alert.alert('Error', 'Failed to fetch driver rides. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRide = (rideId) => {
    if (!riderId || !riderName) {
      Alert.alert('Error', 'Rider information not available. Please log in.');
      return;
    }

    Alert.alert(
      'Confirm Booking',
      'Are you sure you want to book this ride?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await axios.patch(`${BASE_URL}/${rideId}/book`, {
                riderId,
                riderName,
              });
              // Remove the booked ride from the list
              setDriverRides(driverRides.filter(ride => ride._id !== rideId));
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

  const renderRideItem = ({ item }) => {
    const rideDateTime = item.rideDateTime ? new Date(item.rideDateTime) : null;
    const formattedDate = rideDateTime ? rideDateTime.toLocaleDateString() : 'N/A';
    const formattedTime = rideDateTime ? rideDateTime.toLocaleTimeString() : 'N/A';

    return (
      <View style={styles.rideItem}>
        <Text style={styles.detail}>
          <Text style={styles.label}>Driver:</Text> {driverNames[item.driverId] || 'Loading...'}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.label}>Pickup:</Text> {item.pickup}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.label}>Dropoff:</Text> {item.dropoff}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.label}>Vehicle:</Text> {item.vehicleType}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.label}>Distance:</Text> {item.distance.toFixed(2)} km
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.label}>Fare:</Text> Rs. {item.totalFare}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.label}>Ride Date:</Text> {formattedDate}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.label}>Ride Time:</Text> {formattedTime}
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
  };

  // Memoized Header
  const renderHeader = useCallback(() => (
    <View style={styles.headerContainer}>
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
        <Text style={styles.searchButtonText}>Browse Rides</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#1e90ff" style={styles.loader} />}
      {!loading && driverRides.length === 0 && (
        <Text style={styles.noRidesText}>No unbooked driver rides found.</Text>
      )}
    </View>
  ), [pickup, destination, loading, driverRides]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={driverRides}
        keyExtractor={(item) => item._id}
        renderItem={renderRideItem}
        ListHeaderComponent={renderHeader}
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
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default SearchRideScreen;
