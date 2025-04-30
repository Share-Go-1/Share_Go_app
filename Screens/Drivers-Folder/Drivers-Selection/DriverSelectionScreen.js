import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const DriverSelectionScreen = ({navigation}) => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleVehicleSelect = vehicle => {
    console.log(`Vehicle selected: ${vehicle}`);
    setSelectedVehicle(vehicle);
  };

  const handleNext = () => {
    if (selectedVehicle === 'Bike') {
      console.log('Navigating to BikeScreen');
      navigation.navigate('Bike_Screen');
    } else if (selectedVehicle === 'Car') {
      console.log('Navigating to CarScreen');
      navigation.navigate('Car_Screen');
    } else {
      Alert.alert('Please select a vehicle before proceeding.');
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../../assets/logo.png')} // Update with your logo path
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Select Your Role</Text>

      {/* Vehicle Buttons */}
      <View style={styles.buttonContainer}>
        {/* Bike Button */}
        <TouchableOpacity
          style={[
            styles.vehicleButton,
            selectedVehicle === 'Bike' && styles.selectedButton,
          ]}
          onPress={() => handleVehicleSelect('Bike')}>
          <Icon name="bike" size={50} color="#fff" />
          <Text style={styles.buttonText}>Bike</Text>
        </TouchableOpacity>

        {/* Car Button */}
        <TouchableOpacity
          style={[
            styles.vehicleButton,
            selectedVehicle === 'Car' && styles.selectedButton,
          ]}
          onPress={() => handleVehicleSelect('Car')}>
          <Icon name="car" size={50} color="#fff" />
          <Text style={styles.buttonText}>Car</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Button */}
      <TouchableOpacity style={styles.footerButton} onPress={handleNext}>
        <View style={styles.footerButtonBackground}>
          <Text style={styles.footerButtonText}>Next</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 50,
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 300,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 40,
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 50,
    marginTop: 10,
  },
  vehicleButton: {
    width: 120,
    height: 120,
    backgroundColor: '#969696',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginHorizontal: 10,
  },
  selectedButton: {
    backgroundColor: 'green',
    borderWidth: 2,
    borderColor: '#fff',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 10,
  },
  footerButton: {
    position: 'absolute',
    bottom: 30,
    width: '80%',
  },
  footerButtonBackground: {
    backgroundColor: 'green',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DriverSelectionScreen;
