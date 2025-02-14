import React, { useEffect, useState } from 'react';
import { getMessaging, getToken } from 'firebase/messaging';
import { app } from '../firebase';

export default function usePushNotification() {
  const [webToken, setWebToken] = useState('');
  const messaging = getMessaging(app);

  useEffect(() => {

    const getPushNotificationToken = async () => {
      try {
        const token = await getToken(messaging, {
          vapidKey: 'BKEfC5hX9SZt7T2oaIMvFK4jnJk537iHO0gSljLqU_1lUG29IbxIU6AJ7Fh5f0MOM4cZh5xCfnekMz9Zmifi83E',
        });
        if (token) {
          console.log('FCM Token:', token);
          setWebToken(token);
        } else {
          console.log('No registration token available.');
        }
      } catch (error) {
        console.error('Error getting FCM token:', error.message);
      }
    };

    const requestPermission = async () => {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        getPushNotificationToken();
      } else {
        console.error('Notification permission denied.');
      }
    };

    requestPermission();
  }, []);

  return { webToken };
}
