import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAg_YmxD9kqkkyBPaxkNoH8TINIuq5J9Us",
    authDomain: "chat-app-a9673.firebaseapp.com",
    projectId: "chat-app-a9673",
    storageBucket: "chat-app-a9673.appspot.com",
    messagingSenderId: "1030139178912",
    appId: "1:1030139178912:web:af246e5a84458e541c7ec5"
  };

// Initialize Firebase
const fireApp = initializeApp(firebaseConfig);

const auth = getAuth(fireApp);
const firestore = getFirestore(fireApp);


export {auth,firestore};