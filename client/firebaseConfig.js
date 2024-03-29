// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD35IPsPnvT0JGE0fHgOpGBrrndgDuP-ew",
    authDomain: "citygems-cd7c2.firebaseapp.com",
    projectId: "citygems-cd7c2",
    storageBucket: "citygems-cd7c2.appspot.com",
    messagingSenderId: "58770010994",
    appId: "1:58770010994:web:3c0187f4ed8b21acbd23eb",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
