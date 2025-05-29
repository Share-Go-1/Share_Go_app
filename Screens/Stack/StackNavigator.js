import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import PrivacyPolicyScreen from '../Riders-Folder/Navigation Screens/PrivacyPolicyScreen';

import DriverPrivacyPolicy from '../Drivers-Folder/Driver Navigation Screen/DriverPrivacyPolicyScreen';
import DriverMainHomeScreen from '../Drivers-Folder/DriverMainHomeScreen';
import HomeScreen from '../Riders-Folder/Navigation Screens/HomeScreen';

// for the role selection screen
import RoleSelectionScreen from '../Role-Selection/RoleSelectionScreen';

// for the rider screens
import RiderScreen from '../Riders-Folder/RiderScreen';
import RiderHomeScreen from '../Riders-Folder/RiderHomeScreen';

// for the driver screens
import DriverSelectionScreen from '../Drivers-Folder/Drivers-Selection/DriverSelectionScreen';
import BikeScreen from '../Drivers-Folder/Vechiles-Folder/Bike';
import CarScreen from '../Drivers-Folder/Vechiles-Folder/Car';
import Driver_HomeScreen from '../Drivers-Folder/Driver_HomeScreen';
import DriverHomeScreen from '../Drivers-Folder/Driver Navigation Screen/DriverHomeScreen';

// for the documentation screens
import BasicInfoScreen from '../Documentation-Folder/BasicInfoScreen';
import CNICScreen from '../Documentation-Folder/CNICScreen';
import LincenseScreen from '../Documentation-Folder/LicenseScreen';
import VehicleInfoScreen from '../Documentation-Folder/VehicleInfoScreen';
import CarVehicleInfoScreen from '../Documentation-Folder/CarVehicleInfoScreen';

// for the login and sign-up screens
import LoginScreen from '../Login and Signup/LoginScreen';
import SignupScreen from '../Login and Signup/SignupScreen';

import Testing from '../../testing';

import DriverPostRideScreen from '../Drivers-Folder/Driver Navigation Screen/DriverPostRideScreen';
import APP from '../Drivers-Folder/DriverMainHomeScreen';
const Stack = createStackNavigator();

export default function StackNavigator({initialRoute = 'RoleSelection'}) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false, // This will hide the header for all screens
        }}>
        <Stack.Screen name="Home" component={APP} />
        <Stack.Screen name="PostRideScreen" component={DriverPostRideScreen} /> 
        <Stack.Screen name="Testing" component={Testing} />
        <Stack.Screen name="CarvehicleInfo" component={CarVehicleInfoScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="Driver" component={DriverSelectionScreen} />
        <Stack.Screen name="Rider" component={RiderScreen} />
        <Stack.Screen name="Driver_HomeScreen" component={Driver_HomeScreen} />
        <Stack.Screen name="DriverHomeScreen" component={DriverHomeScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="Rider_HomeScreen" component={RiderHomeScreen} />
        <Stack.Screen name="Bike_Screen" component={BikeScreen} />
        <Stack.Screen name="Car_Screen" component={CarScreen} />
        <Stack.Screen name="BasicInfoScreen" component={BasicInfoScreen} />
        <Stack.Screen name="CNICScreen" component={CNICScreen} />
        <Stack.Screen name="LincenseScreen" component={LincenseScreen} />
        <Stack.Screen name="VehicleInfoScreen" component={VehicleInfoScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DriverPrivacyPolicy" component={DriverPrivacyPolicy} options={{ headerShown: false }} />
        <Stack.Screen name="DriverMainHomeScreen" component={DriverMainHomeScreen} options={{ headerShown: false }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
