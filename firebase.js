// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB-kD4_sL5xo3LXJDuMpQ8lAt2FOGLcpAc",
    authDomain: "remoria-1330a.firebaseapp.com",
    projectId: "remoria-1330a",
    storageBucket: "remoria-1330a.firebasestorage.app",
    messagingSenderId: "47311670878",
    appId: "1:47311670878:web:d67453967792370c6a6ecf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function saveVault(vaultId, vaultData) {
    await setDoc(doc(db, "vaults", vaultId), vaultData);
}

export async function loadVault(vaultId) {
    const snap = await getDoc(doc(db, "vaults", vaultId));

    if (!snap.exists()) {
        return null;
    }

    return snap.data();
}
export { app };