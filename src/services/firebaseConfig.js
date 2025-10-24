// src/services/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVlIrkTKXSKZD8xk_cvZlkYghVvVHliB8",
  authDomain: "cashpilot-72594.firebaseapp.com",
  projectId: "cashpilot-72594",
  storageBucket: "cashpilot-72594.firebasestorage.app",
  messagingSenderId: "787849063073",
  appId: "1:787849063073:web:cfcd07ff22f3e90d525ee0"
};
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
