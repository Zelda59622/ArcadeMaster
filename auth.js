/**
 * Fichier : auth.js
 * Description : Gère l'authentification (connexion/inscription),
 * la persistance des données (scores, utilisateurs) via localStorage,
 * et les fonctions d'aide pour l'état du jeu et le rôle Admin.
 */

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
    
    // Assure l'existence d'un compte Admin par défaut
    const adminExists = users.some(user => user.username === 'admin');
    if (!adminExists) {
        users.push({
            username: 'admin',
            password: 'admin', // Mot de passe par défaut
            role: 'admin',
            highScores: {} // {gameName: score}
        });
        saveUsers(users);
        console.log("Compte 'admin' créé avec succès.");
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
    // On utilise sessionStorage pour ne pas se connecter automatiquement après la fermeture du navigateur
    const user = sessionStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

/**
 * Sauvegarde l'utilisateur actuellement connecté dans sessionStorage.
 * @param {Object} user - L'objet utilisateur à connecter.
 */
function setCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    // Mise à jour immédiate des liens dans la barre de nav
    updateNavigationLinks(); 
}

/**
 * Déconnecte l'utilisateur.
 */
function logout() {
    sessionStorage.removeItem('currentUser');
    alert('Déconnexion réussie.');
    updateNavigationLinks();
    
    // Redirige si l'utilisateur quitte la page admin ou profile
    const path = window.location.pathname;
    if (path.includes('admin.html') || path.includes('authentification.html')) {
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
        role: 'user', // Tous les nouveaux utilisateurs sont 'user' par défaut
        highScores: {}
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
// 3. GESTION DU SCORE
// =========================================================

/**
 * Sauvegarde un nouveau score si l'utilisateur est connecté et si c'est un high score.
 */
function saveHighScore(gameName, newScore) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.log("Score non sauvegardé : utilisateur non connecté.");
        return false;
    }

    const users = loadUsers();
    const userIndex = users.findIndex(u => u.username === currentUser.username);

    if (userIndex !== -1) {
        const user = users[userIndex];
        const currentHighScore = user.highScores[gameName] || 0;
        
        if (newScore > currentHighScore) {
            user.highScores[gameName] = newScore;
            users[userIndex] = user; 
            saveUsers(users);
            
            // Met à jour l'objet dans sessionStorage aussi
            setCurrentUser(user);
            console.log(`Nouveau High Score sauvegardé pour ${user.username} : ${newScore}`);
            return true;
        } else {
            console.log("Score non sauvegardé : score inférieur ou égal au record personnel.");
        }
    }
    return false;
}

/**
 * Récupère le High Score personnel de l'utilisateur connecté pour un jeu.
 */
function getPersonalHighScore(gameName) {
    const currentUser = getCurrentUser();
    if (currentUser) {
        return currentUser.highScores[gameName] || 0;
    }
    return 0;
}

/**
 * Récupère les top scores globaux pour un jeu (pour le leaderboard).
 */
function getLeaderboard(gameName) {
    const users = loadUsers();
    
    const scores = users
        .filter(user => user.highScores[gameName] > 0)
        .map(user => ({
            username: user.username,
            score: user.highScores[gameName],
            role: user.role
        }))
        .sort((a, b) => b.score - a.score) // Tri descendant
        .slice(0, 10); // Top 10
        
    return scores;
}


// =========================================================
// 4. MISE À JOUR DE L'INTERFACE UTILISATEUR (Liens dynamiques)
// =========================================================

/**
 * Met à jour les liens de navigation (Connexion -> Déconnexion, Ajout du lien Admin).
 */
function updateNavigationLinks() {
    const currentUser = getCurrentUser();
    const navbar = document.getElementById('navbar');
    
    if (!navbar) return;
    const navLinksContainer = navbar.querySelector('.nav-links');
    
    // --- Gestion du lien de Profil (Connexion/Déconnexion) ---
    let profileLink = navbar.querySelector('.profile-link');
    if (profileLink) {
        profileLink.removeEventListener('click', logout); 
        
        if (currentUser) {
            // Utilisateur connecté : Afficher Déconnexion
            profileLink.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> ${currentUser.username}`;
            profileLink.href = '#'; 
            profileLink.addEventListener('click', logout);
        } else {
            // Utilisateur déconnecté : Afficher Connexion
            profileLink.innerHTML = `<i class="fa-solid fa-user-gear"></i>`;
            profileLink.href = 'authentification.html';
        }
    }

    // --- Gestion du lien Admin ---
    const adminLinkHref = 'admin.html';
    let adminLink = navLinksContainer.querySelector(`a[href="${adminLinkHref}"]`);

    if (currentUser && currentUser.role === 'admin') {
        if (!adminLink) {
            const adminAnchor = document.createElement('a');
            adminAnchor.href = adminLinkHref;
            // Style de l'icône admin en jaune doré
            adminAnchor.innerHTML = '<i class="fa-solid fa-shield-halved" style="color: #FFD700;"></i> Admin';
            
            // Insère le lien Admin avant le lien Crédits
            const creditsLink = navLinksContainer.querySelector('a[href="credits.html"]');
            navLinksContainer.insertBefore(adminAnchor, creditsLink);
        }
    } else {
        if (adminLink) {
            adminLink.remove();
        }
    }
}


// =========================================================
// 5. INITIALISATION
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Gère les soumissions de formulaire sur la page d'authentification
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            login(username, password);
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;
            register(username, password);
        });
    }

    // 2. Met à jour la navigation au chargement de chaque page
    updateNavigationLinks(); 
});
