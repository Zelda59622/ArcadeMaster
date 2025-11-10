// Fichier: auth.js
// Gère l'authentification, la sauvegarde locale, le classement, et l'UI.

const AUTH_CONTROLS = document.getElementById('auth-controls');
const STORAGE_KEY = 'arcadeMasterUsers';

// --- Liste des utilisateurs administrateurs ---
const ADMIN_USERS = ['Zelda5962']; // <--- L'utilisateur Zelda5962 est l'admin

// --- Fonctions de base de données ---

function loadUsers() {
    const usersJson = localStorage.getItem(STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : {};
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// --- Fonctions d'authentification ---

function getCurrentUser() {
    return localStorage.getItem('currentUser');
}

function isAdmin(username) {
    // Vérifie si l'utilisateur est dans la liste des administrateurs
    return ADMIN_USERS.includes(username);
}

function login(username) {
    localStorage.setItem('currentUser', username);
    renderAuthControls();
}

function logout() {
    localStorage.removeItem('currentUser');
    renderAuthControls();
    // Redirige vers la page d'authentification si on s'y trouve, pour rafraîchir
    if (window.location.pathname.endsWith('authentification.html')) {
        window.location.reload(); 
    }
}

// --- Gestion du mot de passe ---

function changePassword(username, newPassword) {
    const users = loadUsers();
    if (users[username]) {
        users[username].password = newPassword;
        saveUsers(users);
        return true;
    }
    return false;
}

// --- Sauvegarde des Scores/Progression ---

function saveGameData(username, game, data) {
    const users = loadUsers();
    if (!users[username]) {
        users[username] = { password: '', games: {} };
    }
    
    if (!users[username].games[game]) {
        users[username].games[game] = {};
    }

    // Gestion du meilleur score pour Space Invaders
    if (game === 'space_invaders' && data.score !== undefined) {
        const currentBest = users[username].games[game].highScore || 0;
        if (data.score > currentBest) {
            users[username].games[game].highScore = data.score;
        }
    } else {
        users[username].games[game] = { ...users[username].games[game], ...data };
    }
    
    saveUsers(users);
}

// --- Fonction de Classement ---

function getLeaderboard(game = 'space_invaders', limit = 10) {
    const users = loadUsers();
    let scores = [];

    for (const username in users) {
        const user = users[username];
        if (user.games[game] && user.games[game].highScore !== undefined) {
            scores.push({
                username: username,
                score: user.games[game].highScore
            });
        }
    }

    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, limit);
}

// --- Rendu de l'interface utilisateur (UI) ---

function renderAuthControls() {
    const currentUser = getCurrentUser();
    
    // Vérifie si l'élément de contrôle existe sur la page (il devrait exister sur toutes les pages)
    if (!AUTH_CONTROLS) return; 
    
    AUTH_CONTROLS.innerHTML = ''; 

    if (currentUser) {
        // Utilisateur connecté : Montrer le nom et le bouton Compte
        
        // Ajout du lien ADMIN si l'utilisateur est un administrateur
        const adminLink = isAdmin(currentUser) 
            ? '<a href="admin.html" class="nav-link" style="color:yellow; text-decoration:none;">ADMIN</a>' 
            : '';

        AUTH_CONTROLS.innerHTML = `
            <span id="user-info-display">${currentUser}</span> 
            <a href="authentification.html" id="account-button">⚙️ Compte</a>
            ${adminLink}
        `;
    } else {
        // Utilisateur déconnecté : Montrer le bouton S'inscrire/Se Connecter
        AUTH_CONTROLS.innerHTML = `
            <button id="login-button" onclick="window.location.href='authentification.html'">
                S'inscrire / Se Connecter
            </button>
        `;
    }
}

// --- Initialisation ---

document.addEventListener('DOMContentLoaded', renderAuthControls);

// Rendre les fonctions importantes accessibles globalement (pour les autres scripts)
window.saveGameData = saveGameData;
window.getCurrentUser = getCurrentUser; 
window.logout = logout;
window.loadUsers = loadUsers; 
window.getLeaderboard = getLeaderboard; 
window.changePassword = changePassword;
window.login = login;
window.isAdmin = isAdmin;
