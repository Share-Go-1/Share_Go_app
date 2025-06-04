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

const ConfirmBookingScreen = ({route, navigation}) => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [riderId, setRiderId] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const initializeRiderId = async () => {
      try {
        let storedRiderId = await AsyncStorage.getItem('riderId');
        console.log('Rider ID from AsyncStorage:', storedRiderId);

        if (!storedRiderId && route.params?.riderId) {
          storedRiderId = route.params.riderId;
          console.log('Rider ID from route.params:', storedRiderId);
          await AsyncStorage.setItem('riderId', storedRiderId);
        }

        if (!storedRiderId) {
          throw new Error('Rider ID not found. Please log in.');
        }

        setRiderId(storedRiderId);
        console.log('Set Rider ID:', storedRiderId);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    initializeRiderId();
  }, [route.params]);

  const fetchRides = useCallback(async () => {
    if (!riderId) return;

    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/riderpost/${riderId}`, {
       // params: {booked: false},
        params: {booked: true},
      });
      
      setRides(response.data.rides); // Assuming response.data.rides
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch rides.';
      console.error(
        'Fetch Rides Error Details:',
        error.message,
        error.response?.data,
      );
      Alert.alert('Error', message);
      setRides([]);
    } finally {
      setLoading(false);
    }
  }, [riderId]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  useEffect(() => {
    console.log('Rides state:', rides);
  }, [rides]);

  const onRefresh = useCallback(async () => {
    if (!riderId) return;

    setRefreshing(true);
    try {
      const response = await axios.get(`${BASE_URL}/riderpost/${riderId}`, {
        params: {booked: false},
      });
      console.log('Refresh Rides Response:', response.data);
      setRides(response.data.rides);
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to refresh rides.';
      console.error(
        'Refresh Rides Error Details:',
        error.message,
        error.response?.data,
      );
      Alert.alert('Error', message);
    } finally {
      setRefreshing(false);
    }
  }, [riderId]);

  const cancelRide = async id => {
    setLoading(true);
    try {
      const response = await axios.delete(`${BASE_URL}/riderpost/delete/${id}`);
      if (response.data.success) {
        Alert.alert('Success', response.data.message);
        // After cancelling, remove the ride from the local state
        setRides(prevRides => prevRides.filter(ride => ride._id !== id));
      } else {
        Alert.alert('Error', response.data.message);
      }
    } catch (error) {
      console.error('Error cancelling ride:', error);
      Alert.alert('Error', 'Failed to cancel the booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };
   

  const renderRide = ({item}) => {
     console.log("Rendering ride:", item);
    // Format date and time separately
    const rideDateTime = item.rideDateTime ? new Date(item.rideDateTime) : null;
    const formattedDate = rideDateTime
      ? rideDateTime.toLocaleDateString()
      : 'N/A';
    const formattedTime = rideDateTime
      ? rideDateTime.toLocaleTimeString()
      : 'N/A';

    return (
      <View style={styles.card}>
        {/* Pickup */}
        <Text style={styles.detail}>
          <Text style={styles.label}>Pickup:</Text> {item.pickup || 'N/A'}
        </Text>

        {/* Dropoff */}
        <Text style={styles.detail}>
          <Text style={styles.label}>Dropoff:</Text> {item.dropoff || 'N/A'}
        </Text>

        {/* Vehicle Type */}
        <Text style={styles.detail}>
          <Text style={styles.label}>Vehicle:</Text> {item.vehicleType || 'N/A'}
        </Text>

        {/* Total Fare */}
        <Text style={styles.detail}>
          <Text style={styles.label}>Total Fare:</Text>{' '}
          {item.totalFare ? `Rs. ${item.totalFare}` : 'N/A'}
        </Text>

        {/* Ride Date */}
        <Text style={styles.detail}>
          <Text style={styles.label}>Ride Date:</Text> {formattedDate}
        </Text>

        {/* Ride Time */}
        <Text style={styles.detail}>
          <Text style={styles.label}>Ride Time:</Text> {formattedTime}
        </Text>

        {/* Booked Status */}
        <Text style={styles.detail}>
          <Text style={styles.label}>Status:</Text>{' '}
          <Text
            style={[
              styles.statusText,
              item.booked ? styles.booked : styles.notBooked,
            ]}>
            {item.booked ? 'Booked' : 'Not Booked'}
          </Text>
        </Text>

        {/* Driver Name (only if booked is true) */}
        {item.booked && (
          <View>
            <Text style={styles.detail}>
              <Text style={styles.label}>Driver Name:</Text>{' '}
              {item.driverName || 'Not Assigned'}
            </Text>
            <Text style={styles.detail}>
              <Text style={styles.label}>Driver Number:</Text>{' '}
              {item.driverNumber || 'Not Assigned'}
            </Text>
            <Text style={styles.detail}>
              <Text style={styles.label}>vehicle Color:</Text>{' '}
              {item.driverVechileColor || 'Not Assigned'}
            </Text>
            <Text style={styles.detail}>
              <Text style={styles.label}>Vehicle Model:</Text>{' '}
              {item.driverVechileModel || 'Not Assigned'}
            </Text>
            <Text style={styles.detail}>
              <Text style={styles.label}>Vehicle Number:</Text>{' '}
              {item.driverVechileNumber || 'Not Assigned'}
            </Text>
          </View>
        )}

        {/* Cancel Booking Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => cancelRide(item._id)} // Correctly passing the ID from `item._id`
          >
            <Text style={styles.buttonText}>Cancel Booking</Text>
          </TouchableOpacity>
        </View>
         {item.booked && (
                  <TouchableOpacity
                    style={styles.startRideButton}
                    onPress={() =>
                      navigation.navigate('HomeScreen', {
                        pickup: {
                          latitude: item.startLocation.latitude,
                          longitude: item.startLocation.longitude,
                        },
                        dropoff: {
                          latitude: item.endLocation.latitude,
                          longitude: item.endLocation.longitude,
                        },
                        riderId: item._id,
                      })
                    }>
                    <Text style={styles.buttonText}>Proceed to Map</Text>
                  </TouchableOpacity>
                )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Rides</Text>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e90ff" />
          <Text style={styles.loadingText}>Loading rides...</Text>
        </View>
      ) : rides.length === 0 ? (
        <View style={styles.noRideContainer}>
          <Text style={styles.noRideText}>No rides found for this rider.</Text>
        </View>
      ) : (
        <FlatList
          data={rides}
          renderItem={renderRide}
          keyExtractor={item => item._id || Math.random().toString()}
          contentContainerStyle={styles.flatListContent}
          style={styles.flatList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1e90ff']}
              tintColor={'#1e90ff'}
            />
          }
          showsVerticalScrollIndicator={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={21}
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
    backgroundColor: '#f1f4f6',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e90ff',
    textAlign: 'center',
    marginBottom: 30,
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
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    alignItems: 'center',
    marginTop: 30,
  },
  noRideText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 20,
    marginHorizontal: 10,
  },
  detail: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  label: {
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
  },
  booked: {
    color: '#28a745', // Green for booked
  },
  notBooked: {
    color: '#dc3545', // Red for not booked
  },
  buttonContainer: {
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  startRideButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,                  
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ConfirmBookingScreen;

