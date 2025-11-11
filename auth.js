/**
 * Fichier : auth.js
 * Description : Gère l'authentification, la persistance des données utilisateur 
 * (scores, pièces, rôles), et les fonctionnalités Admin.
 * Ce script doit être inclus après base.js.
 */

const ADMIN_USERNAME = "Zelda5962";

// =========================================================
// 1. GESTION DU LOCAL STORAGE ET DONNÉES DE BASE
// =========================================================

/**
 * Charge les données utilisateur depuis localStorage.
 * Initialise un compte 'admin' si ce n'est pas déjà fait.
 * @returns {Array} Liste des utilisateurs.
 */
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('arcadeMasterUsers')) || [];
    
    // Assure l'existence du compte Admin par défaut
    const adminExists = users.some(user => user.username === ADMIN_USERNAME);
    if (!adminExists) {
        users.push({
            username: ADMIN_USERNAME,
            password: 'admin', // Mot de passe initial
            role: 'admin',
            coins: 500, // Pièces de départ pour l'admin
            profilePic: 'default.png',
            highScores: {}, // {gameName: score}
            isDeleted: false,
            deletionReason: null
        });
        saveUsers(users);
        console.log(`Compte Admin '${ADMIN_USERNAME}' créé.`);
    }
    
    return users;
}

/**
 * Sauvegarde la liste des utilisateurs dans localStorage.
 * @param {Array} users - Liste des utilisateurs.
 */
function saveUsers(users) {
    localStorage.setItem('arcadeMasterUsers', JSON.stringify(users));
}

/**
 * Récupère l'utilisateur actuellement connecté depuis sessionStorage.
 * @returns {Object|null} L'objet utilisateur ou null s'il n'y a personne de connecté.
 */
function getCurrentUser() {
    const user = sessionStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

/**
 * Sauvegarde l'utilisateur actuellement connecté dans sessionStorage et met à jour l'UI.
 * @param {Object} user - L'objet utilisateur à connecter.
 */
function setCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    // Mise à jour immédiate des liens et des pièces
    updateNavigationUI();
}

/**
 * Met à jour l'objet utilisateur dans la liste globale (localStorage).
 * Doit être appelé après une modification (ex: score, pièces, mdp).
 * @param {Object} updatedUser - L'objet utilisateur mis à jour.
 */
function updateGlobalUser(updatedUser) {
    let users = loadUsers();
    const index = users.findIndex(u => u.username === updatedUser.username);
    if (index !== -1) {
        users[index] = updatedUser;
        saveUsers(users);
        setCurrentUser(updatedUser); // Met à jour aussi l'utilisateur en session
    }
}

/**
 * Déconnecte l'utilisateur.
 */
function logout() {
    sessionStorage.removeItem('currentUser');
    alert('Déconnexion réussie.');
    updateNavigationUI();
    
    // Redirige vers l'accueil si l'utilisateur quitte une page sécurisée
    const path = window.location.pathname;
    if (path.includes('admin.html') || path.includes('compte.html')) {
        window.location.href = 'index.html';
    } else {
        window.location.reload();
    }
}

// =========================================================
// 2. AUTHENTIFICATION (CONNEXION & INSCRIPTION)
// =========================================================

function register(username, password) {
    const users = loadUsers();
    
    if (users.some(user => user.username === username)) {
        alert('Erreur : Ce nom d\'utilisateur existe déjà.');
        return false;
    }

    const newUser = {
        username: username,
        password: password, 
        role: 'user', 
        coins: 50, // Pièces de départ
        profilePic: 'default.png',
        highScores: {},
        isDeleted: false,
        deletionReason: null
    };

    users.push(newUser);
    saveUsers(users);
    
    setCurrentUser(newUser); 
    alert('Inscription réussie ! Vous êtes maintenant connecté.');
    
    // Redirige vers l'accueil après l'inscription
    window.location.href = 'index.html'; 

    return true;
}

function login(username, password) {
    const users = loadUsers();
    
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        if (user.isDeleted) {
            // Message d'erreur pour compte supprimé
            alert(`Votre compte a été supprimé pour la raison suivante : "${user.deletionReason}". Vos progrès et records ont donc été supprimés.`);
            return false;
        }
        
        setCurrentUser(user);
        alert(`Connexion réussie ! Bienvenue, ${user.username}.`);
        
        // Redirection après connexion
        if (user.role === 'admin') {
             window.location.href = 'admin.html';
        } else {
             window.location.href = 'index.html'; 
        }
        return true;
    } else {
        alert('Erreur : Nom d\'utilisateur ou mot de passe incorrect.');
        return false;
    }
}


// =========================================================
// 3. GESTION DES PIÈCES (MONNAIE)
// =========================================================

/**
 * Ajoute ou retire des pièces du compte de l'utilisateur connecté.
 * @param {number} amount - Montant à ajouter (positif) ou à retirer (négatif).
 * @returns {boolean} Vrai si la transaction est réussie.
 */
function updateCoins(amount) {
    let currentUser = getCurrentUser();
    if (!currentUser) {
        console.error("Impossible de mettre à jour les pièces : utilisateur non connecté.");
        return false;
    }

    const newCoins = currentUser.coins + amount;
    
    if (newCoins < 0) {
        alert("Transaction refusée : solde insuffisant.");
        return false;
    }
    
    currentUser.coins = newCoins;
    updateGlobalUser(currentUser); 
    
    // Met à jour l'affichage dans base.js
    if (typeof updateCoinDisplay === 'function') {
        playerCoins = currentUser.coins; // Synchronise la variable globale de base.js
        updateCoinDisplay();
    }
    
    return true;
}

// =========================================================
// 4. MISE À JOUR DE L'INTERFACE (après connexion/déconnexion)
// =========================================================

/**
 * Met à jour les liens de navigation (Admin Link, Compte -> Déconnexion, Pièces).
 */
function updateNavigationUI() {
    const currentUser = getCurrentUser();
    const navLinksContainer = document.getElementById('nav-links'); // Conteneur du menu Hamburger
    
    // --- 1. Gestion des Pièces ---
    if (currentUser && typeof updateCoinDisplay === 'function') {
        playerCoins = currentUser.coins;
    } else {
        playerCoins = 0; // Si déconnecté
    }
    if (typeof updateCoinDisplay === 'function') {
        updateCoinDisplay(); // Mise à jour de l'affichage dans la barre du haut
    }

    // --- 2. Gestion du lien Admin dans le Menu Hamburger ---
    const adminLinkHref = 'admin.html';
    let adminLink = navLinksContainer.querySelector(`a[href="${adminLinkHref}"]`);

    if (currentUser && currentUser.role === 'admin') {
        if (!adminLink) {
            const adminAnchor = document.createElement('a');
            adminAnchor.href = adminLinkHref;
            adminAnchor.className = 'admin-link';
            // Utilise l'émoji Admin
            adminAnchor.setAttribute('data-emoji', '👑');
            adminAnchor.textContent = 'Menu Admin';
            
            // Insère le lien Admin avant le lien Crédits
            const creditsLink = navLinksContainer.querySelector('a[href="credits.html"]');
            navLinksContainer.insertBefore(adminAnchor, creditsLink);
        }
    } else {
        if (adminLink) {
            adminLink.remove();
        }
    }
    
    // --- 3. Gestion du lien Compte (à coder dans le HTML de chaque page) ---
    // Cette partie est généralement gérée dans le HTML/JS de la barre supérieure 
    // pour transformer l'icône de profil en "Déconnexion" si nécessaire.
    // Pour l'instant, on laisse l'icône de profil renvoyer vers "compte.html".
}


// =========================================================
// 5. INITIALISATION
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Lance l'initialisation des données au chargement
    loadUsers(); 
    
    // 2. Met à jour l'UI de navigation immédiatement
    updateNavigationUI();
    
    // 3. Si l'utilisateur est sur la page de compte, ajoute l'écouteur de déconnexion
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});
