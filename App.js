import React, { useEffect } from 'react';
import 'react-native-url-polyfill/auto';
import { SafeAreaView, StyleSheet } from 'react-native';
import StackNavigator from './Screens/Stack/StackNavigator';
import { requestNotificationPermission, scheduleNotification, scheduleRecurringNotifications } from '../Share_Go_app/android/app/src/utils/notificationService';

export default function App() {

  useEffect(() => {
    const setupNotifications = async () => {
      const permissionGranted = await requestNotificationPermission();
      if (permissionGranted) {
        scheduleNotification(); // 🔥 Schedule Fixed Notification (9 AM)
        scheduleRecurringNotifications(); // 🔥 Schedule Every 2 Hours
      }
    };
    
    setupNotifications();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StackNavigator initialRoute={'Login'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
