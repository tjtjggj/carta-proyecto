<script type="module">
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';


const firebaseConfig = {
apiKey: "AIzaSyCUK_81DaHBwpwn0QeMecHz31-iGdQRPZQ",
authDomain: "proyecto-a0fa4.firebaseapp.com",
projectId: "proyecto-a0fa4",
storageBucket: "proyecto-a0fa4.firebasestorage.app",
messagingSenderId: "939752172250",
appId: "1:939752172250:web:556bc36271270db47c13e3",
measurementId: "G-BDXJ1C7YTD"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
signInAnonymously(auth).catch(()=>{});


// expose minimal helpers for the non-module main script
window.__FIREBASE = { db, storage };
</script>

