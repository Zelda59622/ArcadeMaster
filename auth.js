// --- auth.js ---

// Initialise ou récupère la base de données des utilisateurs
function getUsersDB() {
    const db = localStorage.getItem('usersDB');
    let parsedDB = db ? JSON.parse(db) : {};
    
    // Sécurité : Force Zelda5962 à être Admin si le compte existe
    for (let id in parsedDB) {
        if (parsedDB[id].username === "Zelda5962") {
            parsedDB[id].isAdmin = true;
        }
    }
    return parsedDB;
}

function saveUsersDB(db) {
    localStorage.setItem('usersDB', JSON.stringify(db));
}

// Récupère l'ID (sans forcer le nombre pour accepter "999")
function getActiveUserId() {
    return localStorage.getItem('activeUserId') || "0";
}

function setActiveUserId(id) {
    localStorage.setItem('activeUserId', id);
}

// Utilisé pour rafraîchir l'affichage après un achat ou un don de pièces
function updateGlobalUser(user) {
    if (typeof window.updateTopBar === 'function') {
        window.updateTopBar();
    }
}

window.getCurrentUser = function() {
    const activeId = getActiveUserId();
    const db = getUsersDB();
    
    if (activeId !== "0" && db[activeId]) {
        return db[activeId];
    }
    return { 
        id: 0, 
        username: 'Invité', 
        coins: 0,
        isAdmin: false,
        skins: { active: { vessel: 'vessel_base' }, owned: { 'vessel_base': true } }
    };
}

// --- AUTHENTIFICATION ---

window.register = function(username, password) {
    const db = getUsersDB();
    for (const id in db) {
        if (db[id].username === username) return false;
    }

    const newId = Date.now().toString(); // ID en texte pour la cohérence
    db[newId] = {
        id: newId,
        username: username,
        password: password,
        coins: 200000,
        isAdmin: (username === "Zelda5962"), // Admin auto si pseudo spécial
        scores: {},
        skins: {
            active: { vessel: 'vessel_base', monster: 'monster_base' },
            owned: { 'vessel_base': true }
        }
    };
    
    saveUsersDB(db);
    return true;
}

window.login = function(username, password) {
    const db = getUsersDB();
    for (const id in db) {
        const user = db[id];
        if (user.username === username && user.password === password) {
            setActiveUserId(user.id);
            updateGlobalUser(user);
            return true;
        }
    }
    return false;
}

window.logout = function() {
    setActiveUserId("0");
    location.href = 'index.html';
}

// --- BOUTIQUE ---

window.deductCoins = function(amount) {
    const user = window.getCurrentUser();
    if (user.id === 0) return false;

    let db = getUsersDB();
    if (db[user.id].coins >= amount) {
        db[user.id].coins -= amount;
        saveUsersDB(db);
        updateGlobalUser(db[user.id]); 
        return true;
    }
    return false;
}

window.addOwnedSkin = function(skinId) {
    const user = window.getCurrentUser();
    let db = getUsersDB();
    if (!db[user.id].skins.owned) db[user.id].skins.owned = {};
    db[user.id].skins.owned[skinId] = true;
    saveUsersDB(db);
}

// --- EXTENSION ADMIN ---

(function initAdmin() {
    let db = getUsersDB();
    let adminExists = false;

    for (let id in db) {
        if (db[id].username === "Zelda5962") {
            adminExists = true;
            break;
        }
    }

    if (!adminExists) {
        const adminId = "999";
        db[adminId] = {
            id: adminId,
            username: "Zelda5962",
            password: "admin", 
            coins: 999999,
            isAdmin: true,
            scores: {},
            skins: {
                active: { vessel: 'vessel_base', monster: 'monster_base' },
                owned: { 'vessel_base': true }
            }
        };
        saveUsersDB(db);
        console.log("Compte Admin Créé : Zelda5962 / admin");
    }
})();

window.modifyUserCoins = function(targetUsername, amount, adminUser) {
    if (!adminUser || !adminUser.isAdmin) return false;
    let db = getUsersDB();
    let found = false;
    for (let id in db) {
        if (db[id].username === targetUsername) {
            db[id].coins = amount;
            found = true;
            break;
        }
    }
    if (found) {
        saveUsersDB(db);
        return true;
    }
    return false;
};

window.getUsersData = function() { return getUsersDB(); };

window.reinitializeData = function() {
    localStorage.clear();
    location.reload(); 
};
