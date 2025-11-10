// =========================================================
// 1. CLASSE SON POUR LES MENUS (utilise button-pressed.mp3)
// =========================================================

class Sound {
    constructor(src, volume = 0.3) {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        document.body.appendChild(this.sound);
        this.sound.volume = volume;
    }

    play() {
        this.sound.currentTime = 0; 
        this.sound.play().catch(e => {});
    }
}

// Déclaration du son de clic
const sfxButtonClick = new Sound("button-pressed.mp3", 0.3);


// =========================================================
// 2. GESTION DES UTILISATEURS ET AUTHENTIFICATION
// =========================================================

// Sauvegarde l'objet utilisateurs dans le localStorage
function saveUsers(users) {
    localStorage.setItem('gameUsers', JSON.stringify(users));
}

// Charge l'objet utilisateurs depuis le localStorage
function loadUsers() {
    const usersJson = localStorage.getItem('gameUsers');
    return usersJson ? JSON.parse(usersJson) : {};
}

// Récupère l'utilisateur actuellement connecté
function getCurrentUser() {
    return localStorage.getItem('currentUser');
}

// Déconnexion de l'utilisateur
function logout() {
    localStorage.removeItem('currentUser');
    alert("Déconnexion réussie.");
    window.location.href = 'authentification.html'; 
}

// Fonction de Connexion
function login(username, password) {
    const users = loadUsers();
    if (users[username] && users[username].password === password) {
        localStorage.setItem('currentUser', username);
        alert(`Bienvenue, ${username}!`);
        window.location.href = 'index.html'; 
        return true;
    } else {
        alert("Nom d'utilisateur ou mot de passe incorrect.");
        return false;
    }
}

// Fonction d'Inscription
function register(username, password) {
    const users = loadUsers();
    if (users[username]) {
        alert("Ce nom d'utilisateur est déjà pris.");
        return false;
    }

    users[username] = {
        password: password,
        role: "Joueur Standard",
        games: {
            space_invaders: {
                highScore: 0
            }
        }
    };
    saveUsers(users);
    localStorage.setItem('currentUser', username);
    alert(`Compte créé et connecté. Bienvenue, ${username}!`);
    window.location.href = 'index.html';
    return true;
}

// Exportation des fonctions pour qu'elles soient utilisables dans d'autres scripts (comme space_invaders.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { saveUsers, loadUsers, getCurrentUser };
}


// =========================================================
// 3. LOGIQUE D'INITIALISATION ET ÉVÉNEMENTS DOM
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- A. DÉCLENCHEMENT DES SONS AU CLIC ---
    const elementsToListen = [
        '#navbar a',
        '#auth-controls button',
        '.menu-dropdown a', 
        'button', 
        '#score-board div',
        '#score-board li',
        '.hamburger-menu'
    ];
    
    function playClickSound() {
        sfxButtonClick.play();
    }

    elementsToListen.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.addEventListener('mousedown', playClickSound);
        });
    });

    // --- B. GESTION DES FORMULAIRES ET DÉCONNEXION ---
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutButton = document.getElementById('logoutButton');
    const hamburgerMenu = document.getElementById('hamburgerMenu'); // ID supposé
    const menuDropdown = document.getElementById('menuDropdown');   // ID supposé

    // Gère l'envoi du formulaire de connexion
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;
            login(username, password);
        });
    }

    // Gère l'envoi du formulaire d'inscription
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;
            register(username, password);
        });
    }
    
    // Gère le bouton de déconnexion (sur Mon Compte)
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
    
    // Gère l'affichage du menu déroulant (Hamburger/Profil)
    if (hamburgerMenu && menuDropdown) {
        hamburgerMenu.addEventListener('click', (e) => {
            e.stopPropagation(); // Empêche la fermeture immédiate
            menuDropdown.classList.toggle('show');
        });

        // Ferme le menu si l'utilisateur clique ailleurs
        document.addEventListener('click', (e) => {
            if (!menuDropdown.contains(e.target) && !hamburgerMenu.contains(e.target)) {
                menuDropdown.classList.remove('show');
            }
        });
    }
});
