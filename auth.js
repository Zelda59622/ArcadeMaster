const STORAGE_KEY = 'arcadeMasterUsers';

// --- Fonctions de base (Identiques) ---

function loadUsers() {
    const json = localStorage.getItem(STORAGE_KEY);
    const users = json ? JSON.parse(json) : {};

    if (!users["Zelda5962"]) {
        users["Zelda5962"] = {
            password: "password", 
            role: "admin",
            pdp: "https://i.imgur.com/39hN7hG.png", 
            games: {} 
        };
    }
    return users;
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function getUserData(username) {
    const users = loadUsers();
    return users[username] || null;
}

function getCurrentUser() {
    return sessionStorage.getItem('currentUser');
}

function setCurrentUser(username) {
    sessionStorage.setItem('currentUser', username);
}

// --- Focntion login (CORRIGÉE) ---

function login(username, password) {
    const users = loadUsers();
    const user = users[username];

    if (user && user.password === password) {
        setCurrentUser(username);
        
        // CORRECTION MAJEURE: Forcer la mise à jour de l'interface
        if (typeof renderAuthControls === 'function') {
             renderAuthControls();
        }
        return true;
    }
    return false;
}

function logout() {
    sessionStorage.removeItem('currentUser');
    if (typeof renderAuthControls === 'function') {
        renderAuthControls();
    }
    // Rediriger vers l'accueil pour forcer la réinitialisation de la page
    window.location.href = 'index.html'; 
}

// --- Fonctions de jeu (Identiques) ---

function saveGameData(username, gameId, data) {
    const users = loadUsers();
    const user = users[username];
    if (!user) return; 

    if (!user.games[gameId]) {
        user.games[gameId] = { highScore: 0 };
    }
    if (data.score > user.games[gameId].highScore) {
        user.games[gameId].highScore = data.score;
    }
    saveUsers(users);
}

function getFullLeaderboard(gameId) {
    const users = loadUsers();
    const leaderboard = [];
    for (const username in users) {
        const user = users[username];
        if (user.games[gameId] && user.games[gameId].highScore > 0) {
            leaderboard.push({ username: username, score: user.games[gameId].highScore });
        }
    }
    leaderboard.sort((a, b) => b.score - a.score);
    return leaderboard;
}

function deleteUser(username) {
    const currentUser = getCurrentUser();
    if (username === currentUser) { alert("Vous ne pouvez pas supprimer votre propre compte."); return; }
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${username}" ?`)) {
        const users = loadUsers();
        if (users[username] && users[username].role === 'admin') { alert("Impossible de supprimer un autre admin."); return; }
        delete users[username];
        saveUsers(users);
        if (typeof renderAdminPanel === 'function') { renderAdminPanel(); } else { window.location.reload(); }
    }
}


// --- Fonction de Rendu (Identique, mais vérifiée) ---

function renderAuthControls() {
    const currentUser = getCurrentUser();
    const authControls = document.getElementById('auth-controls');
    const sidebar = document.getElementById('sidebar');
    
    if (!authControls || !sidebar) return;

    let authHTML = '';
    
    if (currentUser) {
        const userData = getUserData(currentUser);
        const pdpUrl = userData && userData.pdp ? userData.pdp : 'https://i.imgur.com/39hN7hG.png';
        
        authHTML = `
            <span style="color: #00ff00; font-weight: bold; margin-right: 10px;">${currentUser}</span>
            <img src="${pdpUrl}" alt="PDP" style="width: 30px; height: 30px; border-radius: 50%; border: 1px solid #00ff00; vertical-align: middle; margin-right: 5px;">
            <a href="authentification.html" title="Mon Compte" style="color: white; margin-left: 10px;">Compte</a>
            <a href="#" onclick="logout(); return false;" title="Déconnexion" style="color: #e74c3c; margin-left: 15px;">Déconnexion</a>
        `;

        const oldAdminLink = sidebar.querySelector('a[href="admin.html"]');
        if (oldAdminLink) sidebar.removeChild(oldAdminLink);

        if (userData && userData.role === 'admin') {
             const adminLinkHTML = '<a href="admin.html" style="color: #f39c12;">🛡️ Admin Panel</a>';
             sidebar.insertAdjacentHTML('beforeend', adminLinkHTML);
        }

    } else {
        authHTML = `<a href="authentification.html" style="color: white;">Connexion / Inscription</a>`;
        const oldAdminLink = sidebar.querySelector('a[href="admin.html"]');
        if (oldAdminLink) sidebar.removeChild(oldAdminLink);
    }

    authControls.innerHTML = authHTML;
}

// Globalisation et exécution
window.loadUsers = loadUsers;
window.saveUsers = saveUsers;
window.getUserData = getUserData;
window.getCurrentUser = getCurrentUser;
window.login = login;
window.logout = logout;
window.renderAuthControls = renderAuthControls;
window.saveGameData = saveGameData;
window.getFullLeaderboard = getFullLeaderboard;
window.deleteUser = deleteUser;


document.addEventListener('DOMContentLoaded', renderAuthControls);
