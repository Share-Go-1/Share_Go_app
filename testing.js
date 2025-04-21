import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import axios from 'axios';

const openCageKey = 'e670c19735ce491caae138c921e2e51e';
const openRouteServiceKey = '5b3ce3597851110001cf6248e9cc9c298c3e43d7a9cb400fbd66d825';

export default function Testing() {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vehicleType, setVehicleType] = useState('car');
  const [fare, setFare] = useState(null);

  const FUEL_PRICE = 255;
  const Bike_BASE_FARE = 50;
  const Car_BASE_FARE = 100;
  const VEHICLE_CONSUMPTION = { bike: 40, car: 13 };
  const SHAREGO_PERCENTAGE = { bike: 0.10, car: 0.10 };

  const toggleVehicleType = (type) => {
    setVehicleType(type);
  };

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
      throw error;
    }
  };

  const getDrivingDistanceFromORS = async (startCoords, endCoords) => {
    const profile = vehicleType === 'bike' ? 'cycling-regular' : 'driving-car';
    const url = `https://api.openrouteservice.org/v2/directions/${profile}`;

    const response = await axios.get(url, {
      params: {
        api_key: openRouteServiceKey,
        start: `${startCoords.longitude},${startCoords.latitude}`,
        end: `${endCoords.longitude},${endCoords.latitude}`,
      },
    });

    const meters = response.data.features[0].properties.segments[0].distance;
    return meters / 1000;
  };

  const calculateFare = (km) => {
    const BASE_FARE = vehicleType === 'bike' ? Bike_BASE_FARE : Car_BASE_FARE;
    const fuelNeeded = km / VEHICLE_CONSUMPTION[vehicleType];
    const fuelCost = fuelNeeded * FUEL_PRICE;
    const subtotal = BASE_FARE + fuelCost;
    const sharegoEarning = subtotal * SHAREGO_PERCENTAGE[vehicleType];
    return Math.round(subtotal + sharegoEarning).toFixed(2);
  };

  const handleCalculate = async () => {
    if (!pickup || !destination) {
      Alert.alert('Please enter both Pickup and Destination');
      return;
    }

    try {
      setLoading(true);
      const pickupLocation = await getCoordinates(pickup);
      const destLocation = await getCoordinates(destination);

      setPickupCoords(pickupLocation);
      setDestCoords(destLocation);

      const realDistance = await getDrivingDistanceFromORS(pickupLocation, destLocation);
      setDistance(realDistance.toFixed(2));

      const totalFare = calculateFare(realDistance);
      setFare(totalFare);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Error calculating distance. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>ShareGo - Distance & Fare</Text>

        <View style={styles.card}>
          <View style={styles.toggleContainer}>
            {['car', 'bike'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.toggleButton,
                  vehicleType === type && styles.selectedButton,
                ]}
                onPress={() => toggleVehicleType(type)}
              >
                <Text style={[
                  styles.toggleText,
                  vehicleType === type && styles.selectedText,
                ]}>
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.vehicleLabel}>
            Selected: <Text style={{ fontWeight: 'bold' }}>{vehicleType.toUpperCase()}</Text>
          </Text>

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

          <TouchableOpacity style={styles.calcButton} onPress={handleCalculate}>
            <Text style={styles.calcButtonText}>Calculate Distance</Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator size="large" color="#1e90ff" style={{ marginTop: 20 }} />}

          {pickupCoords && (
            <Text style={styles.coordText}>
              🚩 Pickup: {pickupCoords.latitude}, {pickupCoords.longitude}
            </Text>
          )}

          {destCoords && (
            <Text style={styles.coordText}>
              🎯 Destination: {destCoords.latitude}, {destCoords.longitude}
            </Text>
          )}

          {distance && (
            <Text style={styles.result}>Distance: {distance} km</Text>
          )}

          {fare && (
            <Text style={styles.result}>Estimated Fare: Rs. {fare}</Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
  },
  calcButton: {
    backgroundColor: '#1e90ff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  calcButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  result: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
    textAlign: 'center',
  },
  coordText: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
    color: '#444',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 8,
  },
  selectedButton: {
    backgroundColor: '#1e90ff',
  },
  toggleText: {
    color: '#333',
    fontWeight: '600',
  },
  selectedText: {
    color: '#fff',
  },
  vehicleLabel: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
});