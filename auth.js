// --- GESTION DES COMPTES (auth.js) ---

// Déconnexion complète
function logout() {
    // Supprime la clé de l'utilisateur connecté
    localStorage.removeItem('currentUser'); 
    
    // Supprime la clé temporaire/cheat pour éviter le blocage du "Joueur Déconnecté"
    localStorage.removeItem('tempCheatCoins'); 
    
    // Met à jour l'affichage de la barre supérieure (qui affichera "Joueur Déconnecté" avec 0 coin)
    if (typeof updateTopBar === 'function') {
        updateTopBar();
    }
    
    // Redirection vers la page de compte
    window.location.href = 'compte.html'; 
}

// Fonction pour mettre à jour le meilleur score pour un jeu donné (si l'utilisateur est connecté)
function updateGlobalUserScore(gameKey, newScore) {
    // Nécessite la fonction getCurrentUser de base.js
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

    if (user && user.id !== 0) {
        if (!user.scores) user.scores = {};
        
        // S'assurer que le nouveau score est meilleur
        if (!user.scores[gameKey] || newScore > user.scores[gameKey]) {
            user.scores[gameKey] = newScore;
            
            // Nécessite la fonction de sauvegarde de base.js
            if (typeof updateGlobalUser === 'function') {
                updateGlobalUser(user); 
            }
            return true;
        }
    }
    return false;
}

// Les autres fonctions de gestion de compte (login, register) doivent être implémentées ici.
