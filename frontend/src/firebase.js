// src/firebase.js
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyB_DiemM4b5k3HXB1rgbRVc_KAdGy4R9cw",
  authDomain: "neuroboost-bb20d.firebaseapp.com",
  projectId: "neuroboost-bb20d",
  storageBucket: "neuroboost-bb20d.appspot.com",
  messagingSenderId: "37251131871",
  appId: "1:37251131871:web:f6391693c6f1b50a493c6a",
  measurementId: "G-7J8ZMLW6ZY"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app) 