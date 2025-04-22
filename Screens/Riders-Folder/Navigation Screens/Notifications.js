import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useNotifications = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const loadNotificationPreference = async () => {
      const storedValue = await AsyncStorage.getItem('notificationsEnabled');
      setIsEnabled(storedValue === 'true');
    };
    loadNotificationPreference();
  }, []);

  const toggleNotifications = async (value) => {
    console.log("🚀 Toggle Button Pressed, Value:", value);
    
    setIsEnabled(value);
    console.log("🔄 State Updated: isEnabled =", value);

    await AsyncStorage.setItem('notificationsEnabled', value.toString());
    console.log("💾 AsyncStorage Updated:", await AsyncStorage.getItem('notificationsEnabled'));

    if (value) {
      console.log("🔔 Requesting Notification Permission...");
      await requestNotificationPermission();
      console.log("✅ Permission Requested");
    } else {
      console.log("🔕 Notifications Disabled");
    }
};


const requestNotificationPermission = async () => {
  console.log("🔍 Checking Notification Permission...");
  
  if (Platform.OS === 'android') {
      console.log("📱 Android Device Detected");

      PushNotification.requestPermissions().then((result) => {
          if (result.alert || result.badge || result.sound) {
              console.log("✅ Notification permission granted.");
          } else {
              Alert.alert("Permission Denied", "Please enable notifications in settings.");
          }
      }).catch((error) => {
          console.log("⚠️ Error requesting notification permission:", error);
      });
  }
};

  return { isEnabled, toggleNotifications };
};

export default useNotifications;
