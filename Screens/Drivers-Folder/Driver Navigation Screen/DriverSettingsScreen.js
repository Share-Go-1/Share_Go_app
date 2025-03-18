import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Modal,
  StyleSheet,
} from 'react-native';

const DriverSettingsScreen = ({navigation}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.option} activeOpacity={0.7}>
        <Text style={styles.optionText}>🔔 Notifications</Text>
        <Switch
          value={isEnabled}
          onValueChange={setIsEnabled}
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

      <TouchableOpacity
        style={styles.option}
        onPress={() => console.log('Account Delete clicked')}>
        <Text style={styles.optionText}>🗑️ Delete Account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, styles.logout]}
        onPress={() => console.log('Logout clicked')}>
        <Text style={[styles.optionText, {color: 'red'}]}>🚪 Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

// Add your styles here
const styles = StyleSheet.create({
  // settings
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3, // Android shadow effect
    shadowColor: '#000', // iOS shadow
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  icon: {
    fontSize: 20,
    color: '#555',
  },
  logoutText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  switch: {
    transform: [{scaleX: 1.2}, {scaleY: 1.2}],
    marginLeft: 10,
  },

  //privacy policy
  optionText: {
    color: 'black',
    fontSize: 16,
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
});

export default DriverSettingsScreen;
