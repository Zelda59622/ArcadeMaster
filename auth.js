// Dépendance : ce script nécessite la fonction updateGlobalUser() de base.js

// --- 1. FONCTIONS UTILITAIRES ---

function getUsers() {
    const usersData = localStorage.getItem('users');
    return usersData ? JSON.parse(usersData) : [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// --- 2. GESTION DE L'ADMIN ET DES DONNÉES INITIALES ---

function loadInitialData() {
    let users = getUsers();
    const adminUsername = 'Zelda5962';
    const adminPassword = '?Moi123!';
    let adminExists = users.some(user => user.username === adminUsername);

    if (!adminExists) {
        console.log(`Création du compte Administrateur : ${adminUsername}`);
        const adminUser = {
            id: 1, 
            username: Zelda5962,
            password: Moi123!, 
            coins: 0, 
            scores: { space_invaders: 0 }, 
            skins: { active: {}, owned: {} },
            isAdmin: true 
        };
        users.push(adminUser); 
        saveUsers(users);
    }
    
    if (users.length > 0) {
        const maxId = users.reduce((max, user) => (user.id > max ? user.id : max), 0);
        localStorage.setItem('nextUserId', maxId + 1);
    } else {
        localStorage.setItem('nextUserId', 2);
    }
}


// --- 3. FONCTIONS D'AUTHENTIFICATION & GESTION DU COMPTE ---

function loginUser(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        updateGlobalUser(user); 
        return true;
    } 
    return false;
}

function registerUser(username, password) {
    const users = getUsers();
    if (users.some(u => u.username === username)) {
        return false;
    }

    const nextId = parseInt(localStorage.getItem('nextUserId') || '2');
    const newUser = {
        id: nextId,
        username: username,
        password: password,
        coins: 1000, 
        scores: { space_invaders: 0 },
        skins: { active: {}, owned: {} },
        isAdmin: false
    };

    users.push(newUser);
    saveUsers(users);
    localStorage.setItem('nextUserId', nextId + 1);

    updateGlobalUser(newUser); 
    return true;
}

function logoutUser() {
    updateGlobalUser({ 
        id: 0, 
        username: 'Joueur Déconnecté', 
        coins: 0, 
        skins: { active: {}, owned: {} },
        isAdmin: false
    });
}

/**
 * Met à jour le mot de passe dans le localStorage.
 * @param {string} username - Nom d'utilisateur.
 * @param {string} newPassword - Le nouveau mot de passe.
 */
function updatePassword(username, newPassword) {
    let users = getUsers();
    const userIndex = users.findIndex(u => u.username === username);

    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        saveUsers(users);
        
        // Met à jour l'utilisateur dans la session courante
        updateGlobalUser(users[userIndex]); 
        return true;
    }
    return false;
}

// Fonction pour modifier les pièces (Logique Admin, laissée ici pour référence)
function modifyUserCoins(targetUsername, newCoinsAmount, adminUser) {
    if (!adminUser || !adminUser.isAdmin) {
        console.error("Accès refusé. Seul un administrateur peut modifier les pièces.");
        return false;
    }
    // ... (Reste de la logique de modification)
}


// --- 4. EXÉCUTION INITIALE ET GESTION DES FORMULAIRES ---

document.addEventListener('DOMContentLoaded', () => {
    loadInitialData(); 
    
    // CONNEXION
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            if (loginUser(username, password)) {
                alert(`Connexion réussie ! Bienvenue, ${username}.`);
                window.location.reload(); // Recharger pour afficher le menu de profil
            } else {
                alert("Échec : Nom d'utilisateur ou mot de passe incorrect.");
            }
        });
    }

    // INSCRIPTION
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;

            if (registerUser(username, password)) {
                alert(`Inscription réussie ! Bienvenue, ${username}.`);
                window.location.reload(); 
            } else {
                alert("Échec : Ce nom d'utilisateur est déjà pris.");
            }
        });
    }

    // CHANGEMENT DE MOT DE PASSE
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;
            const currentUser = getCurrentUser(); // Assume que getCurrentUser est dispo via base.js

            if (newPassword !== confirmNewPassword) {
                alert("Les mots de passe ne correspondent pas.");
                return;
            }

            if (updatePassword(currentUser.username, newPassword)) {
                alert("Mot de passe mis à jour avec succès !");
                // Optionnel: Réinitialiser les champs
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmNewPassword').value = '';
            } else {
                alert("Erreur lors de la mise à jour du mot de passe.");
            }
        });
    }

    // DÉCONNEXION
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            logoutUser();
            alert("Vous avez été déconnecté.");
            window.location.reload(); // Recharger pour afficher les formulaires de connexion
        });
    }

    // GESTION DE LA PDP (Simulée - le vrai upload nécessite un serveur)
    const pdpForm = document.getElementById('pdpForm');
    if (pdpForm) {
        pdpForm.addEventListener('submit', (event) => {
            event.preventDefault();
            // Ici, vous auriez besoin d'un serveur pour sauvegarder l'image.
            alert("Fonctionnalité PDP : L'image serait envoyée au serveur ici. (Simulation réussie)");
        });
    }
});
