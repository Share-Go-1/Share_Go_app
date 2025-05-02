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
import DriverSelectionScreen from '../Drivers-Folder/Drivers-Selection/DriverSelectionScreen';
import axios from 'axios';
import {createStackNavigator} from '@react-navigation/stack';
import SettingsScreen from '../Riders-Folder/Navigation Screens/SettingsScreen';
const Stack = createStackNavigator();


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
  
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={
              profileImage
                ? {uri: profileImage}
                : require('../../assets/DefaultProfile.png')
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
          props.navigation.navigate('Driver'); // Make sure 'Driver' is the correct name
        }}
      />
    </DrawerContentScrollView>
  );
};

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
const DriverStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Driver"
      component={DriverSelectionScreen}
      options={{headerTitle: 'Driver Setup Screen'}}
    />
  </Stack.Navigator>
);

const AppDrawer = () => {

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
      <Drawer.Screen name="Settings" 
      component={SettingsScreen} 
      />
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
});
