// --- LOGIQUE D'AUTHENTIFICATION ET DE GESTION DE COMPTE (auth.js) ---

const LOCAL_STORAGE_USERS_KEY = 'arcadeMasterUsers';
const LOCAL_STORAGE_CURRENT_USER = 'arcadeMasterCurrentUser';

// Utilisateurs par défaut pour le mode développement/local
const DEFAULT_USERS = [
    {
        id: 1,
        username: 'Zelda5962',
        password: 'password123', // En production, ceci serait hashé
        coins: 500,
        highScores: {
            space_invaders: 1500,
            snake_infini: 0
        },
        role: 'Admin',
        profilePictureUrl: 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png',
        skins: {
            active: {
                ship: '🚀',
                invader: '👾',
                snake_head: '🟢',
                food: '🍎'
            },
            owned: {
                ship: [100],
                invader: [200],
                snake_head: [300],
                food: [400]
            }
        }
    },
    {
        id: 2,
        username: 'TestUser',
        password: 'test',
        coins: 100,
        highScores: {
            space_invaders: 50,
            snake_infini: 100
        },
        role: 'Player',
        profilePictureUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        skins: {
            active: {
                ship: '🚀',
                invader: '👾',
                snake_head: '🟢',
                food: '🍎'
            },
            owned: {
                ship: [100],
                invader: [200],
                snake_head: [300],
                food: [400]
            }
        }
    }
];


// --- 1. FONCTIONS DE STOCKAGE ---

/**
 * Charge la liste des utilisateurs à partir du LocalStorage.
 * Initialise avec DEFAULT_USERS si le LocalStorage est vide.
 */
function loadUsers() {
    try {
        let usersJson = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
        if (!usersJson) {
            console.warn("Utilisateurs non trouvés. Initialisation des utilisateurs par défaut.");
            saveUsers(DEFAULT_USERS);
            return DEFAULT_USERS;
        }
        return JSON.parse(usersJson);
    } catch (e) {
        console.error("Erreur de chargement des utilisateurs. Retour aux valeurs par défaut.", e);
        return DEFAULT_USERS;
    }
}

/**
 * Sauvegarde la liste complète des utilisateurs dans le LocalStorage.
 * @param {Array} users - La liste des utilisateurs à sauvegarder.
 */
function saveUsers(users) {
    try {
        localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (e) {
        alert("Erreur: Le navigateur bloque l'écriture des données (LocalStorage). Le système de compte ne peut pas fonctionner en mode local.");
        console.error("Erreur de sauvegarde des utilisateurs:", e);
    }
}

/**
 * Met à jour les données d'un utilisateur spécifique dans la liste globale et sauvegarde.
 * @param {Object} updatedUser - L'objet utilisateur mis à jour.
 */
function updateGlobalUser(updatedUser) {
    const users = loadUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);

    if (index !== -1) {
        users[index] = updatedUser;
        saveUsers(users);
        // Met à jour l'utilisateur actuel si c'est celui qui a changé
        if (getCurrentUser() && getCurrentUser().id === updatedUser.id) {
            localStorage.setItem(LOCAL_STORAGE_CURRENT_USER, JSON.stringify(updatedUser));
        }
        return true;
    }
    return false;
}


// --- 2. FONCTIONS D'AUTHENTIFICATION ---

/**
 * Tente de connecter un utilisateur.
 */
function loginUser(username, password) {
    const users = loadUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        try {
            // Sauvegarde l'utilisateur connecté dans le LocalStorage
            localStorage.setItem(LOCAL_STORAGE_CURRENT_USER, JSON.stringify(user));
            alert("Connexion réussie ! Bienvenue, " + user.username + ".");
            return true;
        } catch (e) {
            alert("Erreur: Impossible de stocker l'utilisateur connecté.");
            console.error("Erreur de stockage de l'utilisateur actuel:", e);
            return false;
        }
    } else {
        alert("Erreur de connexion : Nom d'utilisateur ou mot de passe incorrect.");
        return false;
    }
}

/**
 * Tente d'enregistrer un nouvel utilisateur.
 */
function registerUser(username, password) {
    const users = loadUsers();

    if (users.find(u => u.username === username)) {
        alert("Erreur d'inscription : Ce nom d'utilisateur est déjà pris.");
        return false;
    }

    const newUser = {
        id: Date.now(), // ID unique basé sur le timestamp
        username: username,
        password: password,
        coins: 10, // Pièces de bienvenue
        highScores: {
            space_invaders: 0,
            snake_infini: 0
        },
        role: 'Player',
        profilePictureUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // Image par défaut
        skins: {
            active: {
                ship: '🚀',
                invader: '👾',
                snake_head: '🟢',
                food: '🍎'
            },
            owned: {
                ship: [100],
                invader: [200],
                snake_head: [300],
                food: [400]
            }
        }
    };

    users.push(newUser);
    saveUsers(users);

    // Connexion automatique après l'inscription
    localStorage.setItem(LOCAL_STORAGE_CURRENT_USER, JSON.stringify(newUser));
    alert("Compte créé avec succès ! Bienvenue, " + newUser.username + ".");
    return true;
}

/**
 * Déconnecte l'utilisateur actuel.
 */
function logout() {
    try {
        localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER);
        alert("Déconnexion réussie.");
    } catch (e) {
        console.error("Erreur lors de la déconnexion:", e);
    }
}


// --- 3. FONCTIONS UTILITAIRES ---

/**
 * Récupère l'utilisateur actuellement connecté.
 * @returns {Object|null} L'objet utilisateur ou null si déconnecté.
 */
function getCurrentUser() {
    try {
        const userJson = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER);
        const user = userJson ? JSON.parse(userJson) : null;
        
        // --- LOGIQUE DE CONTOURNEMENT POUR LES PIÈCES EN MODE DÉCONNECTÉ (CODE KONAMI) ---
        if (!user) {
            const tempCoins = parseInt(localStorage.getItem('tempCheatCoins') || '0');
            if (tempCoins > 0) {
                 // Crée un utilisateur fantôme temporaire pour afficher les pièces et gérer les achats simulés
                 return { 
                     username: 'Joueur Déconnecté', 
                     coins: tempCoins, 
                     id: 0,
                     // Fournit des structures de base pour éviter les erreurs dans la boutique
                     highScores: { space_invaders: 0, snake_infini: 0 },
                     role: 'Player',
                     profilePictureUrl: '👤',
                     skins: { active: { ship: '🚀', invader: '👾' } }
                 };
            }
        }
        // --- FIN LOGIQUE DE CONTOURNEMENT ---

        return user;
    } catch (e) {
        console.error("Erreur de lecture du stockage local pour l'utilisateur actuel:", e);
        return null; 
    }
}

/**
 * Met à jour le mot de passe et/ou l'URL de l'image de profil de l'utilisateur actuel.
 */
function updateProfile(newPassword, newPicUrl) {
    const user = getCurrentUser();
    if (!user || user.id === 0) { // Bloque la modification si c'est l'utilisateur fantôme
        alert("Veuillez vous connecter pour modifier votre profil.");
        return false;
    }

    if (newPassword) {
        user.password = newPassword;
    }
    if (newPicUrl) {
        user.profilePictureUrl = newPicUrl;
    }
    
    if (updateGlobalUser(user)) {
        alert("Profil mis à jour avec succès !");
        return true;
    }
    alert("Erreur lors de la mise à jour du profil.");
    return false;
}

/**
 * Met à jour un high score pour l'utilisateur actuel (si connecté).
 */
function updateGlobalUserScore(gameKey, newScore) {
    const user = getCurrentUser();
    
    if (!user || user.id === 0) {
        console.log("Score enregistré temporairement (Joueur déconnecté).");
        return false;
    }
    
    if (newScore > (user.highScores[gameKey] || 0)) {
        user.highScores[gameKey] = newScore;
        updateGlobalUser(user);
        return true;
    }
    return false;
}
