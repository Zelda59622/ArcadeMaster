// --- GESTION DE L'AUTHENTIFICATION ET DES DONNÉES UTILISATEUR ---

const LOCAL_STORAGE_KEY = 'arcadeMasterUsers';
const LOCAL_STORAGE_CURRENT_USER = 'arcadeMasterCurrentUser';

// Utilisateurs de base pour le test
const DEFAULT_USERS = [
    {
        id: 1,
        username: 'admin',
        password: 'password', // Ceci est juste pour le test, ne pas faire en prod !
        role: 'admin',
        coins: 15000,
        highScores: {
            space_invaders: 12000,
            snake_infini: 0,
            clicker_arcade: 0
        },
        skins: {
            owned: [0, 1, 4], 
            active: {
                ship: '🛸', 
                snake_head: '🐍'
            }
        },
        profilePictureUrl: 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png'
    },
    {
        id: 2,
        username: 'joueur',
        password: 'pass',
        role: 'user',
        coins: 250,
        highScores: {
            space_invaders: 450,
            snake_infini: 0,
            clicker_arcade: 0
        },
        skins: {
            owned: [0, 4],
            active: {
                ship: '🚀',
                snake_head: '🐍'
            }
        },
        profilePictureUrl: 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png'
    },
    {
        id: 3,
        username: 'Zelda5962',
        password: 'adminpass',
        role: 'admin',
        coins: 50000,
        highScores: {
            space_invaders: 0,
            snake_infini: 0,
            clicker_arcade: 0
        },
        skins: {
            owned: [0, 1, 4],
            active: {
                ship: '🚀',
                snake_head: '🐍'
            }
        },
        profilePictureUrl: 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png'
    }
];

// Initialisation des utilisateurs
function initUsers() {
    if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    } else {
        let existingUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
        const zeldaExists = existingUsers.some(u => u.username === 'Zelda5962');
        
        if (!zeldaExists) {
            existingUsers.push(DEFAULT_USERS[2]);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingUsers));
        }
    }
}

// Charger tous les utilisateurs
function loadUsers() {
    initUsers();
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
}

// Sauvegarder tous les utilisateurs
function saveUsers(users) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users));
}

// Enregistrement (Amélioré: Alerte déplacée pour garantie)
function registerUser(username, password) {
    let users = loadUsers();

    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        alert("Nom d'utilisateur déjà pris."); // Affichage garanti en cas d'échec
        return false;
    }

    const newUser = {
        id: users.length + 1,
        username: username,
        password: password, 
        role: 'user',
        coins: 0,
        highScores: {
            space_invaders: 0,
            snake_infini: 0,
            clicker_arcade: 0
        },
        skins: {
            owned: [0, 4], 
            active: {
                ship: '🚀',
                snake_head: '🐍'
            }
        },
        profilePictureUrl: 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png'
    };

    try {
        users.push(newUser);
        saveUsers(users);
        loginUser(username, password, true); // Connexion automatique, sans pop-up de connexion
        alert("Compte créé avec succès ! Vous êtes maintenant connecté(e)."); // Affichage garanti en cas de succès
        return true;
    } catch (e) {
        alert("Erreur critique lors de la création du compte. Vérifiez le stockage.");
        console.error("Erreur d'inscription:", e);
        return false;
    }
}

// Connexion (Amélioré: Alerte déplacée pour garantie)
function loginUser(username, password, suppressAlert = false) {
    const users = loadUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        try {
            localStorage.setItem(LOCAL_STORAGE_CURRENT_USER, JSON.stringify(user));
            if (!suppressAlert) {
                alert("Connexion réussie ! Bienvenue " + user.username); // Affichage garanti
            }
            return true;
        } catch (e) {
            alert("Erreur critique lors de la connexion. Impossible de stocker l'utilisateur.");
            console.error("Erreur de connexion:", e);
            return false;
        }
    } else {
        alert("Nom d'utilisateur ou mot de passe incorrect."); // Affichage garanti en cas d'échec
        return false;
    }
}

// Déconnexion
function logout() {
    localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER);
    alert("Déconnexion réussie.");
}

// Obtenir l'utilisateur actuellement connecté
function getCurrentUser() {
    const userJson = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
}

// Mettre à jour l'utilisateur dans la liste globale
function updateGlobalUser(updatedUser) {
    let users = loadUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    
    if (index !== -1) {
        users[index] = updatedUser;
        saveUsers(users);
        
        localStorage.setItem(LOCAL_STORAGE_CURRENT_USER, JSON.stringify(updatedUser));
        return true;
    }
    return false;
}

// Mise à jour du meilleur score
function updateHighScore(gameId, newScore) {
    const user = getCurrentUser();
    if (!user) return false;

    if (!user.highScores) {
        user.highScores = { space_invaders: 0, snake_infini: 0, clicker_arcade: 0 };
    }

    if (newScore > (user.highScores[gameId] || 0)) {
        user.highScores[gameId] = newScore;
        updateGlobalUser(user);
        return true; 
    }
    return false;
}

// Mise à jour des pièces
function updateCoins(amount) {
    const user = getCurrentUser();
    if (!user) return false;

    user.coins += amount;
    updateGlobalUser(user);
    return user.coins;
}

// NOUVEAU : Fonction pour mettre à jour le profil
function updateProfile(newPassword, newProfilePictureUrl) {
    const user = getCurrentUser();
    if (!user) return false;

    if (newPassword) {
        user.password = newPassword;
    }
    if (newProfilePictureUrl) {
        user.profilePictureUrl = newProfilePictureUrl;
    }
    
    updateGlobalUser(user);
    alert("Votre profil a été mis à jour avec succès.");
    return true;
}

// Assurez-vous que les utilisateurs de base sont initialisés au chargement
document.addEventListener('DOMContentLoaded', initUsers);
