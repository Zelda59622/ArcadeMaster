// --- CONFIGURATION ---
const DB_NAME = 'ArcadeMaster_DB';
const SESSION_KEY = 'ArcadeMaster_UserID';

// --- MOTEUR DE DONNÉES ---
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

// --- INSCRIPTION (Avec vérification de doublons) ---
window.register = function(username, password) {
    let db = window.getUsersData();
    
    // Vérifier si le pseudo existe déjà
    const exists = Object.values(db).some(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (exists) {
        alert("🚨 ERREUR : Ce pseudo est déjà utilisé dans le registre !");
        return { success: false };
    }

    const newId = "ID_" + Date.now();
    db[newId] = {
        id: newId,
        username: username,
        password: password,
        coins: 200000,
        isAdmin: (username === "Zelda5962"),
        skins: { active: 'vessel_base', owned: ['vessel_base'] },
        scores: { invaders: 0 }
    };
    
    window.saveUsersDB(db);
    localStorage.setItem(SESSION_KEY, newId);
    alert("✅ COMPTE CRÉÉ : Bienvenue dans le registre !");
    return { success: true };
};

// --- CONNEXION (Avec vérification d'existence) ---
window.login = function(username, password) {
    const db = window.getUsersData();
    let foundUser = null;

    for (let id in db) {
        if (db[id].username.toLowerCase() === username.toLowerCase()) {
            foundUser = db[id];
            break;
        }
    }

    if (!foundUser) {
        alert("❌ ERREUR : Ce compte n'existe pas ! Veuillez vous inscrire.");
        return false;
    }

    if (foundUser.password !== password) {
        alert("❌ MOT DE PASSE INCORRECT !");
        return false;
    }

    localStorage.setItem(SESSION_KEY, foundUser.id);
    return true;
};

window.logout = function() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
};

window.updateUser = function(updates) {
    const user = window.getCurrentUser();
    if (!user) return;
    let db = window.getUsersData();
    db[user.id] = { ...db[user.id], ...updates };
    window.saveUsersDB(db);
    if (window.updateTopBar) window.updateTopBar();
};

// Injection automatique pour tests
(function inject() {
    let db = window.getUsersData();
    if (!Object.values(db).some(u => u.username === "Zelda5962")) {
        window.register("Zelda5962", "admin");
    }
})();
