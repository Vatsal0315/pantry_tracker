
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB6CyVm3MXZUA68DcTpS56vJbLzW2NIJZA",
  authDomain: "pantry-tracker-9f103.firebaseapp.com",
  projectId: "pantry-tracker-9f103",
  storageBucket: "pantry-tracker-9f103.appspot.com",
  messagingSenderId: "73291066681",
  appId: "1:73291066681:web:d1c19dd6f9176c5b0c8ce8",
  measurementId: "G-WLELMJ8S9T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
const auth = getAuth(app);

export { firestore, auth };