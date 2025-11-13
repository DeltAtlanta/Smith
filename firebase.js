// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚡ Firebase configuration
const firebaseConfig = {
apiKey: "AIzaSyDzJF_77nQmhdouQHtVt-u_sssosXQSr_c",
authDomain: "smith-af23d.firebaseapp.com",
projectId: "smith-af23d",
storageBucket: "smith-af23d.appspot.com",
messagingSenderId: "101524753445",
appId: "1:101524753445:web:37850a330ee92ab87903cc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
