// Dépendance : ce script nécessite la fonction updateGlobalUser() de base.js

// --- 1. FONCTIONS UTILITAIRES (Ne change pas) ---

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

    // S'assurer que le compte Admin est présent
    const adminUsername = 'Zelda5962';
    const adminPassword = '?Moi123!';
    let adminExists = users.some(user => user.username === adminUsername);

    if (!adminExists) {
        console.log(`Création du compte Administrateur : ${adminUsername}`);
        const adminUser = {
            id: 1, 
            username: adminUsername,
            password: adminPassword, 
            coins: 0, 
            scores: { space_invaders: 0 }, 
            skins: { active: { /* default skins */ }, owned: { /* default skins */ } },
            isAdmin: true 
        };
        // Ajoute l'admin à la liste des utilisateurs existants (s'il y en a)
        users.push(adminUser); 
        saveUsers(users);
    }
    
    // Gère le prochain ID utilisateur pour les inscriptions
    if (users.length > 0) {
        const maxId = users.reduce((max, user) => (user.id > max ? user.id : max), 0);
        localStorage.setItem('nextUserId', maxId + 1);
    } else {
        localStorage.setItem('nextUserId', 2);
    }
}


// --- 3. FONCTIONS D'AUTHENTIFICATION (Login et Inscription rétablie) ---

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

// Rétablissement de la fonction d'inscription
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
        coins: 1000, // Petit bonus de départ pour les nouveaux comptes
        scores: { space_invaders: 0 },
        skins: { active: { /* default skins */ }, owned: { /* default skins */ } },
        isAdmin: false // Tous les nouveaux comptes ne sont PAS admin
    };

    users.push(newUser);
    saveUsers(users);
    localStorage.setItem('nextUserId', nextId + 1);

    updateGlobalUser(newUser); 
    console.log(`Nouvel utilisateur enregistré et connecté: ${username}`);
    return true;
}


function logoutUser() {
    // Le statut "Déconnecté" n'est pas un compte en soi, c'est l'état par défaut.
    updateGlobalUser({ 
        id: 0, // ID 0 pour Déconnecté
        username: 'Joueur Déconnecté', 
        coins: 0, // Toujours 0 en étant déconnecté (plus de tempCheatCoins)
        skins: { active: {}, owned: {} },
        isAdmin: false
    });
    console.log('Utilisateur déconnecté.');
}


// --- 4. FONCTIONNALITÉ ADMIN (Modification des Pièces) ---

function modifyUserCoins(targetUsername, newCoinsAmount, adminUser) {
    if (!adminUser || !adminUser.isAdmin) {
        console.error("Accès refusé. Seul un administrateur peut modifier les pièces.");
        return false;
    }

    let users = getUsers();
    const targetUserIndex = users.findIndex(u => u.username === targetUsername);

    if (targetUserIndex !== -1) {
        const oldCoins = users[targetUserIndex].coins;
        users[targetUserIndex].coins = newCoinsAmount;
        saveUsers(users);
        console.log(`Pièces de l'utilisateur ${targetUsername} modifiées : ${oldCoins} -> ${newCoinsAmount}.`);
        
        if (targetUsername === adminUser.username) {
            updateGlobalUser(users[targetUserIndex]);
        }
        
        return true;
    } else {
        console.error(`Utilisateur cible "${targetUsername}" non trouvé.`);
        return false;
    }
}


// --- 5. EXÉCUTION INITIALE ET GESTION DU FORMULAIRE ---

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
                alert(`Connexion réussie ! Bienvenue, ${username}.`);
                window.location.href = 'index.html'; 
            } else {
                alert("Échec : Nom d'utilisateur ou mot de passe incorrect.");
            }
        });
    }
    
    // --- GESTION DU FORMULAIRE D'INSCRIPTION (à ajouter sur compte.html) ---
    // Cette partie est commentée car le formulaire d'inscription n'est pas dans le HTML actuel.
    // Vous devez ajouter un formulaire avec l'ID 'registerForm' et des champs 'registerUsername'/'registerPassword'
    // sur compte.html pour que cette logique fonctionne.

    // const registerForm = document.getElementById('registerForm');
    // if (registerForm) {
    //      registerForm.addEventListener('submit', (event) => {
    //          event.preventDefault();
    //          const username = document.getElementById('registerUsername').value;
    //          const password = document.getElementById('registerPassword').value;
    //          
    //          if (registerUser(username, password)) {
    //              alert(`Inscription réussie ! Bienvenue, ${username}.`);
    //              window.location.href = 'index.html';
    //          } else {
    //              alert("Échec : Ce nom d'utilisateur est déjà pris.");
    //          }
    //      });
    // }
});
