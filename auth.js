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
            owned: [0, 1, 4], // 0: base invader, 1: éclair, 4: base snake
            active: {
                ship: '🛸', // Vaisseau Éclair
                snake_head: '🐍'
            }
        }
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
        }
    }
];

// Initialisation des utilisateurs
function initUsers() {
    if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
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

// Enregistrement
function registerUser(username, password) {
    let users = loadUsers();

    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        alert("Nom d'utilisateur déjà pris.");
        return false;
    }

    const newUser = {
        id: users.length + 1,
        username: username,
        password: password, // Encore une fois, non sécurisé, pour le test uniquement
        role: 'user',
        coins: 0,
        highScores: {
            space_invaders: 0,
            snake_infini: 0,
            clicker_arcade: 0
        },
        skins: {
            owned: [0, 4], // Skins de base par défaut
            active: {
                ship: '🚀',
                snake_head: '🐍'
            }
        }
    };

    users.push(newUser);
    saveUsers(users);
    loginUser(username, password); // Connexion automatique après inscription
    alert("Compte créé et connecté !");
    return true;
}

// Connexion
function loginUser(username, password) {
    const users = loadUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem(LOCAL_STORAGE_CURRENT_USER, JSON.stringify(user));
        alert("Connexion réussie ! Bienvenue " + user.username);
        return true;
    } else {
        alert("Nom d'utilisateur ou mot de passe incorrect.");
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

// Mettre à jour l'utilisateur dans la liste globale (appelé après score, achat, etc.)
function updateGlobalUser(updatedUser) {
    let users = loadUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    
    if (index !== -1) {
        // Mettre à jour dans la base de données (localStorage)
        users[index] = updatedUser;
        saveUsers(users);
        
        // Mettre à jour l'utilisateur dans la session courante (localStorage)
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
        return true; // Nouveau record
    }
    return false; // Pas de nouveau record
}

// Mise à jour des pièces
function updateCoins(amount) {
    const user = getCurrentUser();
    if (!user) return false;

    user.coins += amount;
    updateGlobalUser(user);
    return user.coins;
}

// Assurez-vous que les utilisateurs de base sont initialisés au chargement
document.addEventListener('DOMContentLoaded', initUsers);
