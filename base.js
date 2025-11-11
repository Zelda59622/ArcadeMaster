// --- LOGIQUE BASE.JS (MENU ET BARRE SUPÉRIEURE) ---

// Fonction pour ouvrir/fermer le menu
function openNav() {
    document.getElementById("sidebar").style.width = "250px";
    document.getElementById("mainContent").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("sidebar").style.width = "0";
    document.getElementById("mainContent").style.marginLeft= "0";
}

// Gestionnaire d'événement pour le bouton de menu
document.addEventListener('DOMContentLoaded', (event) => {
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', openNav);
    }
});

// NOUVEAU: Fonction de mise à jour de la barre supérieure (cruciale)
window.updateTopBar = function() {
    // Vérifie si la fonction getCurrentUser (dans auth.js) existe et si un utilisateur est connecté
    if (typeof getCurrentUser === 'function') {
        const user = getCurrentUser();
        const topBar = document.getElementById('top-bar');
        
        if (!topBar) return; // Sécurité

        // 1. Mise à jour de l'affichage des Pièces
        const coinCountElement = topBar.querySelector('.coin-count');
        if (coinCountElement) {
            coinCountElement.textContent = user ? user.coins : '0';
        }

        // 2. Mise à jour du Lien de Compte (Avatar/Pseudo vs. Personnage générique)
        let accountLink = topBar.querySelector('a[href="compte.html"]');

        if (user) {
            // Utilisateur connecté : Afficher l'image de profil et le pseudo
            if (accountLink) {
                // Création d'une image de profil
                let profileImg = accountLink.querySelector('.top-bar-profile-pic');
                if (!profileImg) {
                    profileImg = document.createElement('img');
                    profileImg.className = 'top-bar-profile-pic';
                    // Ajout d'un style simple pour l'image
                    profileImg.style.width = '30px';
                    profileImg.style.height = '30px';
                    profileImg.style.borderRadius = '50%';
                    profileImg.style.objectFit = 'cover';
                    profileImg.style.marginRight = '5px';
                    
                    // Nettoyer le contenu existant (le petit personnage '👤')
                    accountLink.innerHTML = ''; 
                    accountLink.appendChild(profileImg);
                }
                
                profileImg.src = user.profilePictureUrl || 'https://cdn-icons-png.flaticon.com/512/1144/1144760.png';
                
                // Ajout du pseudo (si non présent)
                let usernameSpan = accountLink.querySelector('.top-bar-username');
                if (!usernameSpan) {
                     usernameSpan = document.createElement('span');
                     usernameSpan.className = 'top-bar-username';
                     usernameSpan.style.color = 'var(--color-neon-orange)';
                     accountLink.appendChild(usernameSpan);
                }
                usernameSpan.textContent = user.username;
            }
        } else {
            // Utilisateur déconnecté : Afficher le personnage générique '👤'
            if (accountLink) {
                // Réinitialiser le contenu si l'utilisateur se déconnecte
                accountLink.innerHTML = '👤';
                accountLink.style.color = 'var(--color-text-light)';
                accountLink.removeAttribute('style'); // Peut-être mieux de juste reset l'intérieur
            }
        }
    }
};

// Exécuter la mise à jour au chargement de la page
document.addEventListener('DOMContentLoaded', updateTopBar);
