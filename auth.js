// --- auth.js ---

// 1. GESTION DE LA BASE DE DONNÉES (LECTURE/ÉCRITURE)
window.getUsersData = function() {
    const db = localStorage.getItem('usersDB');
    let parsedDB = db ? JSON.parse(db) : {};
    
    // Sécurité : Force Zelda5962 à être Admin si le compte existe
    for (let id in parsedDB) {
        if (parsedDB[id].username === "Zelda5962") {
            parsedDB[id].isAdmin = true;
        }
    }
    return parsedDB;
};

function saveUsersDB(db) {
    localStorage.setItem('usersDB', JSON.stringify(db));
}

function getActiveUserId() {
    return localStorage.getItem('activeUserId') || "0";
}

function setActiveUserId(id) {
    localStorage.setItem('activeUserId', id);
}

// Met à jour l'affichage des pièces en haut de l'écran
function updateGlobalUserDisplay() {
    if (typeof window.updateTopBar === 'function') {
        window.updateTopBar();
    }
}

window.getCurrentUser = function() {
    const activeId = getActiveUserId();
    const db = window.getUsersData();
    
    if (activeId !== "0" && db[activeId]) {
        return db[activeId];
    }
    return { 
        id: "0", 
        username: 'Invité', 
        coins: 0,
        isAdmin: false,
        skins: { active: { vessel: 'vessel_base' }, owned: { 'vessel_base': true } }
    };
};

// --- AUTHENTIFICATION ---

window.register = function(username, password) {
    const db = window.getUsersData();
    for (const id in db) {
        if (db[id].username === username) return false;
    }

    const newId = Date.now().toString();
    db[newId] = {
        id: newId,
        username: username,
        password: password,
        coins: 200000,
        isAdmin: (username === "Zelda5962"),
        scores: {},
        skins: {
            active: { vessel: 'vessel_base', monster: 'monster_base' },
            owned: { 'vessel_base': true }
        }
    };
    
    saveUsersDB(db);
    return true;
};

window.login = function(username, password) {
    const db = window.getUsersData();
    for (const id in db) {
        const user = db[id];
        if (user.username === username && user.password === password) {
            setActiveUserId(user.id);
            updateGlobalUserDisplay();
            return true;
        }
    }
    return false;
};

window.logout = function() {
    setActiveUserId("0");
    location.href = 'index.html';
};

// --- NOUVEAU SYSTÈME D'ÉCONOMIE (RÉPARÉ) ---

window.addCoins = function(amount) {
    const user = window.getCurrentUser();
    if (user.id === "0") return false;

    let db = window.getUsersData();
    db[user.id].coins += parseInt(amount);

    saveUsersDB(db);
    updateGlobalUserDisplay();
    return true;
};

window.deductCoins = function(amount) {
    const user = window.getCurrentUser();
    if (user.id === "0") return false;

    let db = window.getUsersData();
    if (db[user.id].coins >= amount) {
        db[user.id].coins -= parseInt(amount);
        saveUsersDB(db);
        updateGlobalUserDisplay();
        return true;
    }
    return false;
};

window.modifyUserCoins = function(targetUsername, amount, adminUser) {
    if (!adminUser || !adminUser.isAdmin) return false;
    
    let db = window.getUsersData();
    let found = false;
    
    for (let id in db) {
        // Comparaison insensible à la casse (Zelda = zelda)
        if (db[id].username.toLowerCase() === targetUsername.toLowerCase()) {
            db[id].coins = parseInt(amount);
            found = true;
            break;
        }
    }
    
    if (found) {
        saveUsersDB(db);
        updateGlobalUserDisplay();
        return true;
    }
    return false;
};

// --- GESTION DES SKINS ---

window.addOwnedSkin = function(skinId) {
    const user = window.getCurrentUser();
    if (user.id === "0") return;

    let db = window.getUsersData();
    if (!db[user.id].skins.owned) db[user.id].skins.owned = {};
    
    db[user.id].skins.owned[skinId] = true;
    saveUsersDB(db);
};

// --- INITIALISATION AUTO ---

(function initAdmin() {
    let db = window.getUsersData();
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

window.reinitializeData = function() {
    localStorage.clear();
    location.reload(); 
};
