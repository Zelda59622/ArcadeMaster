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

// Déclaration du son de clic (bouton)
const sfxButtonClick = new Sound("button-pressed.mp3", 0.3);


// =========================================================
// 2. GESTION DES UTILISATEURS (Fonctions d'Authentification)
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
    // Redirection vers la page de connexion
    window.location.href = 'authentification.html'; 
}

// Fonction de Connexion (Exemple de base)
function login(username, password) {
    const users = loadUsers();
    if (users[username] && users[username].password === password) {
        localStorage.setItem('currentUser', username);
        alert(`Bienvenue, ${username}!`);
        // Redirection vers l'index ou la page de jeu
        window.location.href = 'index.html'; 
        return true;
    } else {
        alert("Nom d'utilisateur ou mot de passe incorrect.");
        return false;
    }
}

// Fonction d'Inscription (Exemple de base)
function register(username, password) {
    const users = loadUsers();
    if (users[username]) {
        alert("Ce nom d'utilisateur est déjà pris.");
        return false;
    }

    // Ajout du nouvel utilisateur avec un score initial de 0
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


// =========================================================
// 3. LOGIQUE D'INITIALISATION ET DÉCLENCHEMENT DU SON
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------
    // A. DÉCLENCHEMENT DES SONS AU CLIC
    // ----------------------------------------------------
    
    const elementsToListen = [
        '#sidebar a',            
        '#auth-controls button', 
        '#navbar a',             
        '#score-board div',      
        '#score-board li',       
        '.hamburger-menu',       
        '.main-game-area button',
        '.deconnexion-button'    
    ];
    
    function playClickSound() {
        sfxButtonClick.play();
    }

    elementsToListen.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            // Utilise 'mousedown' pour être synchronisé avec l'animation CSS :active
            element.addEventListener('mousedown', playClickSound);
        });
    });

    // ----------------------------------------------------
    // B. GESTION DES FORMULAIRES DE CONNEXION/INSCRIPTION
    // ----------------------------------------------------
    
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutButton = document.getElementById('logoutButton');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;
            login(username, password);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;
            register(username, password);
        });
    }
    
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
});
