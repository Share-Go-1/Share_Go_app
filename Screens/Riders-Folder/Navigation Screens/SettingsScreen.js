import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import useNotifications from '../Navigation Screens/Notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../../../config/config';

const SettingsScreen = ({navigation}) => {
  // const [isEnabled, setIsEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [riderId, setRiderId] = useState(null);
  const {isEnabled, toggleNotifications} = useNotifications();

  useEffect(() => {
    // Fetch rider ID from AsyncStorage
    const fetchRiderId = async () => {
      try {
        const storedRiderId = await AsyncStorage.getItem('riderId');
        if (storedRiderId) {
          setRiderId(storedRiderId);
        }
      } catch (error) {
        console.error('Error fetching rider ID:', error);
      }
    };
    fetchRiderId();
  }, []);

  const handleDeleteAccount = async () => {
    if (!riderId) {
      Alert.alert('Error', 'Rider ID not found. Please try again.');
      return;
    }

    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete your account? This action is irreversible.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await fetch(
                `${BASE_URL}/riders/${riderId}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                },
              );

              const responseData = await response.json();

              if (response.ok) {
                await AsyncStorage.removeItem('riderId'); // Clear stored data
                setLoading(false);
                Alert.alert(
                  'Deleted',
                  'Your account has been deleted successfully.',
                );
                navigation.replace('Signup'); // Redirect to Signup screen
              } else {
                setLoading(false);
                Alert.alert(
                  'Error',
                  responseData.message ||
                    'Failed to delete account. Please try again.',
                );
              }
            } catch (error) {
              setLoading(false);
              Alert.alert(
                'Error',
                'Network error. Please check your connection.',
              );
              console.error('Delete Account Error:', error);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.option} activeOpacity={0.7}>
        <Text style={styles.optionText}>🔔 Notifications</Text>
        <Switch
          value={isEnabled}
          onValueChange={toggleNotifications}
          style={styles.switch}
          trackColor={{false: '#d3d3d3', true: '#4caf50'}}
          thumbColor={isEnabled ? '#ffffff' : '#b0b0b0'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.option}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.optionText}>🔒 Privacy Policy</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <Text style={styles.modalText}>
              Welcome to ShareGo! Your privacy is important to us. We ensure
              that your personal information is protected and not shared with
              third parties without your consent.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('PrivacyPolicy');
              }}>
              <Text style={styles.linkText}>Read Full Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.option} onPress={handleDeleteAccount}>
        <Text style={[styles.optionText, {color: 'red'}]}>
          🗑️ Delete Account
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, styles.logout]}
        onPress={async () => {
          setLoading(true);
          await AsyncStorage.removeItem('riderId'); // Optional: Clear session data
          setTimeout(() => {
            setLoading(false);
            navigation.replace('Login');
          }, 2000); // 2 seconds delay
        }}>
        <Text style={[styles.optionText, {color: 'red'}]}>🚪 Log Out</Text>
      </TouchableOpacity>

      {loading && (
        <Modal animationType="fade" transparent visible={loading}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#4caf50" />
              <Text style={styles.loadingText}>Processing...</Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  switch: {
    transform: [{scaleX: 1.2}, {scaleY: 1.2}],
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  linkText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  closeButton: {
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default SettingsScreen;
