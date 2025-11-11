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
const TILE_SIZE = 20; // Unité de base pour le positionnement
let isGameRunning = false;
let isGameOver = false;
let gameInterval;
let score = 0;
let lives = 3;
let level = 1;

// Vaisseau du joueur
let player = {
    x: BOARD_WIDTH / 2 - 15, // Centré
    y: BOARD_HEIGHT - 30,
    width: 30,
    height: 30,
    rotation: 0 // Angle de rotation pour la visée
};

// Vitesse de base du jeu
let speedFactor = 1;
let gameLoopSpeed = 50; // Intervalle en ms (20 FPS)

// Entités (listes)
let enemies = [];
let playerBullets = [];
let enemyBullets = [];
let powerups = [];

// État des Bonus
let shieldActive = false;
let shotgunCooldown = 0;

// Input
let mousePosition = { x: 0, y: 0 };
let keysPressed = {}; // Pour Q, Z, S, D

// --- 1. FONCTIONS D'INITIALISATION ---

function setupBoard() {
    gameBoard.style.width = `${BOARD_WIDTH}px`;
    gameBoard.style.height = `${BOARD_HEIGHT}px`;
}

function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    speedFactor = 1;
    
    enemies = [];
    playerBullets = [];
    enemyBullets = [];
    powerups = [];
    
    shieldActive = false;
    shotgunCooldown = 0;

    player.x = BOARD_WIDTH / 2 - 15;
    player.rotation = 0;

    updateDisplay();
    gameBoard.innerHTML = '';
    
    spawnEnemies();
}

function updateDisplay() {
    scoreDisplay.textContent = `Score: ${score}`;
    livesDisplay.textContent = `Vies: ${lives}`;
}

// --- 2. GESTION DES ENTITÉS : ENVAHISSEURS ---

function spawnEnemies() {
    const rows = 3 + Math.min(level, 4); // Max 7 lignes
    const cols = 5 + Math.min(level, 5); // Max 10 colonnes
    const startX = 50;
    const startY = 30;
    const paddingX = 40;
    const paddingY = 30;
    
    enemies = []; // On vide la liste
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            enemies.push({
                x: startX + c * paddingX,
                y: startY + r * paddingY,
                width: 20,
                height: 20,
                hp: 1,
                direction: 1 // 1 pour droite, -1 pour gauche
            });
        }
    }
}

function moveEnemies() {
    let shouldMoveDown = false;
    const speed = 1 * speedFactor; // Vitesse de déplacement horizontal
    
    // Déplacement horizontal et vérification des bords
    enemies.forEach(enemy => {
        enemy.x += enemy.direction * speed;
        
        if (enemy.x + enemy.width > BOARD_WIDTH || enemy.x < 0) {
            shouldMoveDown = true;
        }
    });

    // Mouvement vers le bas et changement de direction
    if (shouldMoveDown) {
        enemies.forEach(enemy => {
            enemy.y += 10; // Déplacement vertical
            enemy.direction *= -1; // Inverse la direction
            
            // Vérification de la défaite
            if (enemy.y + enemy.height > player.y) {
                endGame();
            }
        });
        speedFactor += 0.1; // Accélère légèrement à chaque descente
    }
}

function enemyShoot() {
    if (enemies.length === 0 || Math.random() > 0.95) return; // 5% de chance de tir par frame
    
    const shooter = enemies[Math.floor(Math.random() * enemies.length)];
    
    enemyBullets.push({
        x: shooter.x + shooter.width / 2 - 2,
        y: shooter.y + shooter.height,
        width: 4,
        height: 8,
        speedY: 3
    });
}

// --- 3. GESTION DES BONUS (Powerups) ---

function spawnPowerup(x, y) {
    if (Math.random() > 0.95) { // 5% de chance d'apparition
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
            shieldActive = true;
            setTimeout(() => {
                shieldActive = false;
            }, 10000); // 10 secondes
            break;
        case 'shotgun':
            shotgunCooldown = 50; // 50 tirs lents avant de revenir à la normale
            break;
        case 'bomb':
            handleBomb();
            break;
    }
}

function handleBomb() {
    // La bombe donne autant de points que d'ennemis
    score += enemies.length * 10; 
    
    // Effacer tous les ennemis
    enemies = [];
    
    updateDisplay();
    // Peut-être passer au niveau suivant si c'est la fin de la vague
    if (enemies.length === 0) {
        nextLevel();
    }
}


// --- 4. GESTION DES COLLISIONS ---

function checkCollisions() {
    // Joueur vs Tirs ennemis
    enemyBullets = enemyBullets.filter(bullet => {
        if (
            bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y
        ) {
            // Collision trouvée
            if (shieldActive) {
                // Le bouclier tue le tir qui le touche sans donner de points
                return false; 
            }
            
            lives--;
            updateDisplay();
            if (lives <= 0) {
                endGame();
            }
            return false; // Supprimer la balle
        }
        return bullet.y < BOARD_HEIGHT; // Garder si dans l'écran
    });
    
    // Joueur vs Powerups
    powerups = powerups.filter(powerup => {
        if (
            powerup.x < player.x + player.width &&
            powerup.x + powerup.width > player.x &&
            powerup.y < player.y + player.height &&
            powerup.y + powerup.height > player.y
        ) {
            activatePowerup(powerup.type);
            return false; // Supprimer le bonus
        }
        return true;
    });

    // Tirs joueur vs Ennemis
    playerBullets = playerBullets.filter(bullet => {
        let hit = false;
        enemies = enemies.filter(enemy => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                // Touche l'ennemi
                enemy.hp--;
                hit = true;
                if (enemy.hp <= 0) {
                    score += 10; // 1 ennemi = 10 points
                    spawnPowerup(enemy.x, enemy.y); // Chance de faire apparaître un bonus
                    return false; // Supprimer l'ennemi
                }
                return true; // Garder l'ennemi (s'il lui reste de la vie)
            }
            return true;
        });
        return !hit; // Supprimer le tir si un ennemi a été touché
    });
    
    // Ennemis vs Joueur (Si bouclier actif, les envahisseurs meurent sans points)
    enemies = enemies.filter(enemy => {
        if (
            enemy.x < player.x + player.width &&
            enemy.x + enemy.width > player.x &&
            enemy.y + enemy.height > player.y &&
            enemy.y < player.y + player.height // Collision verticale
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


    if (enemies.length === 0) {
        nextLevel();
    }
}


// --- 5. MOUVEMENTS ET TIR DU JOUEUR ---

function movePlayer() {
    const moveSpeed = 4;
    
    if (keysPressed['a'] || keysPressed['q']) player.x -= moveSpeed;
    if (keysPressed['d']) player.x += moveSpeed;
    if (keysPressed['w'] || keysPressed['z']) player.y -= moveSpeed;
    if (keysPressed['s']) player.y += moveSpeed;

    // Limiter le mouvement (uniquement sur le tiers inférieur de l'écran)
    player.x = Math.max(0, Math.min(BOARD_WIDTH - player.width, player.x));
    player.y = Math.max(BOARD_HEIGHT / 3 * 2, Math.min(BOARD_HEIGHT - player.height, player.y));

    // Calculer la rotation (visée)
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    const angleRad = Math.atan2(mousePosition.y - centerY, mousePosition.x - centerX);
    player.rotation = angleRad * (180 / Math.PI) + 90; // Convertir en degrés et ajuster
}

function playerShoot(e) {
    if (isGameOver || !isGameRunning) return;

    // Si clic droit, on n'agit pas
    if (e && e.button !== 0) return; 

    // Logique du Fusil à Pompe (Shotgun)
    if (shotgunCooldown > 0) {
        shotgunCooldown--;
        const baseAngle = Math.atan2(mousePosition.y - (player.y + player.height / 2), mousePosition.x - (player.x + player.width / 2));
        
        // Tirs multiples (5 directions)
        for (let i = -2; i <= 2; i++) {
            const angle = baseAngle + (i * 0.1); // Écart angulaire
            const speedX = Math.sin(angle) * 8;
            const speedY = -Math.cos(angle) * 8;

            playerBullets.push({
                x: player.x + player.width / 2 - 2,
                y: player.y,
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

    // Dessin du Joueur
    const playerElement = document.createElement('div');
    playerElement.style.left = `${player.x}px`;
    playerElement.style.top = `${player.y}px`;
    playerElement.classList.add('player');
    
    // Rotation pour la visée
    playerElement.style.transform = `rotate(${player.rotation}deg)`;
    if (shieldActive) {
         playerElement.classList.add('shielded');
    } else {
         playerElement.classList.remove('shielded');
    }
    gameBoard.appendChild(playerElement);

    // Dessin des Ennemis
    enemies.forEach(enemy => {
        const enemyElement = document.createElement('div');
        enemyElement.style.left = `${enemy.x}px`;
        enemyElement.style.top = `${enemy.y}px`;
        enemyElement.classList.add('enemy');
        gameBoard.appendChild(enemyElement);
    });

    // Dessin des Tirs Joueur
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
    
    // Mouvement des tirs joueur (mise à jour de la position selon speedX/Y)
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

    // 2. Tirs ennemis (fréquence plus lente que la boucle)
    enemyShoot();
    
    // 3. Collisions
    checkCollisions();

    // 4. Rendu
    drawEntities();
    updateDisplay();
}

function nextLevel() {
    level++;
    // Le jeu peut devenir trop difficile rapidement, on réinitialise certaines choses.
    playerBullets = [];
    enemyBullets = [];
    powerups = [];
    
    // Ajoute un délai avant de relancer les ennemis
    setTimeout(() => {
        spawnEnemies();
    }, 1000); 
}

function startGame() {
    if (isGameRunning) return;
    
    isGameRunning = true;
    instructionsScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';

    resetGame();
    gameInterval = setInterval(gameLoop, gameLoopSpeed);
}

function endGame() {
    if (isGameOver) return;
    isGameOver = true;
    isGameRunning = false;
    clearInterval(gameInterval);
    
    // Sauvegarde du score (avec la fonction de base, même si elle ne persiste pas en local)
    // if (typeof updateGlobalUserScore === 'function' && getCurrentUser()) {
    //     updateGlobalUserScore('space_invaders', score);
    // }
    
    document.getElementById('finalScore').textContent = `Score final : ${score}`;
    gameOverScreen.style.display = 'flex';
}

// --- 8. ÉVÉNEMENTS & INITIALISATION ---

// Gestion des touches (Mouvement ZQSD)
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    
    // Lancement du jeu
    if ((key === ' ' || key === 'spacebar') && !isGameRunning) {
        e.preventDefault(); 
        startGame();
        return;
    }
    
    if (isGameOver || !isGameRunning) return;
    
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
    // Récupère la position de la souris par rapport au plateau de jeu
    const rect = gameBoard.getBoundingClientRect();
    mousePosition.x = e.clientX - rect.left;
    mousePosition.y = e.clientY - rect.top;
});

gameBoard.addEventListener('click', playerShoot);

// Bouton Recommencer
restartButton.addEventListener('click', startGame);


// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    setupBoard();
    // Affiche l'écran d'instructions au départ
    instructionsScreen.style.display = 'flex';
    gameOverScreen.style.display = 'none';
});
