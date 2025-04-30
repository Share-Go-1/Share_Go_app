import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const BookingSuccessScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Successful!</Text>
      <Text style={styles.message}>Your ride booking has been successfully confirmed. Thank you for using our service!</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f4f6',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1e90ff',
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

export default BookingSuccessScreen;
