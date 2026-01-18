
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCXwgUw1UYW_dvJiQTOqgeKBy4LefD5xXc",
  authDomain: "twiller-auth.firebaseapp.com",
  projectId: "twiller-auth",
  storageBucket: "twiller-auth.firebasestorage.app",
  messagingSenderId: "997333621748",
  appId: "1:997333621748:web:eb3ee53de59f92b72637a1"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
