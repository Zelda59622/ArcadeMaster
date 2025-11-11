// --- LOGIQUE DU JEU SPACE INVADERS (space_invaders.js) ---

// --- VARIABLES GLOBALES ET ÉLÉMENTS DU DOM ---
const gameBoard = document.getElementById('gameBoard');
const scoreDisplay = document.getElementById('scoreDisplay');
const livesDisplay = document.getElementById('livesDisplay');
const instructionsScreen = document.getElementById('instructionsScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const restartButton = document.getElementById('restartButton');

// Paramètres du jeu
const BOARD_WIDTH = 600;
const BOARD_HEIGHT = 400;
let isGameRunning = false;
let isGameOver = false;
let gameInterval;
let score = 0;
let lives = 3;
let level = 1;

// Vaisseau du joueur
let player = {
    x: BOARD_WIDTH / 2 - 15, 
    y: BOARD_HEIGHT / 2 - 15, 
    width: 30,
    height: 30,
    rotation: 0 
};

// Vitesse de base du jeu
let scoreSpeedFactor = 1;
let gameLoopSpeed = 50; // Intervalle en ms (20 FPS)

// Entités (listes)
let enemies = [];
let playerBullets = [];
let enemyBullets = [];
let powerups = [];

// État des Bonus
let shieldActive = false;
let shieldTimeout;
let shotgunCooldown = 0;

// Input
let mousePosition = { x: 0, y: 0 };
let keysPressed = {};

// Skins (Valeurs par défaut)
let activeShipSkin = '🚀';
let activeEnemySkin = '👾';


// --- 0. FONCTIONS DE GESTION DES SKINS ---

function loadActiveSkins() {
    // Si la fonction de l'utilisateur existe (depuis auth.js)
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    
    // Si l'utilisateur est un vrai utilisateur ou le fantôme (id=0), on tente de charger les skins
    if (user && user.skins) {
        activeShipSkin = user.skins.active.ship || '🚀';
        activeEnemySkin = user.skins.active.invader || '👾';
    } else {
         activeShipSkin = '🚀'; 
         activeEnemySkin = '👾';
    }
}


// --- 1. FONCTIONS D'INITIALISATION ET D'AFFICHAGE ---

function setupBoard() {
    gameBoard.style.width = `${BOARD_WIDTH}px`;
    gameBoard.style.height = `${BOARD_HEIGHT}px`;
}

function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    scoreSpeedFactor = 1;
    
    enemies = [];
    playerBullets = [];
    enemyBullets = [];
    powerups = [];
    
    // Réinitialisation des bonus
    shieldActive = false;
    clearTimeout(shieldTimeout);
    shotgunCooldown = 0;

    player.x = BOARD_WIDTH / 2 - 15;
    player.y = BOARD_HEIGHT / 2 - 15; 
    player.rotation = 0;
    
    loadActiveSkins(); 

    updateDisplay();
    gameBoard.innerHTML = '';
    
    // On lance le spawn initial après un petit délai
    setTimeout(spawnEnemyFromEdge, 1000); 
}

function updateDisplay() {
    scoreDisplay.textContent = `Score: ${score}`;
    livesDisplay.textContent = `Vies: ${lives}`;
}


// --- 2. GESTION DES ENTITÉS : ENVAHISSEURS ---

function spawnEnemyFromEdge() {
    if (!isGameRunning) return;
    
    let edge = Math.floor(Math.random() * 4); // 0=Top, 1=Right, 2=Bottom, 3=Left
    let x, y;

    switch (edge) {
        case 0: // Top
            x = Math.random() * (BOARD_WIDTH - 20);
            y = -20;
            break;
        case 1: // Right
            x = BOARD_WIDTH;
            y = Math.random() * (BOARD_HEIGHT - 20);
            break;
        case 2: // Bottom
            x = Math.random() * (BOARD_WIDTH - 20);
            y = BOARD_HEIGHT;
            break;
        case 3: // Left
            x = -20;
            y = Math.random() * (BOARD_HEIGHT - 20);
            break;
    }
    
    enemies.push({
        x: x,
        y: y,
        width: 20,
        height: 20,
        hp: 1
    });

    // La vitesse de spawn augmente lentement avec le score
    const spawnRate = Math.max(500, 2000 - score * 5); 
    setTimeout(spawnEnemyFromEdge, spawnRate);
}

function moveEnemies() {
    const baseSpeed = 1;
    // La vitesse augmente lentement avec le score (10 points = 0.05 de vitesse en plus)
    const currentSpeed = baseSpeed + Math.floor(score / 10) * 0.05; 

    enemies.forEach(enemy => {
        // Calculer le vecteur vers le joueur
        const dx = player.x + player.width / 2 - (enemy.x + enemy.width / 2);
        const dy = player.y + player.height / 2 - (enemy.y + enemy.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Déplacement vers le joueur
        enemy.x += (dx / distance) * currentSpeed;
        enemy.y += (dy / distance) * currentSpeed;
    });
}

function enemyShoot() {
    // Les ennemis qui vont vers le joueur ne tirent pas de projectiles, 
    // ils représentent eux-mêmes la menace à éviter.
    // L'implémentation de tir ennemi est conservée ici au cas où l'on voudrait la réactiver :
    // if (enemies.length === 0 || Math.random() > 0.99) return; 
    // const shooter = enemies[Math.floor(Math.random() * enemies.length)];
    // ...
}


// --- 3. GESTION DES BONUS (Powerups) ---

function spawnPowerup(x, y) {
    if (Math.random() > 0.95) { // 5% de chance d'apparition (rare)
        const types = ['shield', 'shotgun', 'bomb'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        powerups.push({
            x: x,
            y: y,
            width: 15,
            height: 15,
            type: type,
            speedY: 1
        });
    }
}

function activatePowerup(type) {
    switch (type) {
        case 'shield':
            clearTimeout(shieldTimeout);
            shieldActive = true;
            shieldTimeout = setTimeout(() => {
                shieldActive = false;
            }, 10000); // 10 secondes
            break;
        case 'shotgun':
            shotgunCooldown = 50; // 50 tirs lents (Shotgun)
            break;
        case 'bomb':
            handleBomb();
            break;
    }
}

function handleBomb() {
    // Donne autant de points que d'ennemis
    score += enemies.length * 10; 
    
    // Effacer tous les ennemis
    enemies = [];
    
    updateDisplay();
    // Le spawn reprendra automatiquement via le setTimeout de spawnEnemyFromEdge
}


// --- 4. GESTION DES COLLISIONS ---

function checkCollisions() {
    
    // Joueur vs Tirs ennemis (Conservé pour le cas où enemyShoot serait réactivé)
    enemyBullets = enemyBullets.filter(bullet => {
        if (
            bullet.x < player.x + player.width && bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height && bullet.y + bullet.height > player.y
        ) {
            if (shieldActive) return false; 
            
            lives--;
            updateDisplay();
            if (lives <= 0) endGame();
            return false; 
        }
        return bullet.y < BOARD_HEIGHT && bullet.y > 0 && bullet.x < BOARD_WIDTH && bullet.x > 0;
    });
    
    // Joueur vs Powerups
    powerups = powerups.filter(powerup => {
        if (
            powerup.x < player.x + player.width && powerup.x + powerup.width > player.x &&
            powerup.y < player.y + player.height && powerup.y + powerup.height > player.y
        ) {
            activatePowerup(powerup.type);
            return false; 
        }
        // Supprimer si le bonus sort de l'écran (seulement en bas)
        return powerup.y < BOARD_HEIGHT;
    });

    // Tirs joueur vs Ennemis
    playerBullets = playerBullets.filter(bullet => {
        let hit = false;
        enemies = enemies.filter(enemy => {
            if (
                bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y
            ) {
                // Touche l'ennemi
                enemy.hp--;
                hit = true;
                if (enemy.hp <= 0) {
                    score += 10; // 1 ennemi = 10 points
                    spawnPowerup(enemy.x, enemy.y); 
                    return false; // Supprimer l'ennemi
                }
                return true; 
            }
            return true;
        });
        // Filtrage des tirs qui sortent de l'écran ou qui ont touché
        return !hit && bullet.y < BOARD_HEIGHT && bullet.y > 0 && bullet.x < BOARD_WIDTH && bullet.x > 0;
    });
    
    // Ennemis vs Joueur (Collision avec les ennemis)
    enemies = enemies.filter(enemy => {
        if (
            enemy.x < player.x + player.width && enemy.x + enemy.width > player.x &&
            enemy.y < player.y + player.height && enemy.y + enemy.height > player.y
        ) {
            if (shieldActive) {
                return false; // Ennemi tué par le bouclier (pas de points)
            }
            // Collision mortelle sans bouclier
            endGame();
            return false;
        }
        return true;
    });
}


// --- 5. MOUVEMENTS ET TIR DU JOUEUR ---

function movePlayer() {
    const moveSpeed = 4;
    
    // Contrôle ZQSD/WASD
    if (keysPressed['a'] || keysPressed['q']) player.x -= moveSpeed;
    if (keysPressed['d']) player.x += moveSpeed;
    if (keysPressed['w'] || keysPressed['z']) player.y -= moveSpeed;
    if (keysPressed['s']) player.y += moveSpeed;

    // Limiter le mouvement aux bords de la carte (n'importe où)
    player.x = Math.max(0, Math.min(BOARD_WIDTH - player.width, player.x));
    player.y = Math.max(0, Math.min(BOARD_HEIGHT - player.height, player.y));

    // Calculer la rotation (visée)
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    const angleRad = Math.atan2(mousePosition.y - centerY, mousePosition.x - centerX);
    player.rotation = angleRad * (180 / Math.PI) + 90; 
}

function playerShoot(e) {
    if (isGameOver || !isGameRunning) return;
    if (e && e.button !== 0) return; // Uniquement le clic gauche

    // Logique du Fusil à Pompe (Shotgun)
    if (shotgunCooldown > 0) {
        shotgunCooldown--;
        const baseAngle = Math.atan2(mousePosition.y - (player.y + player.height / 2), mousePosition.x - (player.x + player.width / 2));
        
        // Tirs multiples (5 directions)
        for (let i = -2; i <= 2; i++) {
            const angle = baseAngle + (i * 0.1); 
            const speedX = Math.cos(angle) * 8;
            const speedY = Math.sin(angle) * 8;

            playerBullets.push({
                x: player.x + player.width / 2 - 2,
                y: player.y + player.height / 2 - 2,
                width: 4,
                height: 8,
                speedX: speedX,
                speedY: speedY
            });
        }
        return;
    }
    
    // Tir standard (visée à la souris)
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;

    const angle = Math.atan2(mousePosition.y - centerY, mousePosition.x - centerX);
    
    const speedX = Math.cos(angle) * 10;
    const speedY = Math.sin(angle) * 10;
    
    playerBullets.push({
        x: centerX - 2,
        y: centerY - 2,
        width: 4,
        height: 8,
        speedX: speedX,
        speedY: speedY
    });
}


// --- 6. RENDU GRAPHIQUE (Dessin) ---

function drawEntities() {
    gameBoard.innerHTML = '';

    // Dessin du Joueur (Avec skin)
    const playerElement = document.createElement('div');
    playerElement.style.left = `${player.x}px`;
    playerElement.style.top = `${player.y}px`;
    playerElement.classList.add('player');
    playerElement.style.transform = `rotate(${player.rotation}deg)`;
    playerElement.innerHTML = `<div style="font-size: 1.5em; position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">${activeShipSkin}</div>`;
    
    if (shieldActive) {
         playerElement.classList.add('shielded');
    } else {
         playerElement.classList.remove('shielded');
    }
    gameBoard.appendChild(playerElement);

    // Dessin des Ennemis (Avec skin)
    enemies.forEach(enemy => {
        const enemyElement = document.createElement('div');
        enemyElement.style.left = `${enemy.x}px`;
        enemyElement.style.top = `${enemy.y}px`;
        enemyElement.classList.add('enemy');
        enemyElement.innerHTML = `<span style="font-size: 1.2em;">${activeEnemySkin}</span>`;
        gameBoard.appendChild(enemyElement);
    });

    // Dessin des Tirs Joueur (Mise à jour de la position selon speedX/Y)
    playerBullets.forEach(bullet => {
        const bulletElement = document.createElement('div');
        bulletElement.style.left = `${bullet.x}px`;
        bulletElement.style.top = `${bullet.y}px`;
        bulletElement.classList.add('player-bullet');
        gameBoard.appendChild(bulletElement);
    });
    
    // Dessin des Tirs Ennemis
    enemyBullets.forEach(bullet => {
        const bulletElement = document.createElement('div');
        bulletElement.style.left = `${bullet.x}px`;
        bulletElement.style.top = `${bullet.y}px`;
        bulletElement.classList.add('enemy-bullet');
        gameBoard.appendChild(bulletElement);
    });
    
    // Dessin des Bonus
    powerups.forEach(p => {
        const pElement = document.createElement('div');
        pElement.style.left = `${p.x}px`;
        pElement.style.top = `${p.y}px`;
        pElement.classList.add('powerup', `powerup-${p.type}`);
        pElement.textContent = p.type === 'shield' ? '🛡️' : (p.type === 'shotgun' ? '🔫' : '💣');
        gameBoard.appendChild(pElement);
    });
}


// --- 7. BOUCLE DE JEU ET ÉTATS ---

function gameLoop() {
    if (isGameOver) return;

    // 1. Mouvements
    movePlayer();
    moveEnemies();
    
    // Mouvement des tirs joueur 
    playerBullets.forEach(b => {
        b.x += b.speedX;
        b.y += b.speedY;
    });
    
    // Mouvement des tirs ennemis
    enemyBullets.forEach(b => {
        b.y += b.speedY;
    });
    
    // Mouvement des powerups
    powerups.forEach(p => {
        p.y += p.speedY;
    });

    // 2. Tirs ennemis (Conservé mais non actif)
    enemyShoot();
    
    // 3. Collisions
    checkCollisions();

    // 4. Rendu
    drawEntities();
    updateDisplay();
}

function startGame() {
    if (isGameRunning) return;
    
    isGameRunning = true;
    isGameOver = false; // Important pour redémarrer
    instructionsScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';

    resetGame();
    // Lance la boucle de jeu
    gameInterval = setInterval(gameLoop, gameLoopSpeed);
}

function endGame() {
    if (isGameOver) return;
    isGameOver = true;
    isGameRunning = false;
    clearInterval(gameInterval);
    
    // Tente de mettre à jour le score dans auth.js (si la fonction est chargée)
    if (typeof updateGlobalUserScore === 'function') {
        updateGlobalUserScore('space_invaders', score);
    }
    
    document.getElementById('finalScore').textContent = `Score final : ${score}`;
    gameOverScreen.style.display = 'flex';
}


// --- 8. GESTION DES CHEATS ---

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
let konamiIndex = 0;

function handleCheat(e) {
    if (e.key === KONAMI_CODE[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === KONAMI_CODE.length) {
            alert("CODE KONAMI ACTIVÉ ! 💰 +50,000 Pièces !");
            
            const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
            if (user && user.id !== 0) {
                 user.coins = (user.coins || 0) + 50000;
                 if (typeof updateGlobalUser === 'function') {
                    updateGlobalUser(user);
                 }
            } else {
                 localStorage.setItem('tempCheatCoins', (parseInt(localStorage.getItem('tempCheatCoins') || '0') + 50000));
            }

            if (typeof updateTopBar === 'function') {
                updateTopBar(); 
            }

            konamiIndex = 0; 
        }
    } else {
        konamiIndex = 0; 
    }
}


// --- 9. ÉVÉNEMENTS & INITIALISATION ---

document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    
    // 1. Gestion du Cheat Code
    handleCheat(e); 
    
    // 2. Lancement du jeu (Correction du bug de démarrage par Espace)
    if ((key === ' ' || key === 'spacebar') && !isGameRunning && !isGameOver) {
        e.preventDefault(); 
        startGame();
        return;
    }
    
    // 3. Gestion des mouvements (uniquement si le jeu est en cours)
    if (isGameOver || !isGameRunning) return;
    
    // Mouvement ZQSD / WASD
    if (key === 'a' || key === 'q' || key === 'd' || key === 'w' || key === 'z' || key === 's') {
        keysPressed[key] = true;
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    delete keysPressed[key];
});

// Gestion de la Souris (Visée et Tir)
gameBoard.addEventListener('mousemove', (e) => {
    const rect = gameBoard.getBoundingClientRect();
    mousePosition.x = e.clientX - rect.left;
    mousePosition.y = e.clientY - rect.top;
});

gameBoard.addEventListener('click', playerShoot);

// Bouton Recommencer
restartButton.addEventListener('click', startGame);


// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    setupBoard();
    loadActiveSkins(); 
    // Affiche l'écran d'instructions au départ
    instructionsScreen.style.display = 'flex';
    gameOverScreen.style.display = 'none';
});
