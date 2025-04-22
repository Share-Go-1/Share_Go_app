import notifee, { TriggerType } from '@notifee/react-native';
import dayjs from 'dayjs';
import { PermissionsAndroid, Platform } from 'react-native';

// 🔥 Notification Permission Request (For Android 13+)
export const requestNotificationPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return false;
};

// 🔥 Schedule a Notification at a Fixed Time
export const scheduleNotification = async () => {
  await notifee.requestPermission(); // Ask for permission

  const notificationTime = dayjs().startOf('day').add(1, 'hour').valueOf(); // 🔥 Rozana subah 1 bajay
  
  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: notificationTime,
  };

  await notifee.createTriggerNotification(
    {
      title: '🚗 ShareGo Reminder',
      body: 'Book your ride now and save costs!',
      android: { channelId: 'default' },
    },
    trigger
  );
};

// 🔥 Function to Schedule Recurring Notifications (Every 2 Hours)
export const scheduleRecurringNotifications = async () => {
  for (let i = 0; i < 12; i++) {
    const notificationTime = dayjs().add(i * 2, 'hour').valueOf(); // 🔥 Every 2 Hours

    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: notificationTime,
    };

    await notifee.createTriggerNotification(
      {
        title: '🚕 Share a Ride!',
        body: 'Find a driver near you and save fuel costs!',
        android: { channelId: 'default' },
      },
      trigger
    );
  }
};
