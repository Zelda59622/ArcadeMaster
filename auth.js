// =========================================================
// 1. CLASSE SON POUR LES MENUS (utilise button-pressed.mp3)
// =========================================================

class Sound {
    constructor(src, volume = 0.5) {
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
        this.sound.play().catch(e => {
            // Empêche les erreurs si l'utilisateur n'a pas encore cliqué sur la page
        });
    }
}

// Déclaration du son de clic (bouton)
const sfxButtonClick = new Sound("button-pressed.mp3", 0.3);


// =========================================================
// 2. FONCTION POUR DÉCLENCHER LE SON AU CLIC DU MENU
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    // Éléments ciblés pour le son : tous les liens/boutons des menus/comptes
    const elementsToListen = [
        '#sidebar a',            // Liens de la barre latérale
        '#auth-controls button', // Boutons d'authentification
        '#navbar a',             // Liens de navigation (en haut)
        '#score-board div',      // Bloc du classement
        '#score-board li',       // Éléments du classement
        '.hamburger-menu',       // Menu hamburger
        '.main-game-area button',// Boutons divers
        '.deconnexion-button'    // Bouton de déconnexion (si vous en avez un)
    ];
    
    // Fonction qui joue le son
    function playClickSound() {
        sfxButtonClick.play();
    }

    // Ajoute l'écouteur d'événement à chaque élément cible
    elementsToListen.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            // Nous utilisons 'mousedown' pour que le son se déclenche immédiatement
            // et soit synchronisé avec l'animation CSS :active.
            element.addEventListener('mousedown', playClickSound);
        });
    });

    // ----------------------------------------------------
    // VOS FONCTIONS D'AUTHENTIFICATION DOIVENT ÊTRE ICI
    // (ex: login, register, getCurrentUser, loadUsers, etc.)
    // ----------------------------------------------------
    // ... (Votre code auth.js existant)
    
});
