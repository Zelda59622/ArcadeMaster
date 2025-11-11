// --- FONCTIONNALITÉS DE BASE DE L'INTERFACE (SIDEBAR ET TOPBAR) ---

// 1. Gestion du Menu Latéral (Sidebar)
function openNav() {
    document.getElementById("sidebar").style.width = "250px";
    document.getElementById("mainContent").style.marginLeft = "0"; // Pas de décalage du contenu
}

function closeNav() {
    document.getElementById("sidebar").style.width = "0";
    document.getElementById("mainContent").style.marginLeft = "0";
}

// 2. Mise à Jour de la Barre Supérieure (Pièces)
// Nécessite la fonction getCurrentUser() de auth.js
function updateTopBar() {
    const coinCountElement = document.querySelector('.coin-count');
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

    if (coinCountElement) {
        if (currentUser) {
            coinCountElement.textContent = currentUser.coins;
        } else {
            coinCountElement.textContent = '0'; // Valeur par défaut si non connecté
        }
    }
}

// 3. Événements au Chargement
document.addEventListener('DOMContentLoaded', () => {
    // Bouton de la barre supérieure pour ouvrir le menu
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.onclick = openNav;
    }

    // Bouton pour fermer le menu
    const closeNavButton = document.getElementById('closeNav');
    if (closeNavButton) {
        closeNavButton.onclick = closeNav;
    }

    // Bouton de 'troll' pour ajouter des pièces (pour le développement/test)
    const trollButton = document.getElementById('trollButton');
    if (trollButton) {
        trollButton.addEventListener('click', () => {
            const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
            if (user) {
                user.coins += 1000;
                // Met à jour la base de données simulée et le localStorage
                if (typeof updateGlobalUser === 'function') {
                    updateGlobalUser(user);
                }
                updateTopBar();
                alert(`1000 pièces ajoutées ! Solde : ${user.coins} 💰`);
            } else {
                alert("Connectez-vous pour ajouter des pièces de test.");
            }
        });
    }

    // Mise à jour initiale de la barre
    updateTopBar();
});
