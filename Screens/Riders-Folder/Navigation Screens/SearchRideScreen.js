import React, { useState } from 'react';
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
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { BASE_URL } from '../../../config/config';

const SearchRideScreen = () => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [driverRides, setDriverRides] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!pickup.trim() || !destination.trim()) {
      Alert.alert('Error', 'Please enter both pickup and destination locations.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/searchDriverRides`, {
        params: { pickup, destination },
      });
      setDriverRides(response.data || []);
    } catch (error) {
      console.error('Error fetching driver rides:', error);
      Alert.alert('Error', 'Failed to fetch driver rides. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderRideItem = ({ item }) => (
    <View style={styles.rideItem}>
      <Text style={styles.rideText}>Pickup: {item.pickup}</Text>
      <Text style={styles.rideText}>Dropoff: {item.dropoff}</Text>
      <Text style={styles.rideText}>Vehicle: {item.vehicleType}</Text>
      <Text style={styles.rideText}>Distance: {item.distance} km</Text>
      <Text style={styles.rideText}>Fare: Rs. {item.totalFare}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Search Driver's Posted Rides</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Pickup Location"
          value={pickup}
          onChangeText={setPickup}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter Destination Location"
          value={destination}
          onChangeText={setDestination}
        />

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search Rides</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#1e90ff" style={{ marginTop: 20 }} />}

        {!loading && driverRides.length === 0 && (
          <Text style={styles.noRidesText}>No driver's posted rides found.</Text>
        )}

        {driverRides.length > 0 && (
          <FlatList
            data={driverRides}
            keyExtractor={(item) => item._id}
            renderItem={renderRideItem}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f1f4f6',
    padding: 20,
    paddingTop: 50,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e90ff',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
  },
  searchButton: {
    backgroundColor: '#1e90ff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    marginTop: 20,
  },
  rideItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  rideText: {
    fontSize: 16,
    color: '#333',
  },
  noRidesText: {
    marginTop: 20,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});

export default SearchRideScreen;
