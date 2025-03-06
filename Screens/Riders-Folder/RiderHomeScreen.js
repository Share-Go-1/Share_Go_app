import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import {BASE_URL} from '../../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Screens
import HomeScreen from './Navigation Screens/HomeScreen';
import ConfirmBookingScreen from './Navigation Screens/ConfirmBookingScreen';
import PostRideScreen from './Navigation Screens/PostRideScreen';
import SearchRideScreen from './Navigation Screens/SearchRideScreen';
import ChatScreen from './Navigation Screens/ChatScreen';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const RiderHomeScreen = () => {
  const [riderId, setRiderId] = useState(null);
  const [riderName, setRiderName] = useState('');

  // Fetching Rider Id
  useEffect(() => {
    const fetchRiderId = async () => {
      try {
        const id = await AsyncStorage.getItem('riderId');
        if (id) {
          setRiderId(id);
          fetchRiderDetails(id);
        }
      } catch (error) {
        console.error('Error retrieving rider ID:', error);
      }
    };
    fetchRiderId();
  }, []);

  const fetchRiderDetails = async id => {
    try {
      const response = await axios.get(`${BASE_URL}/riders/${id}`);
      setRiderName(response.data.firstName);
    } catch (error) {
      console.error('Error fetching rider details:', error);
    }
  };

  return riderName;
};
//Profile Picture
const CustomDrawerContent = props => {
  const [profileImage, setProfileImage] = useState(null);
  const riderName = RiderHomeScreen();

  const pickImage = () => {
    const options = {mediaType: 'photo', quality: 1};
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        Alert.alert('Cancelled', 'Image selection was cancelled.');
      } else if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };
  // Drawer
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={
              profileImage
                ? {uri: profileImage}
                : require('../../assets/default-profile.png')
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>
        //Username
        <TextInput
          style={styles.username}
          value={riderName}
          onChangeText={text => setRiderName(text)}
          placeholder="Enter your name"
          placeholderTextColor="#999"
        />{' '}
      </View>

      <DrawerItem
        label="History"
        onPress={() => props.navigation.navigate('History')}
      />
      <DrawerItem
        label="Settings"
        onPress={() => props.navigation.navigate('Settings')}
      />
      <DrawerItem
        label="Driver Mode"
        onPress={() => props.navigation.navigate('DriverMode')}
      />
    </DrawerContentScrollView>
  );
};
//Bottom Navigation
const BottomTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarShowLabel: false,
      tabBarStyle: styles.tabBar,
      headerShown: false,
    }}>
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({color, size}) => (
          <Icon name="home" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="ConfirmBooking"
      component={ConfirmBookingScreen}
      options={{
        tabBarIcon: ({color, size}) => (
          <Icon name="check-circle" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="PostRide"
      component={PostRideScreen}
      options={({navigation}) => ({
        tabBarButton: () => (
          <TouchableOpacity
            style={styles.plusButtonContainer}
            onPress={() => navigation.navigate('PostRide')}>
            <View style={styles.plusButton}>
              <Icon name="plus" size={26} color="white" />
            </View>
          </TouchableOpacity>
        ),
      })}
    />
    <Tab.Screen
      name="SearchRide"
      component={SearchRideScreen}
      options={{
        tabBarIcon: ({color, size}) => (
          <Icon name="search" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Chat"
      component={ChatScreen}
      options={{
        tabBarIcon: ({color, size}) => (
          <Icon name="comments" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

const AppDrawer = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const riderName = RiderHomeScreen();
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name="RiderHome"
        component={BottomTabNavigator}
        options={{
          title: riderName ? `Welcome, ${riderName}` : 'Welcome, Rider',
        }}
      />
      <Drawer.Screen
        name="History"
        component={() => (
          <View style={styles.screen}>
            <Text>History Screen</Text>
          </View>
        )}
      />
      <Drawer.Screen
        name="Settings"
        component={() => (
          <View style={styles.container}>
            <TouchableOpacity style={styles.option} activeOpacity={0.7}>
              <Text style={styles.optionText}>🔔 Notifications</Text>
              <Switch
                value={isEnabled}
                onValueChange={setIsEnabled}
                style={styles.switch}
                trackColor={{false: '#d3d3d3', true: '#4caf50'}} // Gray when disabled, green when enabled
                thumbColor={isEnabled ? '#ffffff' : '#b0b0b0'} // White when enabled, light gray when disabled
              />
            </TouchableOpacity>

            <TouchableOpacity
        style={styles.option}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.optionText}>🔒 Privacy Policy</Text>
      </TouchableOpacity>

      {/* Modal for Privacy Policy */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <Text style={styles.modalText}>
              Welcome to ShareGo! Your privacy is important to us. We ensure that your personal
              information is protected and not shared with third parties without your consent.
              Our ride-sharing app collects necessary data to improve your experience.
            </Text>
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
              <Text style={[styles.optionText, {color: 'red'}]}>
                🚪 Log Out
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Drawer.Screen
        name="DriverMode"
        component={() => (
          <View style={styles.screen}>
            <Text>Driver Mode Screen</Text>
          </View>
        )}
      />
    </Drawer.Navigator>
  );
};

export default function App() {
  return <AppDrawer />;
}

const styles = StyleSheet.create({
  drawerHeader: {alignItems: 'center', marginBottom: 20, paddingTop: 20},
  profileImage: {width: 80, height: 80, borderRadius: 40, marginBottom: 10},
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
  },
  tabBar: {backgroundColor: '#fff', height: 60, borderTopWidth: 0},
  plusButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -20,
  },
  plusButton: {
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screen: {flex: 1, justifyContent: 'center', alignItems: 'center'},

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
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
