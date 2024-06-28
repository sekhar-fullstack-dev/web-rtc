import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  };

// Initialize Firebase
const fireApp = initializeApp(firebaseConfig);

const auth = getAuth(fireApp);
const firestore = getFirestore(fireApp);


export {auth,firestore};