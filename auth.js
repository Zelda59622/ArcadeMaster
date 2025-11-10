// Fichier: auth.js
// Gère l'authentification, la sauvegarde locale et le classement.

const AUTH_SECTION = document.getElementById('auth-section');
const STORAGE_KEY = 'arcadeMasterUsers';

// --- Fonctions de base de données (LocalStorage) ---

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

function login(username) {
    localStorage.setItem('currentUser', username);
    renderAuthUI();
}

function logout() {
    localStorage.removeItem('currentUser');
    renderAuthUI();
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
            console.log(`Nouveau meilleur score pour ${username}: ${data.score}`);
        }
    } else {
        // Pour les autres jeux/données
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

    // Trier les scores par ordre décroissant
    scores.sort((a, b) => b.score - a.score);

    // Retourner seulement la limite demandée
    return scores.slice(0, limit);
}

// --- Rendu de l'interface utilisateur (UI) ---

function renderAuthUI() {
    const currentUser = getCurrentUser();
    
    if (!AUTH_SECTION) return; 
    
    AUTH_SECTION.innerHTML = ''; 

    if (currentUser) {
        // Utilisateur connecté
        AUTH_SECTION.innerHTML = `
            <div style="display:flex; align-items:center; gap: 10px; flex-wrap: wrap; justify-content: flex-end;">
                Connecté: <span id="user-info" style="color:#00ff00; font-weight:bold;">${currentUser}</span> 
                <button onclick="logout()">Déconnexion</button>
                ${currentUser === 'admin' ? '<a href="admin.html" style="color:yellow; text-decoration:none;">ADMIN</a>' : ''}
            </div>
        `;
    } else {
        // Utilisateur déconnecté (Formulaires)
        AUTH_SECTION.innerHTML = `
            <form onsubmit="event.preventDefault(); handleRegister(event);" style="display:flex; gap: 10px;">
                <input type="text" id="reg-username" placeholder="Pseudo (Créer Compte)" required>
                <input type="password" id="reg-password" placeholder="Mot de passe" required>
                <button type="submit">Créer</button>
            </form>
            <form onsubmit="event.preventDefault(); handleLogin(event);" style="display:flex; gap: 10px; margin-top: 5px;">
                <input type="text" id="login-username" placeholder="Pseudo (Connexion)" required>
                <input type="password" id="login-password" placeholder="Mot de passe" required>
                <button type="submit">Connexion</button>
            </form>
        `;
    }
}

function handleRegister(event) {
    const username = event.target.elements['reg-username'].value.trim();
    const password = event.target.elements['reg-password'].value;
    
    if (!username || !password) return alert("Veuillez remplir tous les champs.");
    
    const users = loadUsers();
    if (users[username]) {
        return alert("Ce pseudo existe déjà. Veuillez vous connecter.");
    }
    
    users[username] = { password: password, games: {} };
    saveUsers(users);
    
    login(username);
    alert(`Compte "${username}" créé et connecté !`);
}

function handleLogin(event) {
    const username = event.target.elements['login-username'].value.trim();
    const password = event.target.elements['login-password'].value;

    if (!username || !password) return alert("Veuillez remplir tous les champs.");

    const users = loadUsers();
    const user = users[username];

    if (!user || user.password !== password) {
        return alert("Pseudo ou mot de passe incorrect.");
    }

    login(username);
    alert(`Bienvenue, ${username} !`);
}


// --- Initialisation ---

document.addEventListener('DOMContentLoaded', renderAuthUI);

// Rendre les fonctions importantes accessibles globalement
window.saveGameData = saveGameData;
window.getCurrentUser = getCurrentUser; 
window.logout = logout;
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.loadUsers = loadUsers; 
window.getLeaderboard = getLeaderboard; // Nouvelle fonction accessible
