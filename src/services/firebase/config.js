import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDhZQAbwhyNxiMfEBYeV3d1kK_WyGc5Ekw",
  authDomain: "gashub-cab1c.firebaseapp.com",
  projectId: "gashub-cab1c",
  storageBucket: "gashub-cab1c.firebasestorage.app",
  messagingSenderId: "1083880426899",
  appId: "1:1083880426899:web:dc28e5763221fcbae1ec66",
  measurementId: "G-311L4D97BM"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);

if (!app || !auth || !db) {
  console.error('Firebase inicialization error!');
}

export { app, auth, db };
