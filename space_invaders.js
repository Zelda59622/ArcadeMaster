// ... (Toutes les définitions de classes et de variables restent)

// =========================================================
// 2. INITIALISATION ET VAGUES
// =========================================================

// ... (syncPlayerSkin et createAliens restent)

/** Initialise ou réinitialise le jeu */
window.initGame = function() {
    // Vérification cruciale : si le canvas n'est pas chargé, on sort.
    if (!canvas) {
        console.error("Canvas non trouvé. Le jeu ne peut pas démarrer.");
        return;
    }

    if (gameLoopInterval) clearInterval(gameLoopInterval);
    
    syncPlayerSkin(); // Récupère le skin le plus récent
    
    score = 0;
    lives = 3;
    coinsGained = 0;
    wave = 1;
    gameOver = false;
    bullets = [];
    aliens = [];
    isShieldActive = false;
    isShotgunActive = false;
    lastCoinBonusScore = 0;
    
    alienMoveTimer = ALIEN_MOVE_INTERVAL;
    alienMoveSpeed = 10;
    
    // Initialise le joueur avec PLAYER_SIZE (la taille du joueur est correcte maintenant)
    player = new Player(
        canvas.width / 2 - PLAYER_SIZE / 2,
        canvas.height - PLAYER_SIZE - 20,
        PLAYER_SIZE, // Taille de 40 (Grid size)
        EMOJI.PLAYER
    );

    createAliens();
    updateScoreBoard();
    
    // Démarrage de la boucle de jeu
    lastTime = performance.now();
    gameLoopInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS
}

// ... (Reste des fonctions move, fire, collision, draw...)

// Message de démarrage (Affiché seulement au chargement initial)
function displayInitialMessage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Nettoie au cas où
    ctx.fillStyle = 'var(--color-neon-green)';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("Appuyez sur 'Nouvelle Partie' pour commencer !", canvas.width / 2, canvas.height / 2);
    // Assurez-vous que le leaderboard est affiché ici aussi
    updateLeaderboard();
}


document.addEventListener('DOMContentLoaded', () => {
    // S'assurer que le canvas est prêt et que le contexte est valide
    if (canvas && ctx) { 
        syncPlayerSkin();
        displayInitialMessage(); 
    }
});
