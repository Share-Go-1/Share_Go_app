import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {Text, View} from 'react-native';

// for the role selection screen
import RoleSelectionScreen from '../Role-Selection/RoleSelectionScreen';

// for the rider  screens
import RiderScreen from '../Riders-Folder/RiderScreen';
import RiderHomeScreen from '../Riders-Folder/RiderHomeScreen';

// for the driver screens
import DriverSelectionScreen from '../Drivers-Folder/Drivers-Selection/DriverSelectionScreen';
import BikeScreen from '../Drivers-Folder/Vechiles-Folder/Bike';
import CarScreen from  '../Drivers-Folder/Vechiles-Folder/Car';
import Driver_HomeScreen from '../Drivers-Folder/Driver_HomeScreen';

// for the documentation screens
import BasicInfoScreen from '../Documentation-Folder/BasicInfoScreen';
import CNICScreen from '../Documentation-Folder/CNICScreen';
import LincenseScreen from '../Documentation-Folder/LicenseScreen';
import VehicleInfoScreen from '../Documentation-Folder/VehicleInfoScreen';
import CarVehicleInfoScreen from '../Documentation-Folder/CarVehicleInfoScreen';

import LoginScreen from '../Login-Screen/Login';

const Stack = createStackNavigator();

function LogoTitle({title}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}>
      {/* Title next to the logo */}
      <Text style={{fontSize: 22, fontWeight: 'bold'}}>{title}</Text>
    </View>
  );
}

export default function StackNavigator({ initialRoute = 'RoleSelection' }) {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen
          name="CarvehicleInfo"
          component={CarVehicleInfoScreen}
          options={{headerTitle: () => <LogoTitle title="Vehicle Info" />}}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerTitle: () => <LogoTitle title="Login Screen" />}}
        />
        <Stack.Screen
          name="RoleSelection"
          component={RoleSelectionScreen}
          options={{
            headerTitle: () => <LogoTitle title="Select Role" />,
          }}
        />
        <Stack.Screen
          name="Driver"
          component={DriverSelectionScreen}
          options={{
            headerTitle: () => <LogoTitle title="Driver Setup Screen" />,
          }}
        />
        <Stack.Screen
          name="Rider"
          component={RiderScreen}
          options={{
            headerTitle: () => <LogoTitle title="Rider Setup Screen" />,
          }}
        />
        <Stack.Screen
          name="Driver_HomeScreen"
          component={Driver_HomeScreen}
          options={{
            headerTitle: () => <LogoTitle title="Home" />,
          }}
        />

        <Stack.Screen
          name="Rider_HomeScreen"
          component={RiderHomeScreen}
          options={{
            headerTitle: () => <LogoTitle title="Home" />,
          }}
        />
        <Stack.Screen
          name="Bike_Screen"
          component={BikeScreen}
          options={{headerTitle: () => <LogoTitle title="Bike Screen" />}}
        />
        <Stack.Screen
          name="Car_Screen"
          component={CarScreen}
          options={{headerTitle: () => <LogoTitle title="Car Screen" />}}
        />
        <Stack.Screen
          name="BasicInfoScreen"
          component={BasicInfoScreen}
          options={{headerTitle: () => <LogoTitle title="Basic Info" />}}
        />
        <Stack.Screen
          name="CNICScreen"
          component={CNICScreen}
          options={{headerTitle: () => <LogoTitle title="CNIC" />}}
        />
        <Stack.Screen
          name="LincenseScreen"
          component={LincenseScreen}
          options={{headerTitle: () => <LogoTitle title="Lincense Info" />}}
        />
        <Stack.Screen
          name="VehicleInfoScreen"
          component={VehicleInfoScreen}
          options={{headerTitle: () => <LogoTitle title="Vehicle Info" />}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
