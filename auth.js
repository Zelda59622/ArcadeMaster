// --- CONFIGURATION ---
const DB_NAME = 'ArcadeMaster_DB';
const SESSION_KEY = 'ArcadeMaster_UserID';

// --- MOTEUR DE DONNÉES (LECTURE / ÉCRITURE) ---
window.getUsersData = function() {
    const data = localStorage.getItem(DB_NAME);
    return data ? JSON.parse(data) : {};
};

window.saveUsersDB = function(db) {
    localStorage.setItem(DB_NAME, JSON.stringify(db));
};

window.getCurrentUser = function() {
    const db = window.getUsersData();
    const id = localStorage.getItem(SESSION_KEY);
    // Si l'utilisateur existe dans la DB, on le renvoie, sinon null
    return (id && db[id]) ? db[id] : null;
};

// --- SYSTÈME DE COMPTE (INSCRIPTION / CONNEXION) ---
window.register = function(username, password) {
    let db = window.getUsersData();
    
    // Vérifier si le pseudo est déjà pris
    for (let id in db) {
        if (db[id].username.toLowerCase() === username.toLowerCase()) return { success: false, message: "Pseudo déjà utilisé" };
    }

    const newId = "ID_" + Date.now();
    db[newId] = {
        id: newId,
        username: username,
        password: password,
        coins: 200000, // Ton cadeau de bienvenue
        isAdmin: (username === "Zelda5962"), // Toi seul es le boss
        skins: {
            active: 'vessel_base',
            owned: ['vessel_base']
        },
        scores: {
            invaders: 0,
            runner: 0,
            snake: 0
        }
    };
    
    window.saveUsersDB(db);
    localStorage.setItem(SESSION_KEY, newId); // Connexion automatique après inscription
    return { success: true };
};

window.login = function(username, password) {
    const db = window.getUsersData();
    for (let id in db) {
        if (db[id].username === username && db[id].password === password) {
            localStorage.setItem(SESSION_KEY, id);
            return true;
        }
    }
    return false;
};

window.logout = function() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
};

// --- MOTEUR ÉCONOMIE & SCORES ---
window.updateUser = function(updates) {
    const user = window.getCurrentUser();
    if (!user) return;
    
    let db = window.getUsersData();
    // On met à jour uniquement ce qui change (pièces, skins, ou scores)
    db[user.id] = { ...db[user.id], ...updates };
    
    window.saveUsersDB(db);
    // Si la barre de navigation est là, on la rafraîchit
    if (window.updateTopBar) window.updateTopBar();
};
