import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
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
import DriverSelectionScreen from '../Drivers-Folder/Drivers-Selection/DriverSelectionScreen';
import axios from 'axios';
import {createStackNavigator} from '@react-navigation/stack';
import SettingsScreen from '../Drivers-Folder/Driver Navigation Screen/DriverSettingsScreen';

// Screens
import HomeScreen from './Driver Navigation Screen/DriverHomeScreen';
import ConfirmBookingScreen from './Driver Navigation Screen/DriverConfirmBookingScreen';
import PostRideScreen from './Driver Navigation Screen/DriverPostRideScreen';
import SearchRideScreen from './Driver Navigation Screen/DriverSearchRideScreen';
import ChatScreen from './Driver Navigation Screen/DriverChatScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

// Custom Drawer Content updated to use driverName and setDriverName from props
const CustomDrawerContent = props => {
  const [profileImage, setProfileImage] = useState(null);
  const {driverName, setDriverName} = props;

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
        {/* Username */}
        <TextInput
          style={styles.username}
          value={driverName}
          onChangeText={text => setDriverName(text)}
          placeholder="Enter your name"
          placeholderTextColor="#999"
        />
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
        onPress={() => {
          console.log('Navigating to Driver');
          props.navigation.navigate('Driver');
        }}
      />
    </DrawerContentScrollView>
  );
};

// Bottom Tab Navigator remains unchanged
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

// Driver Stack Navigator remains unchanged
const DriverStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Driver"
      component={DriverSelectionScreen}
      options={{headerTitle: 'Driver Setup Screen'}}
    />
  </Stack.Navigator>
);

// AppDrawer now accepts driverName and setDriverName as props and passes them to CustomDrawerContent
const AppDrawer = ({driverName, setDriverName}) => {
  return (
    <Drawer.Navigator
      drawerContent={props => (
        <CustomDrawerContent
          {...props}
          driverName={driverName}
          setDriverName={setDriverName}
        />
      )}>
      <Drawer.Screen
        name="DriverHome"
        component={BottomTabNavigator}
        options={{
          title: driverName ? `Welcome, ${driverName}` : 'Welcome, Driver',
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
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen
        name="DriverMode"
        component={() => (
          <View style={styles.screen}>
            <Text>Driver Mode Screen</Text>
          </View>
        )}
      />
      <Drawer.Screen name="DriverStack" component={DriverStackNavigator} />
    </Drawer.Navigator>
  );
};

// The top-level App component now manages the driver's state and fetches driver details
export default function App() {
  const [driverId, setDriverId] = useState(null);
  const [driverName, setDriverName] = useState('');

  useEffect(() => {
    const fetchDriverId = async () => {
      try {
        const id = await AsyncStorage.getItem('driverId');
        if (id) {
          setDriverId(id);
          fetchDriverDetails(id);
        }
      } catch (error) {
        console.error('Error retrieving Driver ID:', error);
      }
    };
    fetchDriverId();
  }, []);

  const fetchDriverDetails = async id => {
    try {
      const response = await axios.get(`${BASE_URL}/drivers/${id}`);
      setDriverName(response.data.basicInfo.firstName);
      console.log(response);
    } catch (error) {
      console.error('Error fetching Driver details:', error);
    }
  };

  return <AppDrawer driverName={driverName} setDriverName={setDriverName} />;
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
});
