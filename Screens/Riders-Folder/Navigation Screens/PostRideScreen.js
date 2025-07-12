import React, {useState, useEffect} from 'react';
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
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {BASE_URL} from '../../../config/config';

const openCageKey = 'e670c19735ce491caae138c921e2e51e';
const openRouteServiceKey =
  '5b3ce3597851110001cf6248e9cc9c298c3e43d7a9cb400fbd66d825';

export default function PostRideScreen() {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vehicleType, setVehicleType] = useState('car');
  const [fare, setFare] = useState(null);
  const [riderId, setRiderId] = useState('');
  const [postedRides, setPostedRides] = useState([]);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [fuelPrice, setFuelPrice] = useState(); // State for FUEL_PRICE

  const Bike_BASE_FARE = 50;
  const Car_BASE_FARE = 100;
  const VEHICLE_CONSUMPTION = {bike: 40, car: 13};
  const SHAREGO_PERCENTAGE = {bike: 0.1, car: 0.1};

  // Fetch rider ID
  useEffect(() => {
    const fetchRiderId = async () => {
      try {
        const id = await AsyncStorage.getItem('riderId');
        if (id) {
          setRiderId(id);
        }
      } catch (error) {
        console.error('Error retrieving rider ID:', error);
      }
    };
    fetchRiderId();
  }, []);

  useEffect(() => {
    const fetchFuelPrice = async () => {
      try {
        const response = await fetch(`${BASE_URL}/Fuel-price`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const petrolString = data?.prices?.petrol;

          if (petrolString) {
            // Remove "Rs." and "/Ltr", keep numeric part only
            const numericPrice = parseFloat(
              petrolString.replace(/Rs\.|\/Ltr/g, ''), // Remove "Rs." and "/Ltr" specifically
            );
            if (!isNaN(numericPrice)) {
              setFuelPrice(numericPrice);
              console.log('Numeric Petrol Price:', numericPrice);
            } else {
              console.error('Invalid petrol price format');
              setFuelPrice(null);
            }
          } else {
            console.error('Petrol price not found in response');
            setFuelPrice(null);
          }
        } else {
          console.error('Failed to fetch fuel price');
          setFuelPrice(null);
        }
      } catch (error) {
        console.error('Error fetching fuel price:', error);
        setFuelPrice(null);
      }
    };

    fetchFuelPrice();
  }, []);

  const toggleVehicleType = type => {
    setVehicleType(type);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const getCoordinates = async place => {
    try {
      const response = await axios.get(
        'https://api.opencagedata.com/geocode/v1/json',
        {
          params: {
            q: `${place}, Lahore, Pakistan`,
            key: openCageKey,
            countrycode: 'pk',
            limit: 1,
          },
        },
      );

      if (response.data.results.length > 0) {
        const {lat, lng} = response.data.results[0].geometry;
        return {latitude: lat, longitude: lng};
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

  const calculateFare = km => {
    if (!fuelPrice) {
      Alert.alert('Error', 'Fuel price not available. Please try again later.');
      return {totalFare: null, sharegoEarning: null};
    }

    const BASE_FARE = vehicleType === 'bike' ? Bike_BASE_FARE : Car_BASE_FARE;
    const fuelNeeded = km / VEHICLE_CONSUMPTION[vehicleType];
    const fuelCost = fuelNeeded * fuelPrice;
    const subtotal = BASE_FARE + fuelCost;
    const sharegoEarning = subtotal * SHAREGO_PERCENTAGE[vehicleType];
    const totalFare = Math.round(subtotal + sharegoEarning).toFixed(2);
    return {totalFare, sharegoEarning: sharegoEarning.toFixed(2)};
  };

  const handleConfirm = selectedDate => {
    const currentDate = new Date();
    if (selectedDate.getTime() < currentDate.getTime()) {
      Alert.alert(
        'Invalid Time',
        'Please select a future date and time.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Keep the picker open to allow re-selection
              setDatePickerVisible(true);
            },
          },
        ],
        {cancelable: false},
      );
      return;
    }
    setSelectedDateTime(selectedDate);
    hideDatePicker();
  };

  // Only calculates fare and distance
  const handleCalculateFare = async () => {
    const currentDate = new Date();
    if (!pickup || !destination || !selectedDateTime) {
      Alert.alert('Please enter Pickup, Destination, and select Date & Time');
      return;
    }
    if (selectedDateTime.getTime() < currentDate.getTime()) {
      Alert.alert(
        'Invalid Time',
        'Selected date and time cannot be in the past.',
      );
      return;
    }

    try {
      setLoading(true);
      const pickupLocation = await getCoordinates(pickup);
      const destLocation = await getCoordinates(destination);

      if (!pickupLocation || !destLocation) {
        throw new Error('Failed to retrieve coordinates');
      }

      setPickupCoords(pickupLocation);
      setDestCoords(destLocation);

      const realDistance = await getDrivingDistanceFromORS(
        pickupLocation,
        destLocation,
      );
      setDistance(realDistance.toFixed(2));

      const {totalFare, sharegoEarning} = calculateFare(realDistance);
      if (!totalFare) {
        setLoading(false);
        Alert.alert('Error', 'Failed to calculate fare.');
        return;
      }
      setFare(totalFare);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert(
        'Error',
        'Error calculating distance. Please try again.',
      );
      console.error(error);
    }
  };

  // Only posts the ride after fare is calculated
  const handlePostRide = async () => {
    if (!pickupCoords || !destCoords || !distance || !fare || !selectedDateTime) {
      Alert.alert('Please calculate fare first and fill all details.');
      return;
    }
    try {
      setLoading(true);
      const {sharegoEarning} = calculateFare(parseFloat(distance));
      await uploadRideDetails(
        pickup,
        destination,
        pickupCoords,
        destCoords,
        parseFloat(distance),
        fare,
        sharegoEarning,
        selectedDateTime,
      );
      setPostedRides(prev => [
        ...prev,
        {
          pickup,
          destination,
          distance,
          totalFare: fare,
          sharegoEarning,
          dateTime: selectedDateTime.toISOString(),
          booked: false,
          driverId: null,
        },
      ]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Error posting ride. Please try again.');
      console.error(error);
    }
  };

  const uploadRideDetails = async (
    pickup,
    destination,
    pickupCoords,
    destCoords,
    distance,
    fare,
    sharegoEarning,
    dateTime,
  ) => {
    try {
      const payload = {
        riderId,
        vehicleType,
        startLocation: {
          latitude: pickupCoords.latitude,
          longitude: pickupCoords.longitude,
        },
        endLocation: {
          latitude: destCoords.latitude,
          longitude: destCoords.longitude,
        },
        distance,
        totalFare: parseFloat(fare),
        commissionFare: parseFloat(sharegoEarning),
        pickupCoords,
        pickup,
        dropoff: destination,
        destCoords,
        rideDateTime: dateTime.toISOString(),
        booked: false, // Default unbooked
        driverId: null, // No driver initially
        driverName: null, // Add driverName
      };
      console.log('Sending payload:', payload);

      const response = await fetch(`${BASE_URL}/riderpost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('Raw Response:', responseText);

      if (responseText.startsWith('<')) {
        console.error('Server returned HTML error page:', responseText);
        Alert.alert('Error', 'Server returned an error page (HTML).');
        return;
      }

      try {
        const result = JSON.parse(responseText);
        if (response.ok) {
          Alert.alert('Success', 'Ride details uploaded successfully!');
        } else {
          console.error('Upload failed:', result);
          Alert.alert(
            'Failed',
            result.message || 'Failed to upload ride details.',
          );
        }
      } catch (error) {
        console.error('JSON parse error:', error);
        Alert.alert('Error', 'Failed to parse response.');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Error', 'Error uploading ride details.');
    }
  };

  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior="padding">
      <ScrollView contentContainerStyle={styles.container}>
        {riderId ? (
          <Text style={{textAlign: 'center', marginBottom: 10}}>
            👤 Rider ID: {riderId}
          </Text>
        ) : null}

        <Text style={styles.title}>ShareGo - Distance & Fare</Text>

        <View style={styles.card}>
          <View style={styles.toggleContainer}>
            {['car', 'bike'].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.toggleButton,
                  vehicleType === type && styles.selectedButton,
                ]}
                onPress={() => toggleVehicleType(type)}>
                <Text
                  style={[
                    styles.toggleText,
                    vehicleType === type && styles.selectedText,
                  ]}>
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.vehicleLabel}>
            Selected:{' '}
            <Text style={{fontWeight: 'bold'}}>
              {vehicleType.toUpperCase()}
            </Text>
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

          <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
            <Text style={styles.dateButtonText}>
              {selectedDateTime
                ? selectedDateTime.toLocaleString()
                : 'Select Date & Time'}
            </Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="datetime"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
            minimumDate={new Date()}
            minuteInterval={5} // Optional: 5-minute increments
          />

          <TouchableOpacity style={styles.calcButton} onPress={handleCalculateFare}>
            <Text style={styles.calcButtonText}>Fare</Text>
          </TouchableOpacity>

          

          {loading && (
            <ActivityIndicator
              size="large"
              color="#1e90ff"
              style={{marginTop: 20}}
            />
          )}

          {distance && (
            <Text style={styles.result}>Distance: {distance} km</Text>
          )}

          {fare && (
            <Text style={styles.result}>Estimated Fare: Rs. {fare}</Text>
          )}

          {selectedDateTime && (
            <Text style={styles.result}>
              Scheduled: {selectedDateTime.toLocaleString()}
            </Text>
          )}

          <TouchableOpacity style={[styles.calcButton, {backgroundColor: '#28a745', marginTop: 10}]} onPress={handlePostRide}>
            <Text style={[styles.calcButtonText, {color: '#fff'}]}>Post</Text>
          </TouchableOpacity>
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
  dateButton: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    alignItems: 'center',
  },
  dateButtonText: {
    color: '#333',
    fontSize: 16,
  },
  postedRidesContainer: {
    marginTop: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  rideItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  rideText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
});
