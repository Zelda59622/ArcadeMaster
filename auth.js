// Importation des modules Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- TA CONFIGURATION FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCFdqeYWFwtGKcH-Lw_67YVlM9ktfj2L0U",
  authDomain: "arcademaster-28111.firebaseapp.com",
  projectId: "arcademaster-28111",
  storageBucket: "arcademaster-28111.firebasestorage.app",
  messagingSenderId: "399637508560",
  appId: "1:399637508560:web:e054c43b6762d9806e09d5",
  measurementId: "G-L2FFWRJGVG"
};

// Initialisation
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const SESSION_KEY = 'ArcadeMaster_UserID';

// --- INSCRIPTION ---
window.register = async function(username, password) {
    console.log("Tentative d'inscription pour:", username);
    const userRef = doc(db, "users", username.toLowerCase().trim());
    
    try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            alert("🚨 Pseudo déjà pris !");
            return { success: false };
        }

        const userData = {
            username: username.trim(),
            password: password,
            coins: 200000,
            isAdmin: (username.toLowerCase().trim() === "zelda5962"),
            skins: { active: 'vessel_base', owned: ['vessel_base'] },
            scores: { invaders: 0 }
        };

        await setDoc(userRef, userData);
        localStorage.setItem(SESSION_KEY, username.toLowerCase().trim());
        return { success: true };
    } catch (e) {
        console.error("Erreur Firebase Register:", e);
        alert("Erreur: " + e.message);
        return { success: false };
    }
};

// --- CONNEXION ---
window.login = async function(username, password) {
    console.log("Tentative de connexion pour:", username);
    const userRef = doc(db, "users", username.toLowerCase().trim());
    
    try {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            alert("❌ Ce compte n'existe pas !");
            return false;
        }

        const data = userSnap.data();
        if (data.password !== password) {
            alert("❌ Mot de passe incorrect !");
            return false;
        }

        localStorage.setItem(SESSION_KEY, username.toLowerCase().trim());
        return true;
    } catch (e) {
        console.error("Erreur Firebase Login:", e);
        alert("Erreur connexion: " + e.message);
        return false;
    }
};

// --- AUTRES FONCTIONS ---
window.getCurrentUser = async function() {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    const userSnap = await getDoc(doc(db, "users", id));
    return userSnap.exists() ? userSnap.data() : null;
};

window.logout = function() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
};
