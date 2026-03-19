import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, remove, push } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDwThJ-lnNTCxKUOdXJkJn5P-GLi8Xb6zs",
  authDomain: "gails-tracker.firebaseapp.com",
  databaseURL: "https://gails-tracker-default-rtdb.firebaseio.com",
  projectId: "gails-tracker",
  storageBucket: "gails-tracker.firebasestorage.app",
  messagingSenderId: "7089218482",
  appId: "1:7089218482:web:c315bcb79a894dd5807aab",
  measurementId: "G-2CDK28KW74"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, onValue, set, remove, push };
