/**
 * Fichier : space_invaders.js
 * Description : Logique du jeu Space Invaders (version 2.0).
 * Interagit avec auth.js pour l'enregistrement des scores et des pièces.
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- CONSTANTES DE JEU ---
const GAME_NAME = 'space_invaders';
const GRID_SIZE = 40;
const PLAYER_SIZE = GRID_SIZE;
const ALIEN_SIZE = GRID_SIZE;
const BULLET_SIZE = 5;
const COINS_PER_KILL = 1; // 1 Pièce par ennemi tué

// --- ÉTAT DU JEU ---
let score = 0;
let lives = 3;
let coinsGained = 0;
let gameLoopInterval;
let gameOver = false;
let wave = 1;
let lastTime = 0;

// --- OBJETS DU JEU ---
let player;
let aliens = [];
let bullets = []; // Tirs du joueur
let keys = {};
let mousePos = { x: 0, y: 0 }; // Position de la souris pour la visée

// --- VITESSE ET TIMING ---
const ALIEN_MOVE_INTERVAL = 1000; // Mouvement initial des aliens (ms)
let alienMoveSpeed = 10; // Pixels par mouvement
let alienMoveTimer;
let playerMoveSpeed = 5;

// --- BONUS ET COOLDOWNS ---
let isShieldActive = false;
let isShotgunActive = false;
let shotgunCooldown = 0;
const SHOTGUN_DURATION = 20000; // 20 secondes
const SHIELD_DURATION = 10000;  // 10 secondes
const BASE_SHOT_DELAY = 150; // Délai de tir normal (ms)
const SHOTGUN_SHOT_DELAY = 400; // Délai de tir du shotgun (ms)
let lastShotTime = 0;

// --- EMOJIS (Textures) ---
const EMOJI = {
    PLAYER: '🚀',
    ALIEN: '👾',
    BULLET: '⚡',
    SHIELD: '🛡️',
    SHOTGUN: '💥'
};

// =========================================================
// 1. CLASSES ET CONSTRUCTEURS
// =========================================================

class Entity {
    constructor(x, y, size, emoji) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.emoji = emoji;
        this.isAlive = true;
    }

    draw() {
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        // Utilise la taille comme référence pour le placement du texte (l'émoji)
        ctx.fillText(this.emoji, this.x + this.size / 2, this.y + this.size * 0.85);
    }
}

class Player extends Entity {
    constructor(x, y, size, emoji) {
        super(x, y, size, emoji);
    }
    
    draw() {
        super.draw();
        
        // Dessine le bouclier si actif
        if (isShieldActive) {
            ctx.beginPath();
            ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)'; // Cyan transparent
            ctx.fill();
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}


// =========================================================
// 2. INITIALISATION ET VAGUES
// =========================================================

/** Initialise ou réinitialise le jeu */
window.initGame = function() {
    if (gameLoopInterval) clearInterval(gameLoopInterval);

    score = 0;
    lives = 3;
    coinsGained = 0;
    wave = 1;
    gameOver = false;
    bullets = [];
    aliens = [];
    isShieldActive = false;
    isShotgunActive = false;
    shotgunCooldown = 0;
    
    alienMoveTimer = ALIEN_MOVE_INTERVAL;
    alienMoveSpeed = 10;
    
    player = new Player(
        canvas.width / 2 - PLAYER_SIZE / 2,
        canvas.height - PLAYER_SIZE - 20,
        PLAYER_SIZE,
        EMOJI.PLAYER
    );

    createAliens();
    updateScoreBoard();
    
    // Démarrage de la boucle de jeu
    lastTime = performance.now();
    gameLoopInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS
}

/** Crée une nouvelle vague d'aliens */
function createAliens() {
    aliens = [];
    // Augmente la difficulté avec la vague
    const rows = 4 + Math.min(wave - 1, 3); // Max 7 rangées
    const cols = 8;
    const paddingX = (canvas.width - cols * ALIEN_SIZE * 1.5) / 2;
    const paddingY = 50;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            aliens.push(new Entity(
                paddingX + c * (ALIEN_SIZE * 1.5),
                paddingY + r * (ALIEN_SIZE * 1.5),
                ALIEN_SIZE,
                EMOJI.ALIEN
            ));
        }
    }
}

function nextWave() {
    wave++;
    bullets = [];
    // Augmente la vitesse et la fréquence de mouvement des aliens
    alienMoveSpeed += 3;
    alienMoveTimer = Math.max(200, ALIEN_MOVE_INTERVAL - wave * 100); 

    alert(`Vague ${wave} ! Nouvelle vague d'envahisseurs en approche.`);
    createAliens();
}

// =========================================================
// 3. MOUVEMENT ET CONTRÔLES
// =========================================================

/** Met à jour la position du joueur (ZQSD) */
function movePlayer() {
    const speed = playerMoveSpeed;

    if (keys['KeyQ']) { // ZQSD
        player.x = Math.max(0, player.x - speed);
    }
    if (keys['KeyD']) {
        player.x = Math.min(canvas.width - PLAYER_SIZE, player.x + speed);
    }
    // Permet le mouvement vertical (même si ce n'est pas le standard du genre)
    if (keys['KeyZ']) { 
        player.y = Math.max(canvas.height - 150, player.y - speed); // Limite le mouvement vertical
    }
    if (keys['KeyS']) {
        player.y = Math.min(canvas.height - PLAYER_SIZE, player.y + speed);
    }
}

let alienDirection = 1; // 1 = droite, -1 = gauche
let lastAlienMoveTime = 0;

/** Déplace les aliens */
function moveAliens(deltaTime) {
    lastAlienMoveTime += deltaTime;

    if (lastAlienMoveTime >= alienMoveTimer) {
        let shouldDrop = false;

        // Vérifie si un alien touche le bord
        for (const alien of aliens) {
            if (alien.x + ALIEN_SIZE + alienDirection * alienMoveSpeed > canvas.width || alien.x + alienDirection * alienMoveSpeed < 0) {
                alienDirection *= -1;
                shouldDrop = true;
                break;
            }
        }

        // Applique le mouvement
        for (const alien of aliens) {
            if (shouldDrop) {
                alien.y += 20; // Descend
            }
            // Déplace latéralement
            alien.x += alienDirection * alienMoveSpeed;
            
            // Vérifie la défaite
            if (alien.y + ALIEN_SIZE > player.y) {
                endGame(false);
                return;
            }
        }
        lastAlienMoveTime = 0;
    }
}

/** Met à jour la position des tirs */
function moveBullets() {
    bullets.forEach(bullet => {
        // Le mouvement dépend de la direction (angle) calculée au moment du tir
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
    });

    // Filtre les balles hors écran
    bullets = bullets.filter(bullet => 
        bullet.x > -10 && bullet.x < canvas.width + 10 && 
        bullet.y > -10 && bullet.y < canvas.height + 10
    );
}

// =========================================================
// 4. TIRS ET VISÉE À LA SOURIS
// =========================================================

/** Calcule l'angle et la direction du tir (Visée à la souris) */
function fireBullet() {
    const currentTime = performance.now();
    const shotDelay = isShotgunActive ? SHOTGUN_SHOT_DELAY : BASE_SHOT_DELAY;

    if (currentTime - lastShotTime < shotDelay) {
        return;
    }
    lastShotTime = currentTime;
    
    const bulletSpeed = 10;
    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;
    
    // Angle entre le joueur et le curseur de la souris
    const angle = Math.atan2(mousePos.y - playerCenterY, mousePos.x - playerCenterX);
    
    // Directions de base (simple tir)
    const directions = [angle];
    
    // Mode Shotgun : ajoute 4 directions supplémentaires
    if (isShotgunActive) {
        for (let i = 1; i <= 2; i++) {
            directions.push(angle + Math.PI / 16 * i);
            directions.push(angle - Math.PI / 16 * i);
        }
    }

    directions.forEach(dir => {
        const dx = Math.cos(dir) * bulletSpeed;
        const dy = Math.sin(dir) * bulletSpeed;
        
        const newBullet = new Entity(
            playerCenterX - 10,
            playerCenterY - 10,
            20,
            EMOJI.BULLET
        );
        // Stocke la vitesse et la direction dans l'objet Bullet
        newBullet.dx = dx;
        newBullet.dy = dy;
        
        bullets.push(newBullet);
    });
}

// =========================================================
// 5. BONUS ET TEMPORISATEURS
// =========================================================

let shieldEndTime = 0;
let shotgunEndTime = 0;

/** Active les bonus et gère leur durée */
function activateBonus(type) {
    const currentTime = performance.now();
    
    if (type === 'shield') {
        isShieldActive = true;
        shieldEndTime = currentTime + SHIELD_DURATION;
        console.log("Bouclier activé !");
    } else if (type === 'shotgun') {
        isShotgunActive = true;
        shotgunEndTime = currentTime + SHOTGUN_DURATION;
        console.log("Shotgun activé !");
    }
}

/** Gère les temporisateurs des bonus */
function updateBonusTimers(currentTime) {
    if (isShieldActive && currentTime > shieldEndTime) {
        isShieldActive = false;
        console.log("Bouclier désactivé.");
    }
    if (isShotgunActive && currentTime > shotgunEndTime) {
        isShotgunActive = false;
        console.log("Shotgun désactivé.");
    }
    
    // 1 chance sur 1000 par frame d'apparition d'un bonus
    if (Math.random() < 0.001 && aliens.length > 5) { 
        if (Math.random() < 0.3) {
            spawnPowerUp('shotgun');
        } else if (Math.random() < 0.6) {
            spawnPowerUp('shield');
        } else {
            spawnPowerUp('bomb'); // La bombe est plus rare
        }
    }
}

let powerUps = []; // [type: 'shield'|'shotgun'|'bomb', x, y, emoji]

function spawnPowerUp(type) {
    const x = Math.random() * (canvas.width - 50);
    const y = 0;
    let emoji = '';
    
    if (type === 'shield') emoji = EMOJI.SHIELD;
    else if (type === 'shotgun') emoji = EMOJI.SHOTGUN;
    else if (type === 'bomb') emoji = '💣'; // Bombe

    powerUps.push(new Entity(x, y, 30, emoji));
    powerUps[powerUps.length - 1].type = type;
}

function movePowerUps() {
    powerUps.forEach(p => {
        p.y += 2; // Descente lente
    });
    
    // Suppression des power-ups hors écran
    powerUps = powerUps.filter(p => p.y < canvas.height);
}

// =========================================================
// 6. COLLISIONS ET LOGIQUE DE JEU
// =========================================================

function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.size &&
           obj1.x + obj1.size > obj2.x &&
           obj1.y < obj2.y + obj2.size &&
           obj1.y + obj1.size > obj2.y;
}

function checkCollisions() {
    // 1. Tirs du joueur vs Aliens
    bullets = bullets.filter((bullet) => {
        let hit = false;
        aliens = aliens.filter((alien) => {
            if (checkCollision(bullet, alien) && !hit) {
                // Collision : l'alien est détruit
                score += 10;
                coinsGained += COINS_PER_KILL;
                hit = true; // La balle n'a frappé qu'un seul alien
                return false; 
            }
            return true; // Garde l'alien
        });
        return !hit; // Garde la balle seulement si elle n'a rien touché
    });
    
    // 2. Collisions Aliens vs Joueur (et Bouclier)
    aliens = aliens.filter((alien) => {
        if (checkCollision(player, alien)) {
            if (isShieldActive) {
                // L'alien meurt, mais le joueur ne prend pas de dégâts et pas de points
                return false; 
            } else {
                // Dégâts
                lives--;
                // Fait disparaître l'alien après le contact
                return false; 
            }
        }
        return true; // Garde l'alien
    });
    
    // 3. Collisions Joueur vs PowerUps
    powerUps = powerUps.filter((p) => {
        if (checkCollision(player, p)) {
            if (p.type === 'bomb') {
                // Bombe : tue tous les aliens (donne des points)
                score += aliens.length * 10;
                coinsGained += aliens.length * COINS_PER_KILL;
                aliens = []; 
                alert("BOMBE ! Écran nettoyé.");
            } else {
                activateBonus(p.type);
            }
            return false; // Le power-up est consommé
        }
        return true;
    });

    // Conditions de fin de jeu
    if (lives <= 0) {
        endGame(false);
    } else if (aliens.length === 0) {
        nextWave();
    }
    
    updateScoreBoard();
}

// =========================================================
// 7. AFFICHAGE ET BOUCLE DE JEU
// =========================================================

function draw() {
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dessine toutes les entités
    aliens.forEach(alien => alien.draw());
    powerUps.forEach(p => p.draw());
    bullets.forEach(bullet => bullet.draw());
    player.draw();
}

function gameLoop(currentTime) {
    if (gameOver) return;
    
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // 1. Mise à jour des temporisateurs
    updateBonusTimers(currentTime);
    
    // 2. Mise à jour des positions
    movePlayer();
    moveAliens(deltaTime);
    moveBullets();
    movePowerUps();
    
    // 3. Détection des collisions
    checkCollisions();
    
    // 4. Affichage
    draw();
}

// =========================================================
// 8. SCORES ET INTERFACE UTILISATEUR
// =========================================================

function updateScoreBoard() {
    document.getElementById('currentScore').textContent = score;
    document.getElementById('livesCount').textContent = lives;
    document.getElementById('coinsGained').textContent = coinsGained;
    
    // Récupère le high score personnel via auth.js
    if (typeof getCurrentUser === 'function') {
        const currentUser = getCurrentUser();
        const personal = (currentUser && currentUser.highScores[GAME_NAME]) || 0;
        document.getElementById('personalHighScore').textContent = personal;
    }
    
    updateLeaderboard();
}

function updateLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    if (!leaderboardList) return;
    
    leaderboardList.innerHTML = '';
    
    // Récupère les top scores (simulé par auth.js)
    if (typeof loadUsers === 'function') {
        const users = loadUsers();
        let leaderboard = users.map(user => ({
            username: user.username,
            score: user.highScores[GAME_NAME] || 0,
            role: user.role
        }))
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Top 10

        if (leaderboard.length === 0) {
            leaderboardList.innerHTML = '<li>Aucun score enregistré.</li>';
            return;
        }
        
        leaderboard.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `${index + 1}. ${item.role === 'admin' ? '👑' : ''} ${item.username}: <b>${item.score}</b>`;
            leaderboardList.appendChild(li);
        });
    } else {
        leaderboardList.innerHTML = '<li>Connectez-vous pour voir les scores.</li>';
    }
}

/** Fonction appelée à la fin de la partie */
function endGame(win) {
    if (gameOver) return;
    gameOver = true;
    clearInterval(gameLoopInterval);
    
    // Sauvegarde du high score et des pièces (via auth.js)
    if (typeof getCurrentUser === 'function' && typeof updateGlobalUser === 'function' && typeof updateCoins === 'function') {
        let currentUser = getCurrentUser();
        
        if (currentUser) {
            // Sauvegarde du score
            if (!currentUser.highScores[GAME_NAME] || score > currentUser.highScores[GAME_NAME]) {
                currentUser.highScores[GAME_NAME] = score;
                alert(`NOUVEAU RECORD PERSONNEL : ${score} !`);
            }
            
            // Ajout des pièces gagnées
            updateCoins(coinsGained); // Fonction de auth.js
            
            updateGlobalUser(currentUser); // Sauvegarde
        }
    }
    
    const message = win ? 
        `VICTOIRE ! Score final : ${score}` :
        `GAME OVER ! Votre score : ${score}. Pièces gagnées : ${coinsGained}💰`;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#E0E0E0';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center'; 
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    
    // Mise à jour finale du leaderboard
    updateLeaderboard();
}

// =========================================================
// 9. GESTION DES ENTRÉES
// =========================================================

// Souris pour la visée
canvas.addEventListener('mousemove', (e) => {
    // Calcul de la position relative au canvas
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
});

// Clic pour le tir
canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0 && !gameOver) { // Clic gauche
        fireBullet();
    }
});

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    // Espace pour tirer (alternative)
    if (e.code === 'Space' && !gameOver) { 
        e.preventDefault();
        fireBullet();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// =========================================================
// 10. DÉMARRAGE
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    // Si la page contient le canvas, lance le jeu
    if (canvas) {
        initGame();
    }
});
