// --- auth.js ---

// Initialise ou récupère la base de données des utilisateurs
function getUsersDB() {
    const db = localStorage.getItem('usersDB');
    return db ? JSON.parse(db) : {};
}

// Sauvegarde la base de données
function saveUsersDB(db) {
    localStorage.setItem('usersDB', JSON.stringify(db));
}

// Récupère l'ID de l'utilisateur actuellement connecté
function getActiveUserId() {
    return parseInt(localStorage.getItem('activeUserId') || 0);
}

// Enregistre l'ID de l'utilisateur connecté
function setActiveUserId(id) {
    localStorage.setItem('activeUserId', id);
}

// Récupère l'objet utilisateur actuel (disponible globalement via base.js)
window.getCurrentUser = function() {
    const activeId = getActiveUserId();
    const db = getUsersDB();
    
    if (activeId !== 0 && db[activeId]) {
        return db[activeId];
    }
    // Utilisateur par défaut si non connecté
    return { 
        id: 0, 
        username: 'Invité', 
        coins: 0,
        scores: {},
        skins: {
            active: { vessel: 'vessel_base', monster: 'monster_base' },
            owned: { 'vessel_base': true }
        }
    };
}


// **********************************
// AUTHENTIFICATION (Utilisé par compte.html)
// **********************************

window.register = function(username, password) {
    const db = getUsersDB();
    // Vérifier si le nom d'utilisateur est déjà pris
    for (const id in db) {
        if (db[id].username === username) {
            return false; // Échec de l'inscription
        }
    }

    const newId = Date.now(); // Utilise le timestamp comme ID unique
    
    // Créer le nouvel utilisateur
    db[newId] = {
        id: newId,
        username: username,
        password: password, // Pas sécurisé pour le réel, mais simple pour cet exemple
        coins: 200000, // Pièces de départ
        scores: {},
        skins: {
            active: { vessel: 'vessel_base', monster: 'monster_base' },
            owned: { 'vessel_base': true } // Possède le skin de base
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
            // La fonction updateTopBar doit exister dans base.js
            if (typeof window.updateTopBar === 'function') {
                window.updateTopBar();
            }
            return true; // Connexion réussie
        }
    }
    return false; // Échec de la connexion
}

window.logout = function() {
    setActiveUserId(0);
}


// **********************************
// FONCTIONS DE LA BOUTIQUE (Utilisé par boutique.html)
// **********************************

// Retire des pièces
window.deductCoins = function(amount) {
    const user = getCurrentUser();
    if (user.id === 0) return false; // Ne peut pas acheter si déconnecté

    let db = getUsersDB();
    if (db[user.id].coins >= amount) {
        db[user.id].coins -= amount;
        saveUsersDB(db);
        
        // Mettre à jour l'utilisateur actif en mémoire (important)
        updateGlobalUser(db[user.id]); 
        
        return true; // Achat réussi
    }
    return false; // Fonds insuffisants
}

// Ajoute un skin à la collection de l'utilisateur
window.addOwnedSkin = function(skinId) {
    const user = getCurrentUser();
    if (user.id === 0) return;

    let db = getUsersDB();
    if (!db[user.id].skins.owned) {
        db[user.id].skins.owned = {};
    }
    db[user.id].skins.owned[skinId] = true;
    saveUsersDB(db);
    
    // Mettre à jour l'utilisateur actif en mémoire
    updateGlobalUser(db[user.id]);
}

// Équipe un skin
window.equipSkin = function(skinId, itemType) {
    const user = getCurrentUser();
    if (user.id === 0) return;

    let db = getUsersDB();
    if (db[user.id].skins.owned && db[user.id].skins.owned[skinId]) {
        
        // Assurez-vous que le type existe (ex: 'vessel', 'monster')
        if (!db[user.id].skins.active) {
             db[user.id].skins.active = {};
        }

        db[user.id].skins.active[itemType] = skinId;
        saveUsersDB(db);
        
        // Mettre à jour l'utilisateur actif en mémoire
        updateGlobalUser(db[user.id]);
    }
}

// **********************************
// FONCTIONS DU JEU (Ajouter score, etc.)
// **********************************

window.saveScore = function(gameName, finalScore) {
    const user = getCurrentUser();
    if (user.id === 0) return;

    let db = getUsersDB();
    if (!db[user.id].scores) {
        db[user.id].scores = {};
    }
    
    // Si c'est un nouveau meilleur score ou le premier
    if (!db[user.id].scores[gameName] || finalScore > db[user.id].scores[gameName]) {
        db[user.id].scores[gameName] = finalScore;
    }

    saveUsersDB(db);
    // Mettre à jour l'utilisateur actif en mémoire
    updateGlobalUser(db[user.id]);
}

window.addCoins = function(amount) {
    const user = getCurrentUser();
    if (user.id === 0) return;

    let db = getUsersDB();
    db[user.id].coins += amount;
    saveUsersDB(db);
    
    // Mettre à jour l'utilisateur actif en mémoire et la top bar
    updateGlobalUser(db[user.id]);
    if (typeof window.updateTopBar === 'function') {
        window.updateTopBar();
    }
}
