// firebase.js
// Import the necessary SDKs (using CDN modular imports)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
    getFirestore,
    doc,
    setDoc,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
// NEW: Import getAuth for user authentication
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js"; 


// Your web app's Firebase configuration (using the provided placeholder)
const firebaseConfig = {
    apiKey: "AIzaSyB27qi63OfGLv-X0lVy5S6lSPDS098KjTM",
    authDomain: "smart-traffic-light-cont-aa81c.firebaseapp.com",
    projectId: "smart-traffic-light-cont-aa81c",
    storageBucket: "smart-traffic-light-cont-aa81c.firebasestorage.app",
    messagingSenderId: "1069266794669",
    appId: "1:1069266794669:web:2eb9773c63fe514bc0ee24",
    measurementId: "G-L2D0ZG4LHV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services and export them
export const db = getFirestore(app); // Export db for use in script.js
export const auth = getAuth(app); // NEW: Export auth for login/security checks

// Reference to your main document in Firestore
export const trafficRef = doc(db, "traffic", "signalState");

// Export necessary functions
export { doc, setDoc, onSnapshot, serverTimestamp };
