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
    x: BOARD_WIDTH / 2 - 15, // Centré
    y: BOARD_HEIGHT / 2 - 15, // Milieu de la carte
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
let shotgunCooldown = 0;

// Input
let mousePosition = { x: 0, y: 0 };
let keysPressed = {};

// Skins (Valeurs par défaut)
let activeShipSkin = '🚀';
let activeEnemySkin = '👾';


// --- 0. FONCTIONS DE GESTION DES SKINS (Nouveau) ---

// Fonction simplifiée pour charger le skin actif (sans dépendre de auth.js/localStorage)
function loadActiveSkins() {
    // Dans un environnement fonctionnel, on lirait le profil de l'utilisateur.
    // Ici, nous utilisons des valeurs par défaut pour que le jeu fonctionne.
    // Les changements se feraient dans le fichier auth.js via l'outil Admin.
    
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (user && user.skins) {
        activeShipSkin = user.skins.active.ship || '🚀';
        activeEnemySkin = user.skins.active.invader || '👾'; // Utilise 'invader' comme clé
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
    
    shieldActive = false;
    shotgunCooldown = 0;

    player.x = BOARD_WIDTH / 2 - 15;
    player.y = BOARD_HEIGHT / 2 - 15; // Position centrale
    player.rotation = 0;
    
    loadActiveSkins(); // Charger les skins au démarrage

    updateDisplay();
    gameBoard.innerHTML = '';
    
    // On lance le spawn initial après un petit délai
    setTimeout(spawnEnemyFromEdge, 1000); 
}

function updateDisplay() {
    scoreDisplay.textContent = `Score: ${score}`;
    livesDisplay.textContent = `Vies: ${lives}`;
}


// --- 2. GESTION DES ENTITÉS : ENVAHISSEURS (Mis à jour) ---

function spawnEnemyFromEdge() {
    if (!isGameRunning) return;
    
    // Déterminer la position de spawn (un bord aléatoire)
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

    // Le spawn continue plus vite avec le score
    const spawnRate = Math.max(500, 2000 - score * 5); // Max 2000ms, Min 500ms
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

// ... (enemyShoot, spawnPowerup, activatePowerup, handleBomb restent les mêmes) ...
// NOTE: Pour la concision, je n'ai pas inclus les fonctions non modifiées ici.
// Assurez-vous qu'elles sont bien présentes dans le fichier complet.

// Fonction simplifiée (même si je n'ai pas inclus les fonctions non modifiées ci-dessus)
function enemyShoot() {
    if (enemies.length === 0 || Math.random() > 0.95) return;
    // ... (Logique de tir) ...
}
function spawnPowerup(x, y) {
    if (Math.random() > 0.95) {
        const types = ['shield', 'shotgun', 'bomb'];
        const type = types[Math.floor(Math.random() * types.length)];
        // ... (Ajout du powerup à la liste) ...
    }
}
function handleBomb() {
    score += enemies.length * 10;
    enemies = [];
    updateDisplay();
}


// --- 3. GESTION DES COLLISIONS (Mis à jour) ---

function checkCollisions() {
    // ... (Le corps de cette fonction est le même, sauf la partie Ennemis vs Joueur) ...
    
    // Joueur vs Tirs ennemis
    enemyBullets = enemyBullets.filter(bullet => {
        // ... (Vérification et suppression des tirs ennemis) ...
        return bullet.y < BOARD_HEIGHT && bullet.y > 0 && bullet.x < BOARD_WIDTH && bullet.x > 0;
    });
    
    // Joueur vs Powerups
    powerups = powerups.filter(powerup => {
        // ... (Vérification de la collision avec les powerups) ...
        return true;
    });

    // Tirs joueur vs Ennemis
    playerBullets = playerBullets.filter(bullet => {
        let hit = false;
        enemies = enemies.filter(enemy => {
            // ... (Vérification de la collision et mise à jour du score) ...
            if (hit) {
                score += 10;
                // ... (spawnPowerup) ...
                return false;
            }
            return true;
        });
        // Filtrage des tirs qui sortent de l'écran ou qui ont touché
        return !hit && bullet.y < BOARD_HEIGHT && bullet.y > 0 && bullet.x < BOARD_WIDTH && bullet.x > 0;
    });
    
    // Ennemis vs Joueur (Collision avec les ennemis)
    enemies = enemies.filter(enemy => {
        if (
            enemy.x < player.x + player.width &&
            enemy.x + enemy.width > player.x &&
            enemy.y < player.y + player.height &&
            enemy.y + enemy.height > player.y
        ) {
            if (shieldActive) {
                return false; // Ennemi tué par le bouclier
            }
            endGame();
            return false;
        }
        return true;
    });

    if (enemies.length === 0 && isGameRunning) {
        // Dans ce mode, on ne passe pas de niveau, on continue le spawn
    }
}


// --- 4. MOUVEMENTS DU JOUEUR (Mis à jour pour le mouvement libre) ---

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


// --- 5. RENDU GRAPHIQUE (Dessin) ---

function drawEntities() {
    gameBoard.innerHTML = '';

    // Dessin du Joueur
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

    // ... (Dessin des tirs et powerups comme avant) ...
}


// --- 6. GESTION DES CHEATS (Nouveau) ---

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
let konamiIndex = 0;

function handleCheat(e) {
    // Vérifie si la touche pressée correspond à l'étape actuelle du code
    if (e.key === KONAMI_CODE[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === KONAMI_CODE.length) {
            // Code Konami complété !
            alert("CODE KONAMI ACTIVÉ ! 💰 +50,000 Pièces !");
            
            // NOTE: Ceci est la seule façon de "stocker" les pièces sans connexion.
            // La vraie logique se ferait dans updateGlobalUser, qui ne fonctionne pas en local.
            
            // Nous allons simuler la mise à jour des pièces dans l'objet global du joueur
            const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
            if (user) {
                 user.coins = (user.coins || 0) + 50000;
                 if (typeof updateGlobalUser === 'function') {
                    updateGlobalUser(user);
                 }
            } else {
                 // Si pas de connexion, on le met dans un stockage temporaire
                 localStorage.setItem('tempCheatCoins', (parseInt(localStorage.getItem('tempCheatCoins') || '0') + 50000));
            }

            if (typeof updateTopBar === 'function') {
                updateTopBar(); // Rafraîchir l'affichage des pièces
            }

            konamiIndex = 0; // Réinitialiser le code après succès
        }
    } else {
        konamiIndex = 0; // Réinitialiser le code si une mauvaise touche est pressée
    }
}


// --- 7. ÉVÉNEMENTS & INITIALISATION (Mis à jour pour le cheat) ---

document.addEventListener('keydown', (e) => {
    // Gestion du Cheat Code avant le jeu
    handleCheat(e); 
    
    // ... (Le reste de la gestion des touches pour le jeu) ...
});

document.addEventListener('DOMContentLoaded', () => {
    setupBoard();
    loadActiveSkins(); // Assurez-vous que les skins sont chargés
    instructionsScreen.style.display = 'flex';
    gameOverScreen.style.display = 'none';
});
