import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../../config/config';

const openCageKey = 'e670c19735ce491caae138c921e2e51e';
const openRouteServiceKey = '5b3ce3597851110001cf6248e9cc9c298c3e43d7a9cb400fbd66d825';

export default function DriverPostRideScreen() {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vehicleType, setVehicleType] = useState('car');
  const [fare, setFare] = useState(null);
  const [driverId, setDriverId] = useState('');
  const [postedRides, setPostedRides] = useState([]);

  const FUEL_PRICE = 255;
  const Bike_BASE_FARE = 50;
  const Car_BASE_FARE = 100;
  const VEHICLE_CONSUMPTION = { bike: 40, car: 13 };
  const SHAREGO_PERCENTAGE = { bike: 0.10, car: 0.10 };

  useEffect(() => {
    const fetchDriverId = async () => {
      try {
        const id = await AsyncStorage.getItem('driverId');
        if (id) setDriverId(id);
      } catch (err) {
        console.error('Error retrieving driver ID:', err);
      }
    };
    fetchDriverId();
  }, []);

  const toggleVehicleType = (type) => setVehicleType(type);

  const getCoordinates = async (place) => {
    const { data } = await axios.get(
      'https://api.opencagedata.com/geocode/v1/json',
      { params: { q: `${place}, Lahore, Pakistan`, key: openCageKey, countrycode: 'pk', limit: 1 } }
    );
    if (data.results.length === 0) throw new Error(`No results for ${place}`);
    const { lat, lng } = data.results[0].geometry;
    return { latitude: lat, longitude: lng };
  };

  const getDrivingDistanceFromORS = async (start, end) => {
    const profile = vehicleType === 'bike' ? 'cycling-regular' : 'driving-car';
    const { data } = await axios.get(
      `https://api.openrouteservice.org/v2/directions/${profile}`,
      { params: { api_key: openRouteServiceKey, start: `${start.longitude},${start.latitude}`, end: `${end.longitude},${end.latitude}` } }
    );
    const meters = data.features[0].properties.segments[0].distance;
    return meters / 1000;
  };

  const calculateFare = (km) => {
    const base = vehicleType === 'bike' ? Bike_BASE_FARE : Car_BASE_FARE;
    const fuelNeeded = km / VEHICLE_CONSUMPTION[vehicleType];
    const fuelCost = fuelNeeded * FUEL_PRICE;
    const subtotal = base + fuelCost;
    const commission = subtotal * SHAREGO_PERCENTAGE[vehicleType];
    const total = (subtotal + commission).toFixed(2);
    return { totalFare: total, commission: commission.toFixed(2) };
  };

  const handleCalculate = async () => {
    if (!pickup || !destination) {
      return Alert.alert('Error', 'Please enter both pickup and destination.');
    }
    try {
      setLoading(true);
      const start = await getCoordinates(pickup);
      const end = await getCoordinates(destination);
      setPickupCoords(start);
      setDestCoords(end);

      const kms = await getDrivingDistanceFromORS(start, end);
      setDistance(kms.toFixed(2));

      const { totalFare, commission } = calculateFare(kms);
      setFare(totalFare);

      await uploadRideDetails(start, end, kms, totalFare, commission);

      setPostedRides(prev => [
        { pickup, destination, distance: kms.toFixed(2), totalFare },
        ...prev
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Calculation or upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const uploadRideDetails = async (start, end, km, totalFare, commission) => {
    const payload = {
      driverId,
      vehicleType,
      startLocation: start,
      endLocation: end,
      distance: km,
      totalFare: parseFloat(totalFare),
      commissionFare: parseFloat(commission),
      pickup,
      dropoff: destination
    };
  
    try {
      const res = await fetch(`${BASE_URL}/driverpost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
  
      // Check if the response is OK (status code 200-299)
      if (!res.ok) {
        Alert.alert('Error', 'Failed to post ride. Please try again.');
        throw new Error('Failed to post ride');
      }
  
      const data = await res.json();
  
      // Handle success - Display success message
      if (data.message === 'Ride post created successfully') {
        Alert.alert('Success', 'Ride posted successfully!');
      } else {
        Alert.alert('Error', 'Failed to post ride. Please try again.');
      }
  
    } catch (error) {
      console.error('Error creating driver post:', error);
    }
  };
  

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Post a Ride</Text>

        <View style={styles.card}>
          <View style={styles.toggleContainer}>
            {['car','bike'].map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.toggleBtn, vehicleType===type && styles.selectedBtn]}
                onPress={()=>toggleVehicleType(type)}>
                <Text style={[styles.toggleTxt, vehicleType===type&& styles.selectedTxt]}>
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Selected: {vehicleType.toUpperCase()}</Text>
          <TextInput style={styles.input} placeholder="Pickup Location" value={pickup} onChangeText={setPickup} />
          <TextInput style={styles.input} placeholder="Destination Location" value={destination} onChangeText={setDestination} />

          <TouchableOpacity style={styles.button} onPress={handleCalculate}>
            <Text style={styles.buttonTxt}>Calculate & Post</Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator size="large" color="#1e90ff" style={{marginTop:20}} />}
          {pickupCoords && <Text style={styles.coord}>📍 {pickupCoords.latitude}, {pickupCoords.longitude}</Text>}
          {destCoords   && <Text style={styles.coord}>🏁 {destCoords.latitude}, {destCoords.longitude}</Text>}
          {distance     && <Text style={styles.result}>Distance: {distance} km</Text>}
          {fare         && <Text style={styles.result}>Fare: Rs. {fare}</Text>}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow:1, padding:20, paddingTop:50, backgroundColor:'#f1f4f6' },
  idText: { textAlign:'center', marginBottom:10, color:'#555' },
  title:  { fontSize:24, fontWeight:'bold', color:'#1e90ff', textAlign:'center', marginBottom:20 },
  card:   { backgroundColor:'#fff', borderRadius:15, padding:20, elevation:4, shadowColor:'#000', shadowOpacity:0.1, shadowRadius:10 },
  toggleContainer: { flexDirection:'row', justifyContent:'center', marginBottom:15 },
  toggleBtn:       { padding:10, borderRadius:10, backgroundColor:'#eee', marginHorizontal:8 },
  selectedBtn:     { backgroundColor:'#1e90ff' },
  toggleTxt:       { fontWeight:'600', color:'#333' },
  selectedTxt:     { color:'#fff' },
  label:           { textAlign:'center', marginBottom:10, color:'#555' },
  input:           { backgroundColor:'#f9f9f9', borderRadius:10, padding:14, borderWidth:1, borderColor:'#ddd', marginBottom:15 },
  button:          { backgroundColor:'#1e90ff', padding:14, borderRadius:10, alignItems:'center', marginTop:10 },
  buttonTxt:       { color:'#fff', fontSize:16, fontWeight:'bold' },
  coord:           { marginTop:10, fontSize:14, textAlign:'center', color:'#444' },
  result:          { marginTop:20, fontSize:18, fontWeight:'bold', color:'green', textAlign:'center' },
  postedContainer: { marginTop:30, paddingTop:10, borderTopWidth:1, borderTopColor:'#ccc' },
  section:         { fontSize:20, fontWeight:'bold', marginBottom:10, color:'#333' },
  item:            { backgroundColor:'#fff', padding:15, borderRadius:10, marginBottom:10, elevation:2 },
  itemTxt:         { fontSize:14, color:'#444', marginBottom:4 }
});