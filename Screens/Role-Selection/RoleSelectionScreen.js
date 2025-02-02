import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const RoleSelectionScreen = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = async (role) => {
    try {
      // Save selected role to AsyncStorage
      await AsyncStorage.setItem('userRole', role);
      setSelectedRole(role); // Update selected role in state
    } catch (error) {
      console.error('Error saving user role:', error);
    }
  };

  const handleCreateProfile = () => {
    if (selectedRole === 'Driver') {
      navigation.navigate('Driver');
    } else if (selectedRole === 'Rider') {
      navigation.navigate('Rider');
    } else {
      Alert.alert('Please select a role before proceeding.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Select Your Role</Text>

      {/* Role Buttons */}
      <View style={styles.buttonContainer}>
        {/* Driver Button */}
        <TouchableOpacity
          style={[
            styles.roleButton,
            selectedRole === 'Driver' && styles.selectedButton,
          ]}
          onPress={() => handleRoleSelect('Driver')}
        >
          <Icon name="car" size={50} color="#fff" />
          <Text style={styles.buttonText}>Driver</Text>
        </TouchableOpacity>

        {/* Rider Button */}
        <TouchableOpacity
          style={[
            styles.roleButton,
            selectedRole === 'Rider' && styles.selectedButton,
          ]}
          onPress={() => handleRoleSelect('Rider')}
        >
          <Icon name="human" size={50} color="#fff" />
          <Text style={styles.buttonText}>Rider</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Button */}
      <TouchableOpacity style={styles.footerButton} onPress={handleCreateProfile}>
        <View style={styles.footerButtonBackground}>
          <Text style={styles.footerButtonText}>Create Your Profile</Text>
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
    width: 180,
    height: 180,
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
  },
  roleButton: {
    width: 120,
    height: 120,
    backgroundColor: '#969696',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
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
    shadowOffset: { width: 0, height: 3 },
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

export default RoleSelectionScreen;
