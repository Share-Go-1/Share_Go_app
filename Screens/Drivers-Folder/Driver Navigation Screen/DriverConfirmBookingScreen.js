import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../../../config/config';

const DriverConfirmBookingScreen = ({navigation, route}) => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverId, setDriverId] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Initialize driver ID
  useEffect(() => {
    const initializeDriverId = async () => {
      try {
        let storedDriverId = await AsyncStorage.getItem('driverId');
        console.log('Driver ID from AsyncStorage:', storedDriverId);

        if (!storedDriverId && route.params?.driverId) {
          storedDriverId = route.params.driverId;
          console.log('Driver ID from route.params:', storedDriverId);
          await AsyncStorage.setItem('driverId', storedDriverId);
        }

        if (!storedDriverId) {
          throw new Error('Driver ID not found. Please log in.');
        }

        setDriverId(storedDriverId);
        console.log('Set Driver ID:', storedDriverId);
      } catch (err) {
        console.error('Driver ID initialization error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    initializeDriverId();
  }, [route.params]);

  // Fetch rides data
  const fetchRides = useCallback(async () => {
    if (!driverId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${BASE_URL}/driverpost/${driverId}`, {
       // params: {booked: false},
        params: { booked: true },
      });
      console.log('Fetch Rides Response:', response.data);
      setRides(response.data.posts || []); // Changed from response.data.rides to response.data.posts
    } catch (error) {
      console.error('Fetch Rides Error:', error);
      const message = error.response?.data?.message || 'Failed to fetch rides.';
      setError(message);
      setRides([]);
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  // Refresh control
  const onRefresh = useCallback(async () => {
    if (!driverId) return;

    setRefreshing(true);
    try {
      const response = await axios.get(`${BASE_URL}/driverpost/${driverId}`, {
        params: {booked: false},
      });
      setRides(response.data.posts || []); // Changed from response.data.rides to response.data.posts
      setError(null);
    } catch (error) {
      console.error('Refresh Error:', error);
      const message =
        error.response?.data?.message || 'Failed to refresh rides.';
      setError(message);
    } finally {
      setRefreshing(false);
    }
  }, [driverId]);

  // Load rides when driverId changes
  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  // Cancel a ride
  const cancelRide = async id => {
    try {
      setLoading(true);
      const response = await axios.delete(`${BASE_URL}/delete/${id}`);
      if (response.data.success) {
        Alert.alert('Success', response.data.message);
        setRides(prevRides => prevRides.filter(ride => ride._id !== id));
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('Cancel Ride Error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          'Failed to cancel the booking. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  // Render individual ride item
  const renderRide = ({item}) => {
    const rideDateTime = item.rideDateTime ? new Date(item.rideDateTime) : null;
    const formattedDate = rideDateTime
      ? rideDateTime.toLocaleDateString()
      : 'N/A';
    const formattedTime = rideDateTime
      ? rideDateTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'N/A';
    return (
      <View style={styles.card}>
        <Text style={styles.detail}>
          <Text style={styles.label}>Pickup:</Text> {item.pickup || 'N/A'}
        </Text>

        <Text style={styles.detail}>
          <Text style={styles.label}>Dropoff:</Text> {item.dropoff || 'N/A'}
        </Text>

        <Text style={styles.detail}>
          <Text style={styles.label}>Vehicle:</Text> {item.vehicleType || 'N/A'}
        </Text>

        <Text style={styles.detail}>
          <Text style={styles.label}>Total Fare:</Text>{' '}
          {item.totalFare ? `Rs. ${item.totalFare}` : 'N/A'}
        </Text>

        <Text style={styles.detail}>
          <Text style={styles.label}>Ride Date:</Text> {formattedDate}
        </Text>

        <Text style={styles.detail}>
          <Text style={styles.label}>Ride Time:</Text> {formattedTime}
        </Text>

        <Text style={styles.detail}>
          <Text style={styles.label}>Status:</Text>{' '}
          <Text
            style={[
              styles.statusText,
              item.booked ? styles : styles.notBooked,
            ]}>
            {item.booked ? 'Booked' : 'Not Booked'}
          </Text>
        </Text>

        {item.booked && (
          <Text style={styles.detail}>
            <Text style={styles.label}>Driver Name:</Text>{' '}
            {item.driverName || 'Not Assigned'}
          </Text>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              Alert.alert(
                'Confirm Cancellation',
                'Are you sure you want to cancel this ride?',
                [
                  {text: 'No', style: 'cancel'},
                  {text: 'Yes', onPress: () => cancelRide(item._id)},
                ],
              );
            }}>
            <Text style={styles.buttonText}>Cancel Booking</Text>
          </TouchableOpacity>
        </View>
        {item.booked && (
          <TouchableOpacity
            style={styles.startRideButton}
            onPress={() =>
              navigation.navigate('DriverHomeScreen', {
                pickup: {
                  latitude: item.startLocation.latitude,
                  longitude: item.startLocation.longitude,
                },
                dropoff: {
                  latitude: item.endLocation.latitude,
                  longitude: item.endLocation.longitude,
                },
                driverId: item._id,
              })
            }>
            <Text style={styles.buttonText}>Proceed to Map</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Loading state before driverId is initialized
  if (loading && !driverId) {
    return (
      <View style={styles.fullScreenLoading}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Rides</Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchRides}
            disabled={loading}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e90ff" />
          <Text style={styles.loadingText}>Loading rides...</Text>
        </View>
      ) : rides.length === 0 ? (
        <View style={styles.noRideContainer}>
          <Text style={styles.noRideText}>No rides found for this driver.</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchRides}
            disabled={refreshing}>
            <Text style={styles.refreshButtonText}>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rides}
          renderItem={renderRide}
          keyExtractor={item => item._id || Math.random().toString()}
          contentContainerStyle={styles.flatListContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1e90ff']}
              tintColor={'#1e90ff'}
            />
          }
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={10}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e90ff',
    textAlign: 'center',
    marginBottom: 20,
  },
  fullScreenLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  noRideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noRideText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 10,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 15,
    marginHorizontal: 5,
  },
  detail: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
  },
  statusText: {
    fontWeight: '600',
  },
  booked: {
    color: '#388e3c',
  },
  notBooked: {
    color: '#d32f2f',
  },
  buttonContainer: {
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: '#d32f2f',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#1e90ff',
    padding: 10,
    borderRadius: 6,
    width: 100,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  refreshButton: {
    backgroundColor: '#1e90ff',
    padding: 12,
    borderRadius: 8,
    width: 120,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  startRideButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
});

export default DriverConfirmBookingScreen;
