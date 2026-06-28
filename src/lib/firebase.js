
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC5EyBuPfkc9giJbfIe_Ut9Cw5wYZlpC94",
  authDomain: "keraza-shark.firebaseapp.com",
  projectId: "keraza-shark",
  storageBucket: "keraza-shark.firebasestorage.app",
  messagingSenderId: "126837559653",
  appId: "1:126837559653:web:39199642dd1dcb31b0918c",
  measurementId: "G-ZCNS652NET"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Enable persistent cache for "instant" loading
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

const auth = getAuth(app);

export { db, auth };