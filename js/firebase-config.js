const firebaseConfig = {
  apiKey: "AIzaSyA6bhCVasmWVrguGWATezNwtvezI0Zzaes",
  authDomain: "karee3ge-bd680.firebaseapp.com",
  projectId: "karee3ge-bd680",
  storageBucket: "karee3ge-bd680.firebasestorage.app",
  messagingSenderId: "94269195097",
  appId: "1:94269195097:web:476af2d99729ad9d5e0248"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();