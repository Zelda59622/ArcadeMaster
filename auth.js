const STORAGE_KEY = 'arcadeMasterUsers';

// --- Fonctions de gestion des utilisateurs ---

function loadUsers() {
    const json = localStorage.getItem(STORAGE_KEY);
    const users = json ? JSON.parse(json) : {};

    // Assure que l'Admin par défaut existe
    if (!users["Zelda5962"]) {
        users["Zelda5962"] = {
            password: "password", 
            role: "admin", // <-- VÉRIFIEZ CE RÔLE
            pdp: "https://i.imgur.com/39hN7hG.png", 
            games: {} 
        };
        // Si on vient de créer l'admin, on sauvegarde pour garantir sa présence
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
    return users;
}

// ... (Les autres fonctions comme saveUsers, getUserData, getCurrentUser, login, logout restent les mêmes que dans la réponse précédente) ...

// Remplacer les fonctions login et logout pour être sûrs :
function login(username, password) {
    const users = loadUsers();
    const user = users[username];

    if (user && user.password === password) {
        sessionStorage.setItem('currentUser', username);
        if (typeof renderAuthControls === 'function') {
             renderAuthControls();
        }
        return true;
    }
    return false;
}

function logout() {
    sessionStorage.removeItem('currentUser');
    if (typeof renderAuthControls === 'function') {
        renderAuthControls();
    }
    window.location.href = 'index.html'; 
}


// --- Fonction de rendu de l'interface (Navbar & Sidebar) ---

function renderAuthControls() {
    const currentUser = getCurrentUser();
    const authControls = document.getElementById('auth-controls');
    const sidebar = document.getElementById('sidebar');
    
    if (!authControls || !sidebar) {
        console.warn("Éléments de navigation (Navbar ou Sidebar) non trouvés. Rendu Auth annulé.");
        return;
    }

    let authHTML = '';
    
    // 1. Suppression de tout ancien lien Admin
    const oldAdminLink = sidebar.querySelector('a[href="admin.html"]');
    if (oldAdminLink) sidebar.removeChild(oldAdminLink);

    if (currentUser) {
        const userData = getUserData(currentUser);

        if (userData) {
            const pdpUrl = userData.pdp ? userData.pdp : 'https://i.imgur.com/39hN7hG.png';
            
            authHTML = `
                <span style="color: #00ff00; font-weight: bold; margin-right: 10px;">${currentUser}</span>
                <img src="${pdpUrl}" alt="PDP" style="width: 30px; height: 30px; border-radius: 50%; border: 1px solid #00ff00; vertical-align: middle; margin-right: 5px;">
                <a href="authentification.html" title="Mon Compte" style="color: white; margin-left: 10px;">Compte</a>
                <a href="#" onclick="logout(); return false;" title="Déconnexion" style="color: #e74c3c; margin-left: 15px;">Déconnexion</a>
            `;

            // 2. AJOUT DU LIEN ADMIN
            // Le rôle doit être strictement 'admin' pour que cela s'affiche.
            if (userData.role === 'admin') { 
                 const adminLinkHTML = '<a href="admin.html" style="color: #f39c12;">🛡️ Admin Panel</a>';
                 sidebar.insertAdjacentHTML('beforeend', adminLinkHTML);
            }
        } else {
             // Si données corrompues, on déconnecte
             logout();
             return;
        }

    } else {
        authHTML = `<a href="authentification.html" style="color: white;">Connexion / Inscription</a>`;
    }

    authControls.innerHTML = authHTML;
}

// ... (Le reste du code, y compris window.onload = renderAuthControls;) ...
