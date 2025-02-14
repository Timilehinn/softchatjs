import { initializeApp  } from 'firebase/app';
import 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCydSX8CiavBjo9eKvFrPQWgiMRchbretA",
  authDomain: "softchatjs.firebaseapp.com",
  projectId: "softchatjs",
  storageBucket: "softchatjs.firebasestorage.app",
  messagingSenderId: "225913236480",
  appId: "1:225913236480:web:313a7a8184eeb2d600bce5",
  measurementId: "G-3S5PR9W9E0"
};

export const app = initializeApp(firebaseConfig);