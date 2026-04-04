// Importation des modules Firebase via CDN (plus simple pour le développement sans installation)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- TA CONFIGURATION RÉCUPÉRÉE ---
const firebaseConfig = {
  apiKey: "AIzaSyCFdqeYWFwtGKcH-Lw_67YVlM9ktfj2L0U",
  authDomain: "arcademaster-28111.firebaseapp.com",
  projectId: "arcademaster-28111",
  storageBucket: "arcademaster-28111.firebasestorage.app",
  messagingSenderId: "399637508560",
  appId: "1:399637508560:web:e054c43b6762d9806e09d5",
  measurementId: "G-L2FFWRJGVG"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const SESSION_KEY = 'ArcadeMaster_UserID';

// ==========================================
// SYSTÈME DE COMPTE (INSCRIPTION / CONNEXION)
// ==========================================

// Inscription (Sauvegarde sur le Cloud Firestore)
window.register = async function(username, password) {
    const userRef = doc(db, "users", username.toLowerCase());
    try {
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            alert("🚨 Pseudo déjà pris ! Choisissez-en un autre.");
            return { success: false };
        }

        const userData = {
            username: username,
            password: password,
            coins: 200000,
            isAdmin: (username.toLowerCase() === "zelda5962"), // Ton pseudo admin
            skins: { active: 'vessel_base', owned: ['vessel_base'] },
            scores: { invaders: 0 }
        };

        await setDoc(userRef, userData);
        localStorage.setItem(SESSION_KEY, username.toLowerCase());
        alert("✅ Bienvenue ! Compte créé et synchronisé sur le Cloud.");
        return { success: true };
    } catch (error) {
        console.error("Erreur d'inscription:", error);
        alert("Erreur technique lors de l'inscription.");
    }
};

// Connexion (Vérification sur le Cloud Firestore)
window.login = async function(username, password) {
    const userRef = doc(db, "users", username.toLowerCase());
    try {
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            alert("❌ Ce compte n'existe pas ! Inscrivez-vous.");
            return false;
        }

        const data = userSnap.data();
        if (data.password !== password) {
            alert("❌ Mot de passe incorrect !");
            return false;
        }

        localStorage.setItem(SESSION_KEY, username.toLowerCase());
        return true;
    } catch (error) {
        console.error("Erreur de connexion:", error);
        return false;
    }
};

// Déconnexion
window.logout = function() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
};

// ==========================================
// GESTION DES DONNÉES UTILISATEUR
// ==========================================

// Récupérer l'utilisateur actuellement connecté
window.getCurrentUser = async function() {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    try {
        const userSnap = await getDoc(doc(db, "users", id));
        return userSnap.exists() ? userSnap.data() : null;
    } catch (error) {
        return null;
    }
};

// Mettre à jour les données (Pièces, Skins, Scores)
window.updateUser = async function(updates) {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return;
    try {
        const userRef = doc(db, "users", id);
        await updateDoc(userRef, updates);
        // Rafraîchir la barre de pièces si la fonction existe
        if (window.updateTopBar) window.updateTopBar();
    } catch (error) {
        console.error("Erreur mise à jour:", error);
    }
};

// Récupérer TOUS les utilisateurs (Pour Admin et Classements)
window.getUsersData = async function() {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        let allUsers = {};
        querySnapshot.forEach((doc) => {
            allUsers[doc.id] = doc.data();
        });
        return allUsers;
    } catch (error) {
        console.error("Erreur récupération liste:", error);
        return {};
    }
};

// Supprimer un compte (Admin)
window.deleteUser = async function(id) {
    try {
        await deleteDoc(doc(db, "users", id));
    } catch (error) {
        console.error("Erreur suppression:", error);
    }
};
