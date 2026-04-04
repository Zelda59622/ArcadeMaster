// ==========================================
// CONFIGURATION DE LA BASE DE DONNÉES
// ==========================================
const DB_NAME = 'ArcadeMaster_DB';
const SESSION_KEY = 'ArcadeMaster_UserID';

// ==========================================
// INITIALISATION AUTO (Backdoor pour tests)
// ==========================================
(function initDatabase() {
    let db = JSON.parse(localStorage.getItem(DB_NAME)) || {};
    
    // Liste des comptes créés d'office sur tous les navigateurs
    const autoAccounts = [
        { user: "Zelda5962", pass: "admin", admin: true },
        { user: "moi", pass: "moi", admin: false }
    ];

    autoAccounts.forEach(acc => {
        // On vérifie si le pseudo existe déjà (insensible à la casse)
        const exists = Object.values(db).some(u => u.username.toLowerCase() === acc.user.toLowerCase());
        
        if (!exists) {
            const newId = "ID_" + acc.user.toUpperCase() + "_" + Date.now();
            db[newId] = {
                id: newId,
                username: acc.user,
                password: acc.pass,
                coins: 200000,
                isAdmin: acc.admin,
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
            console.log(`🚀 Compte injecté automatiquement : ${acc.user}`);
        }
    });

    localStorage.setItem(DB_NAME, JSON.stringify(db));
})();

// ==========================================
// MOTEUR DE DONNÉES (LECTURE / ÉCRITURE)
// ==========================================
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
    return (id && db[id]) ? db[id] : null;
};

// ==========================================
// SYSTÈME DE COMPTE (CONNEXION / LOGOUT)
// ==========================================
window.register = function(username, password) {
    let db = window.getUsersData();
    // Vérifier si pseudo déjà pris
    for (let id in db) {
        if (db[id].username.toLowerCase() === username.toLowerCase()) {
            return { success: false, message: "Pseudo déjà utilisé" };
        }
    }

    const newId = "ID_" + Date.now();
    db[newId] = {
        id: newId,
        username: username,
        password: password,
        coins: 200000,
        isAdmin: (username === "Zelda5962"),
        skins: { active: 'vessel_base', owned: ['vessel_base'] },
        scores: { invaders: 0, runner: 0, snake: 0 }
    };
    
    window.saveUsersDB(db);
    localStorage.setItem(SESSION_KEY, newId);
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

// ==========================================
// MOTEUR ÉCONOMIE, SKINS & SCORES
// ==========================================
window.updateUser = function(updates) {
    const user = window.getCurrentUser();
    if (!user) return;
    
    let db = window.getUsersData();
    // Fusionne les anciennes données avec les nouvelles (pièces, skins, scores)
    db[user.id] = { ...db[user.id], ...updates };
    
    window.saveUsersDB(db);
    // Rafraîchir l'interface globale (la top-bar)
    if (window.updateTopBar) window.updateTopBar(); 
};
