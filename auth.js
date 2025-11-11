// --- LOGIQUE D'AUTHENTIFICATION & UTILISATEURS ---

const LOCAL_STORAGE_KEY = 'arcadeMasterUsers';
const LOCAL_STORAGE_CURRENT_USER = 'arcadeMasterCurrentUser';

// Utilisateurs de base
const DEFAULT_USERS = [
    {
        id: 1,
        username: 'Zelda5962',
        password: 'adminpass',
        role: 'admin',
        coins: 50000,
        highScores: { space_invaders: 0, snake_infini: 0, clicker_arcade: 0 },
        skins: { owned: [0, 1, 4], active: { ship: '🚀', snake_head: '🐍' } },
        profilePictureUrl: 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png'
    },
    // Ajoutez d'autres utilisateurs par défaut ici si nécessaire
];

// Initialisation des utilisateurs dans le stockage local
function initUsers() {
    if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    } else {
        // Logique pour s'assurer que l'admin est toujours là
        let existingUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
        if (!existingUsers.some(u => u.username === 'Zelda5962')) {
            existingUsers.push(DEFAULT_USERS[0]);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingUsers));
        }
    }
}

function loadUsers() {
    initUsers();
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
}

function saveUsers(users) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users));
}

// Fonction d'enregistrement
function registerUser(username, password) {
    let users = loadUsers();
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        alert("Nom d'utilisateur déjà pris.");
        return false;
    }

    const newUser = {
        id: users.length + 1,
        username: username,
        password: password, 
        role: 'user',
        coins: 0,
        highScores: { space_invaders: 0, snake_infini: 0, clicker_arcade: 0 },
        skins: { owned: [0, 4], active: { ship: '🚀', snake_head: '🐍' } },
        profilePictureUrl: 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png'
    };

    users.push(newUser);
    saveUsers(users);
    localStorage.setItem(LOCAL_STORAGE_CURRENT_USER, JSON.stringify(newUser)); // Connexion automatique
    alert("Compte créé avec succès ! Vous êtes maintenant connecté(e).");
    return true;
}

// Fonction de connexion
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

// Fonction de déconnexion
function logout() {
    localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER);
    alert("Déconnexion réussie.");
}

// Obtenir l'utilisateur actuel
function getCurrentUser() {
    const userJson = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
}

// Mise à jour de l'utilisateur (gardée pour les futures mises à jour de profil/score)
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

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', initUsers);
