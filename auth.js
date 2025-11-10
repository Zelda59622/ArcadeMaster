// Fichier: auth.js
const AUTH_CONTROLS = document.getElementById('auth-controls');
const STORAGE_KEY = 'arcadeMasterUsers';
const DEFAULT_PDP_URL = 'https://i.imgur.com/39hN7hG.png'; 
// Administrateur par défaut
const ADMIN_USERS = ['Zelda5962']; 

// --- Fonctions de base de données (Chargement/Sauvegarde) ---

function loadUsers() {
    const usersJson = localStorage.getItem(STORAGE_KEY);
    if (!usersJson) {
        return {}; 
    }
    
    try {
        const users = JSON.parse(usersJson);
        if (typeof users === 'object' && users !== null) {
            return users;
        }
    } catch (error) {
        console.error("Erreur de décodage des données utilisateurs dans localStorage. Le cache est corrompu.", error);
        return {};
    }
    return {};
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

// --- Fonctions d'Authentification (à compléter si non présentes) ---

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
        return false; 
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


// --- Fonction de Sauvegarde de Jeu ---

function saveGameData(username, game, data) {
    const users = loadUsers();
    
    if (users[username]) {
        if (!users[username].games) {
            users[username].games = {};
        }
        if (!users[username].games[game]) {
            users[username].games[game] = { highScore: 0 };
        }
        
        if (data.score > users[username].games[game].highScore) {
            users[username].games[game].highScore = data.score;
            saveUsers(users); 
            console.log(`Nouveau meilleur score (${data.score}) sauvegardé pour ${username} dans ${game}.`);
            return true;
        }
    }
    return false;
}

// --- Fonctions de Classement (utilisées par space-invaders.html) ---

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
    scores.sort((a, b) => b.score - a.score); 
    return scores;
}

function getLeaderboard(game = 'space_invaders', limit = 10) {
    return getFullLeaderboard(game).slice(0, limit);
}

// --- Rendu de l'interface utilisateur (UI) ---

function renderAuthControls() {
    const currentUser = getCurrentUser();
    
    if (!AUTH_CONTROLS) return; 
    
    AUTH_CONTROLS.innerHTML = ''; 

    if (currentUser) {
        const userData = getUserData(currentUser);
        const pdpUrl = userData ? userData.pdp || DEFAULT_PDP_URL : DEFAULT_PDP_URL;
        
        AUTH_CONTROLS.innerHTML = `
            <img src="${pdpUrl}" alt="PDP" id="nav-pdp">
            <span id="user-info-display">${currentUser}</span> 
            <a href="authentification.html" id="account-button">⚙️ Compte</a>
        `;
    } else {
        AUTH_CONTROLS.innerHTML = `
            <button id="login-button" onclick="window.location.href='authentification.html'">
                S'inscrire / Se Connecter
            </button>
        `;
    }
    
    // Ajout/suppression du lien ADMIN dans la SIDEBAR (Menu Hamburger)
    const sidebarElement = document.getElementById('sidebar');
    if (sidebarElement) {
        // CORRECTION: Assurer que le lien ADMIN n'est ajouté qu'une seule fois et est le dernier.
        let adminLinkSidebar = sidebarElement.querySelector('.admin-link');
        
        if (isAdmin(currentUser)) {
            if (!adminLinkSidebar) {
                const adminAnchor = document.createElement('a');
                adminAnchor.href = "admin.html";
                adminAnchor.textContent = "🛡️ Admin";
                adminAnchor.classList.add('admin-link');
                
                // Si l'élément Compte est présent, insérer l'admin juste avant.
                // Sinon, l'ajouter à la fin.
                const accountLink = sidebarElement.querySelector('a[href="authentification.html"]');
                
                if (accountLink) {
                    sidebarElement.insertBefore(adminAnchor, accountLink);
                } else {
                    sidebarElement.appendChild(adminAnchor);
                }
            }
        } else if (adminLinkSidebar) {
            adminLinkSidebar.remove();
        }
    }
}

// --- Logique du Panneau d'Administration (pour admin.html) ---

function renderAdminPanel() {
    const currentUser = getCurrentUser();
    const userListContainer = document.getElementById('user-list');
    
    if (!currentUser || !isAdmin(currentUser) || !userListContainer) {
        return; 
    }

    const users = loadUsers();
    userListContainer.innerHTML = ''; 

    for (const username in users) {
        const userData = users[username];
        const pdpUrl = userData.pdp || DEFAULT_PDP_URL;
        const isAdminUser = isAdmin(username);

        const li = document.createElement('li');
        li.classList.add('admin-list-item');
        
        li.innerHTML = `
            <div class="user-details">
                <img src="${pdpUrl}" alt="PDP" class="user-pdp-admin">
                <span>${username}</span>
                ${isAdminUser ? '<span class="admin-status">(ADMIN)</span>' : ''}
            </div>
            <div class="admin-controls">
                ${username !== currentUser && !isAdminUser 
                    ? `<button class="delete" onclick="deleteUser('${username}')">Supprimer</button>` 
                    : (username === currentUser ? '<span style="color:#aaa;">(Vous)</span>' : '<span style="color:#f39c12;">(Admin)</span>')
                }
            </div>
        `;
        userListContainer.appendChild(li);
    }
}

function deleteUser(username) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${username}" ? Cette action est irréversible.`)) {
        
        if (typeof loadUsers === 'undefined' || typeof saveUsers === 'undefined') {
            alert("Erreur: Les fonctions de gestion d'utilisateurs ne sont pas disponibles.");
            return;
        }
        
        const users = loadUsers(); 
        delete users[username];
        saveUsers(users);
        
        if (getCurrentUser() === username) {
            logout();
        } else {
            renderAdminPanel(); // Rafraîchit la liste
        }
    }
}


// --- Initialisation ---
document.addEventListener('DOMContentLoaded', renderAuthControls);

// Rendre les fonctions importantes accessibles globalement
window.saveGameData = saveGameData;
window.getCurrentUser = getCurrentUser; 
window.getLeaderboard = getLeaderboard; 
window.getUserData = getUserData;
window.renderAuthControls = renderAuthControls;
window.login = login;
window.register = register;
window.logout = logout;
window.updatePDP = updatePDP;
window.loadUsers = loadUsers;
window.saveUsers = saveUsers;
window.renderAdminPanel = renderAdminPanel; // EXPOSÉ POUR admin.html
window.deleteUser = deleteUser; // EXPOSÉ POUR admin.html
window.isAdmin = isAdmin; // EXPOSÉ POUR admin.html
