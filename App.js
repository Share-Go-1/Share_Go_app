import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import StackNavigator from './Screens/Stack/StackNavigator';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [initialRoute, setInitialRoute] = useState('RoleSelection');

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        if (role === 'Driver') {
          setInitialRoute('Driver_HomeScreen');
        } else if (role === 'Rider') {
          setInitialRoute('Rider_HomeScreen');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };

    checkUserRole();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StackNavigator initialRoute={initialRoute} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
