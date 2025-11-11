// --- LOGIQUE D'AUTHENTIFICATION & UTILISATEURS (GÉNÉRÉE PAR ADMIN_DATA.HTML) ---

const LOCAL_STORAGE_KEY = 'arcadeMasterUsers';
const LOCAL_STORAGE_CURRENT_USER = 'arcadeMasterCurrentUser';

// DONNÉES UTILISATEURS MISES À JOUR MANUELLEMENT (DEFAULT_USERS)
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
    }
];

// Initialisation des utilisateurs
function initUsers() {
    // Si l'utilisateur n'a pas de données, on utilise les DEFAULT_USERS.
    if (!localStorage.getItem(LOCAL_STORAGE_KEY) || JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)).length === 0) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    }
}

function loadUsers() {
    initUsers();
    // Nous préférons charger depuis localStorage, mais si c'est vide, nous utilisons le DEFAULT_USERS
    let storedUsers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (storedUsers.length === 0) {
        // Fallback: Si le stockage est vide (première exécution ou cache vidé), on utilise la base codée.
        return DEFAULT_USERS;
    }
    return storedUsers;
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
    localStorage.setItem(LOCAL_STORAGE_CURRENT_USER, JSON.stringify(newUser));
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

// Déconnexion
function logout() {
    localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER);
    alert("Déconnexion réussie.");
}

// Obtenir l'utilisateur actuellement connecté
function getCurrentUser() {
    try {
        const userJson = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER);
        return userJson ? JSON.parse(userJson) : null;
    } catch (e) {
        console.error("Erreur de lecture du stockage local pour l'utilisateur actuel:", e);
        return null; 
    }
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

// Mise à jour du profil
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
