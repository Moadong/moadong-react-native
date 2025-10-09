import { Platform } from 'react-native';

type FirebaseConfig = {
  appId: string;
  apiKey: string;
  projectId: string;
  messagingSenderId: string;
  storageBucket: string;
  databaseURL?: string;
};

const IOS_CONFIG: FirebaseConfig = {
  appId: '1:514481945377:ios:aba8f321386606712fdc60',
  apiKey: 'AIzaSyAJJew6P42ZydrETXo1Z_I2fxe3rDsvfrU',
  projectId: 'moadong-isgood',
  messagingSenderId: '514481945377',
  storageBucket: 'moadong-isgood.firebasestorage.app',
  databaseURL: 'https://moadong-isgood.firebaseio.com',
};

const ANDROID_CONFIG: FirebaseConfig = {
  appId: '1:514481945377:android:5a1cbdc85cae8e392fdc60',
  apiKey: 'AIzaSyAQKlngsv-7xzmhf-7sSkNep5VSXWi6p9Q',
  projectId: 'moadong-isgood',
  messagingSenderId: '514481945377',
  storageBucket: 'moadong-isgood.firebasestorage.app',
  databaseURL: 'https://moadong-isgood.firebaseio.com',
};

export const firebaseConfig: FirebaseConfig =
  Platform.OS === 'android'
    ? ANDROID_CONFIG
    : Platform.OS === 'ios'
      ? IOS_CONFIG
      : IOS_CONFIG;
