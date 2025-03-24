// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCfdTzXxkkNZCP0Zv3AjkoYnHefu0EOSKw",
  authDomain: "my-trading-app-9997d.firebaseapp.com",
  projectId: "my-trading-app-9997d",
  storageBucket: "my-trading-app-9997d.firebasestorage.app",
  messagingSenderId: "377160018436",
  appId: "1:377160018436:web:c2a4f355bc9c4872af6351",
  measurementId: "G-Z11676Z57K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
