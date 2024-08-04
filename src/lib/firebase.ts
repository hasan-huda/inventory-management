import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAhRQzJqQ2SzS6ojc9L4YNnibt6m3-BQTs",
  authDomain: "inventory-management-dd0bb.firebaseapp.com",
  projectId: "inventory-management-dd0bb",
  storageBucket: "inventory-management-dd0bb.appspot.com",
  messagingSenderId: "136130864659",
  appId: "1:136130864659:web:692bb87a746e8e0129c1e6",
  measurementId: "G-SEKQCSN8SJ"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore }