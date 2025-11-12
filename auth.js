// Dépendance : ce script nécessite la fonction updateGlobalUser() de base.js

// --- 1. FONCTIONS UTILITAIRES ---

// Récupère la liste des utilisateurs enregistrés
function getUsers() {
    const usersData = localStorage.getItem('users');
    return usersData ? JSON.parse(usersData) : [];
}

// Enregistre la liste des utilisateurs
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}


// --- 2. GESTION DE L'ADMIN ET DES DONNÉES INITIALES ---

function loadInitialData() {
    let users = getUsers();

    // 1. Définir le compte Admin si non existant
    const adminUsername = 'Zelda5962';
    const adminPassword = '?Moi123!';
    let adminExists = users.some(user => user.username === adminUsername);

    if (!adminExists) {
        console.log(`Création du compte Administrateur : ${adminUsername}`);
        const adminUser = {
            id: 1, // ID arbitraire pour l'admin
            username: adminUsername,
            password: adminPassword,
            coins: 0, 
            scores: { space_invaders: 0 }, 
            skins: { active: { /* default skins */ }, owned: { /* default skins */ } },
            isAdmin: true 
        };
        users.push(adminUser);
        saveUsers(users);
    }
    
    // 2. S'assurer que le user ID est bien géré
    if (users.length > 0) {
        const maxId = users.reduce((max, user) => (user.id > max ? user.id : max), 0);
        localStorage.setItem('nextUserId', maxId + 1);
    } else {
        localStorage.setItem('nextUserId', 2);
    }

    // Pas besoin d'initialiser currentUser ici, base.js le fait au besoin.
}


// --- 3. FONCTIONS D'AUTHENTIFICATION (Logique simple de recherche) ---

function loginUser(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        updateGlobalUser(user); 
        console.log(`Utilisateur connecté: ${user.username}`);
        return true;
    } else {
        console.log("Échec de la connexion. Nom d'utilisateur ou mot de passe incorrect.");
        return false;
    }
}

function registerUser(username, password) {
    const users = getUsers();
    
    if (users.some(u => u.username === username)) {
        console.log("Échec de l'inscription. Ce nom d'utilisateur est déjà pris.");
        return false;
    }

    const nextId = parseInt(localStorage.getItem('nextUserId') || '2');
    
    const newUser = {
        id: nextId,
        username: username,
        password: password,
        coins: 1000, 
        scores: { space_invaders: 0 },
        skins: { active: { /* default skins */ }, owned: { /* default skins */ } },
        isAdmin: false
    };

    users.push(newUser);
    saveUsers(users);
    localStorage.setItem('nextUserId', nextId + 1);

    updateGlobalUser(newUser); 
    console.log(`Nouvel utilisateur enregistré et connecté: ${username}`);
    return true;
}

function logoutUser() {
    // Définit l'utilisateur courant sur le profil "Déconnecté" (ID 0)
    updateGlobalUser({ 
        id: 0, 
        username: 'Joueur Déconnecté', 
        coins: parseInt(localStorage.getItem('tempCheatCoins') || '0'), 
        skins: { active: {}, owned: {} },
        isAdmin: false
    });
    console.log('Utilisateur déconnecté.');
}


// --- 4. EXÉCUTION INITIALE ET GESTION DU FORMULAIRE ---

document.addEventListener('DOMContentLoaded', () => {
    // S'assure que les données initiales (dont l'admin) sont chargées
    loadInitialData(); 
    
    // --- GESTION DU FORMULAIRE DE CONNEXION (sur compte.html) ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            if (loginUser(username, password)) {
                // **AJOUT du message de confirmation**
                alert(`Connexion réussie ! Bienvenue, ${username}.`);
                // Redirige après la confirmation, sans vider les champs du formulaire.
                window.location.href = 'index.html'; 
            } else {
                alert("Échec : Nom d'utilisateur ou mot de passe incorrect.");
            }
        });
    }
    
    // Si vous aviez un formulaire d'inscription, le même principe s'appliquerait ici
    // Exemple hypothétique:
    /*
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
         registerForm.addEventListener('submit', (event) => {
             event.preventDefault();
             // ... Récupération des valeurs ...
             if (registerUser(username, password)) {
                 alert(`Inscription réussie ! Bienvenue, ${username}.`);
                 window.location.href = 'index.html';
             } else {
                 alert("Échec : Ce nom d'utilisateur est déjà pris.");
             }
         });
    }
    */
});
