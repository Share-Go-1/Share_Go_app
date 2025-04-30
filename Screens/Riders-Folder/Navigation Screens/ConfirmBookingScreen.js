import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';

const ConfirmBookingScreen = ({ route, navigation }) => {
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route.params?.ride) {
      setRide(route.params.ride);
    }
  }, [route.params]);

  const handlePayment = async (paymentMethod) => {
    if (!ride) {
      Alert.alert('No Ride Selected', 'Please select a ride before proceeding to payment.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://your-backend.com/initiate-payment', {
        amount: ride.totalFare,
        paymentMethod,
      });
      if (response.data.success) {
        Alert.alert('Payment Successful', 'Your payment has been completed successfully.');
        navigation.navigate('BookingSuccess');
      } else {
        Alert.alert('Payment Failed', 'Unable to complete the payment.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while initiating payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = () => {
    setRide(null);
    Alert.alert('Cancelled', 'Your ride booking has been cancelled.');
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Confirm Booking</Text>

      {!ride ? (
        <View style={styles.noRideContainer}>
          <Text style={styles.noRideText}>No ride selected. Please select a ride to proceed with booking.</Text>
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.detail}><Text style={styles.label}>Pickup:</Text> {ride.pickup}</Text>
            <Text style={styles.detail}><Text style={styles.label}>Dropoff:</Text> {ride.dropoff}</Text>
            <Text style={styles.detail}><Text style={styles.label}>Vehicle:</Text> {ride.vehicleType}</Text>
            <Text style={styles.detail}><Text style={styles.label}>Distance:</Text> {ride.distance} km</Text>
            <Text style={styles.detail}><Text style={styles.label}>Fare:</Text> Rs. {ride.totalFare}</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#1e90ff" style={{ marginTop: 30 }} />
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.confirmButton} onPress={() => handlePayment('jazzcash')}>
                <Text style={styles.buttonText}>Pay with JazzCash</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={() => handlePayment('card')}>
                <Text style={styles.buttonText}>Pay with Card</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelBooking}>
                <Text style={styles.buttonText}>Cancel Booking</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#f1f4f6',
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e90ff',
    textAlign: 'center',
    marginBottom: 30,
  },
  noRideContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    alignItems: 'center',
  },
  noRideText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },
  detail: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  label: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 30,
  },
  confirmButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
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
});

export default ConfirmBookingScreen;
