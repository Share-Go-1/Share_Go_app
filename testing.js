import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const openCageKey = 'e670c19735ce491caae138c921e2e51e';
const openRouteServiceKey = '5b3ce3597851110001cf6248e9cc9c298c3e43d7a9cb400fbd66d825';

const DistanceCalculatorScreen = () => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [distance, setDistance] = useState(null);

  const getCoordinates = async (place) => {
    try {
      const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
        params: {
          q: `${place}, Lahore, Pakistan`,
          key: openCageKey,
          countrycode: 'pk',
          limit: 1,
        },
      });

      if (response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry;
        return { latitude: lat, longitude: lng };
      } else {
        throw new Error(`No results for ${place}`);
      }
    } catch (error) {
      console.error('OpenCage Error:', error.message);
      throw error;
    }
  };

  const getDrivingDistanceFromORS = async (startCoords, endCoords) => {
    try {
      const url = `https://api.openrouteservice.org/v2/directions/driving-car`;
      console.log(startCoords, endCoords);
      const response = await axios.get(url, {
        params: {
          api_key: openRouteServiceKey,
          start: `${startCoords.longitude},${startCoords.latitude}`,
          end: `${endCoords.longitude},${endCoords.latitude}`,
        },
      });

      const meters = response.data.features[0].properties.segments[0].distance;
      const km = meters / 1000;
      return km;
    } catch (error) {
      console.error('OpenRouteService Error:', error.message);
      throw error;
    }
  };

  const handleCalculate = async () => {
    if (!pickup || !destination) {
      Alert.alert('Please enter both Pickup and Destination');
      return;
    }

    try {
      const pickupLocation = await getCoordinates(pickup);
      const destLocation = await getCoordinates(destination);

      setPickupCoords(pickupLocation);
      setDestCoords(destLocation);

      const realDistance = await getDrivingDistanceFromORS(pickupLocation, destLocation);
      setDistance(realDistance.toFixed(2));
    } catch (error) {
      Alert.alert('Error calculating distance. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Distance Calculator (Lahore)</Text>

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

      <Button title="Calculate Distance" onPress={handleCalculate} color="#1e90ff" />

      {pickupCoords && (
        <Text style={styles.coordText}>
          Pickup Coordinates: {pickupCoords.latitude}, {pickupCoords.longitude}
        </Text>
      )}

      {destCoords && (
        <Text style={styles.coordText}>
          Destination Coordinates: {destCoords.latitude}, {destCoords.longitude}
        </Text>
      )}

      {distance && (
        <Text style={styles.result}>Driving Distance: {distance} km</Text>
      )}
    </View>
  );
};

export default DistanceCalculatorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
  },
  coordText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  result: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
    textAlign: 'center',
  },
});
