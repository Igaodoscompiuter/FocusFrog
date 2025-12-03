// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4iDYWSOU9Naqp9O29f1pvzXfS8v6K5fU",
  authDomain: "focusfroggit-81838821-bbab8.firebaseapp.com",
  projectId: "focusfroggit-81838821-bbab8",
  storageBucket: "focusfroggit-81838821-bbab8.firebasestorage.app",
  messagingSenderId: "878346894346",
  appId: "1:878346894346:web:c0517918bd73569e1f73f3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };
