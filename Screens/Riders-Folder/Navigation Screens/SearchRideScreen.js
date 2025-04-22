import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../../config/config';

const SearchRideScreen = () => {
  const [riderId, setRiderId] = useState(null);
  const [ridePosts, setRidePosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch riderId from AsyncStorage
  useEffect(() => {
    const fetchRiderId = async () => {
      try {
        const id = await AsyncStorage.getItem('riderId');
        if (id) {
          setRiderId(id);
        } else {
          setError('Rider ID not found. Please log in.');
        }
      } catch (err) {
        console.error('Error retrieving rider ID:', err);
        setError('Failed to retrieve rider ID.');
      }
    };
    fetchRiderId();
  }, []);

  // Fetch ride posts when riderId is available
  useEffect(() => {
    if (riderId) {
      fetchRidePosts();
    }
  }, [riderId]);

  const fetchRidePosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/riderpost/${riderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseText = await response.text();
      console.log('Raw Response:', responseText);

      if (responseText.startsWith('<')) {
        console.error('Server returned HTML error page:', responseText);
        throw new Error('Server returned an error page (HTML).');
      }

      const result = JSON.parse(responseText);
      if (response.ok) {
        setRidePosts(result.rides || []);
      } else {
        throw new Error(result.message || 'Failed to fetch ride posts.');
      }
    } catch (err) {
      console.error('Error fetching ride posts:', err);
      setError(err.message || 'Error fetching ride posts.');
    } finally {
      setLoading(false);
    }
  };

  // Render each ride post
  const renderRidePost = ({ item }) => (
    <View style={styles.rideCard}>
      <Text style={styles.rideText}>
        <Text style={styles.label}>From: </Text>
        {item.pickup}
      </Text>
      <Text style={styles.rideText}>
        <Text style={styles.label}>To: </Text>
        {item.dropoff}
      </Text>
      <Text style={styles.rideText}>
        <Text style={styles.label}>Vehicle: </Text>
        {item.vehicleType.toUpperCase()}
      </Text>
      <Text style={styles.rideText}>
        <Text style={styles.label}>Distance: </Text>
        {typeof item.distance === 'number' ? item.distance.toFixed(2) : '0.00'} km
      </Text>
      <Text style={styles.rideText}>
        <Text style={styles.label}>Fare: </Text>
        Rs. {typeof item.totalFare === 'number' ? item.totalFare.toFixed(2) : '0.00'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Ride Posts</Text>

      {loading && (
        <ActivityIndicator size="large" color="#1e90ff" style={styles.loader} />
      )}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {!loading && !error && riderId && ridePosts.length === 0 && (
        <Text style={styles.noPostsText}>No ride posts found.</Text>
      )}

      {!loading && !error && ridePosts.length > 0 && (
        <FlatList
          data={ridePosts}
          renderItem={renderRidePost}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f4f6',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e90ff',
    textAlign: 'center',
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  noPostsText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  rideCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  rideText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    color: '#1e90ff',
  },
});

export default SearchRideScreen;