window.updateTopBar = function() {
    const user = window.getCurrentUser ? window.getCurrentUser() : null;
    const topBar = document.getElementById('top-bar');
    if (!topBar) return;

    if (user) {
        // Menu pour l'utilisateur connecté
        topBar.innerHTML = `
            <nav class="navbar">
                <div class="logo" onclick="window.location.href='index.html'" style="cursor:pointer; color:var(--color-neon-cyan); font-weight:bold; font-size:1.5em;">ARCADE MASTER</div>
                <div class="nav-links">
                    <a href="menu.html" style="color:white; text-decoration:none; margin:0 15px;">🏠 MENU</a>
                    <a href="jeux.html" style="color:white; text-decoration:none; margin:0 15px;">🎮 JEUX</a>
                    <a href="boutique.html" style="color:white; text-decoration:none; margin:0 15px;">🛒 SHOP</a>
                    ${user.isAdmin ? '<a href="admin.html" style="color:var(--color-neon-pink); text-decoration:none; margin:0 15px; border:1px solid; padding:2px 5px;">🛡️ ADMIN</a>' : ''}
                </div>
                <div class="user-status">
                    <span style="color:var(--color-neon-green); margin-right:15px;">💰 ${user.coins.toLocaleString()}</span>
                    <span style="color:var(--color-neon-cyan); cursor:pointer;" onclick="window.location.href='menu.html'">👤 ${user.username}</span>
                    <button onclick="window.logout()" style="margin-left:15px; padding:2px 10px; border-color:var(--color-neon-pink); color:var(--color-neon-pink);">X</button>
                </div>
            </nav>
        `;
    } else {
        // Menu si personne n'est connecté
        topBar.innerHTML = `
            <nav class="navbar">
                <div class="logo">ARCADE MASTER</div>
                <button onclick="window.location.href='compte.html'">CONNEXION / INSCRIPTION</button>
            </nav>
        `;
    }
};

// Se lance dès que la page est chargée
document.addEventListener('DOMContentLoaded', window.updateTopBar);
