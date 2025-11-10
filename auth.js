// Fichier: auth.js
const AUTH_CONTROLS = document.getElementById('auth-controls');
const STORAGE_KEY = 'arcadeMasterUsers';
const DEFAULT_PDP_URL = 'https://i.imgur.com/39hN7hG.png'; 
// !!! Changez 'Zelda5962' par votre nom d'utilisateur si vous avez changé d'Admin
const ADMIN_USERS = ['Zelda5962']; 

// --- Fonctions de base de données (Chargement/Sauvegarde) ---

function loadUsers() {
    const usersJson = localStorage.getItem(STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : {}; 
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getCurrentUser() {
    return localStorage.getItem('currentUser');
}

function isAdmin(username) {
    return ADMIN_USERS.includes(username);
}

function getUserData(username) {
    const users = loadUsers();
    return users[username] || null; 
}

// --- Fonctions d'Authentification (Inchangé si vous les aviez) ---

function login(username, password) {
    const users = loadUsers();
    if (users[username] && users[username].password === password) {
        localStorage.setItem('currentUser', username);
        renderAuthControls();
        return true;
    }
    return false;
}

function register(username, password) {
    const users = loadUsers();
    if (users[username]) {
        return false; // Utilisateur existe déjà
    }
    users[username] = { password: password, games: {} };
    saveUsers(users);
    return true;
}

function logout() {
    localStorage.removeItem('currentUser');
    renderAuthControls();
    window.location.href = 'index.html';
}

function updatePDP(username, newUrl) {
    const users = loadUsers();
    if (users[username]) {
        users[username].pdp = newUrl;
        saveUsers(users);
        renderAuthControls();
        return true;
    }
    return false;
}

function changePassword(username, newPassword) {
    const users = loadUsers();
    if (users[username]) {
        users[username].password = newPassword;
        saveUsers(users);
        return true;
    }
    return false;
}

// --- Fonction de Sauvegarde de Jeu (CLÉ POUR LE CLASSEMENT) ---

function saveGameData(username, game, data) {
    const users = loadUsers();
    
    if (users[username]) {
        if (!users[username].games) {
            users[username].games = {};
        }
        if (!users[username].games[game]) {
            users[username].games[game] = { highScore: 0 };
        }
        
        // Sauvegarde seulement si le nouveau score est supérieur
        if (data.score > users[username].games[game].highScore) {
            users[username].games[game].highScore = data.score;
            saveUsers(users); 
            console.log(`Nouveau meilleur score (${data.score}) sauvegardé pour ${username} dans ${game}.`);
            return true;
        }
    }
    return false;
}

// --- Fonctions de Classement ---

// Récupère l'intégralité des scores pour un jeu donné
function getFullLeaderboard(game = 'space_invaders') {
    const users = loadUsers();
    let scores = [];

    for (const username in users) {
        const user = users[username];
        if (user.games && user.games[game] && user.games[game].highScore !== undefined) {
            scores.push({
                username: username,
                score: user.games[game].highScore
            });
        }
    }
    // Trie tous les scores par ordre décroissant
    scores.sort((a, b) => b.score - a.score);
    return scores;
}

// Récupère le Top X (par défaut Top 10)
function getLeaderboard(game = 'space_invaders', limit = 10) {
    return getFullLeaderboard(game).slice(0, limit);
}

// Trouve le rang d'un utilisateur spécifique
function getPersonalRank(username, game = 'space_invaders') {
    const fullLeaderboard = getFullLeaderboard(game);
    
    if (!username) return null;

    const index = fullLeaderboard.findIndex(entry => entry.username === username);

    if (index === -1) {
        return null; // Pas de score enregistré
    }
    
    const rank = index + 1;
    const score = fullLeaderboard[index].score;

    return { rank: rank, score: score };
}


// --- Rendu de l'interface utilisateur (UI) ---

function renderAuthControls() {
    const currentUser = getCurrentUser();
    
    if (!AUTH_CONTROLS) return; 
    
    AUTH_CONTROLS.innerHTML = ''; 

    if (currentUser) {
        const userData = getUserData(currentUser);
        const pdpUrl = userData ? userData.pdp || DEFAULT_PDP_URL : DEFAULT_PDP_URL;
        
        const adminLink = isAdmin(currentUser) 
            ? '<a href="admin.html" class="nav-link" style="color:yellow; text-decoration:none;">ADMIN</a>' 
            : '';

        AUTH_CONTROLS.innerHTML = `
            <img src="${pdpUrl}" alt="PDP" id="nav-pdp">
            <span id="user-info-display">${currentUser}</span> 
            <a href="authentification.html" id="account-button">⚙️ Compte</a>
            ${adminLink}
        `;
    } else {
        AUTH_CONTROLS.innerHTML = `
            <button id="login-button" onclick="window.location.href='authentification.html'">
                S'inscrire / Se Connecter
            </button>
        `;
    }
    
    // Ajout/suppression du lien ADMIN dans la SIDEBAR
    const sidebarElement = document.getElementById('sidebar');
    if (sidebarElement) {
        let adminLinkSidebar = sidebarElement.querySelector('.admin-link');
        
        if (isAdmin(currentUser) && !adminLinkSidebar) {
            const adminAnchor = document.createElement('a');
            adminAnchor.href = "admin.html";
            adminAnchor.textContent = "🛡️ Admin";
            adminAnchor.classList.add('admin-link');
            // Insérer avant le dernier lien 'Compte' ou à la fin
            sidebarElement.appendChild(adminAnchor); 
            
        } else if (!isAdmin(currentUser) && adminLinkSidebar) {
            adminLinkSidebar.remove();
        }
    }
}

// --- Initialisation ---
document.addEventListener('DOMContentLoaded', renderAuthControls);

// Rendre les fonctions importantes accessibles globalement
window.saveGameData = saveGameData;
window.getCurrentUser = getCurrentUser; 
window.logout = logout;
window.loadUsers = loadUsers; 
window.getLeaderboard = getLeaderboard; 
window.getPersonalRank = getPersonalRank;
window.changePassword = changePassword;
window.login = login;
window.isAdmin = isAdmin;
window.getUserData = getUserData;
window.updatePDP = updatePDP;
window.renderAuthControls = renderAuthControls; // Rendu accessible pour toutes les pages
window.register = register;
