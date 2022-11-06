const { initializeApp } = require("firebase/app");
const { getStorage } = require("firebase/storage");


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD7EJ_429hoP3oFPXhhvc6ZKSTmAG3pb3Y",
    authDomain: "csci620-a1435.firebaseapp.com",
    projectId: "csci620-a1435",
    storageBucket: "csci620-a1435.appspot.com",
    messagingSenderId: "105228030997",
    appId: "1:105228030997:web:b7cf4dcdbcf305092dea1c",
    measurementId: "G-ELGBYKPN5E"
  };

  const firebaseApp = initializeApp(firebaseConfig);

// Get a reference to the storage service, which is used to create references in your storage bucket
module.exports = getStorage(firebaseApp);