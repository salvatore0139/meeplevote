import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

  const firebaseConfig = {
    apiKey: "AIzaSyB3qHmnhUuT4nyfP71QPA6Ft3C3tq5XF-8",
    authDomain: "sitowebgiochidatavolo.firebaseapp.com",
    projectId: "sitowebgiochidatavolo",
    storageBucket: "sitowebgiochidatavolo.firebasestorage.app",
    messagingSenderId: "131392565466",
    appId: "1:131392565466:web:edc742f14acd556d7e75e3",
    measurementId: "G-F7Y1VLVM3V"
  };

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
