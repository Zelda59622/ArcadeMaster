// --- space_invaders_game.js ---

// ******************************
// 1. INITIALISATION DES ÉLÉMENTS DU DOM
// ******************************
const canvas = document.getElementById('gameCanvas');
// Vérifie que le canvas existe avant d'obtenir le contexte
const ctx = canvas ? canvas.getContext('2d') : null; 

// Éléments du DOM pour l'interface
const startScreen = document.getElementById('gameStartScreen');
const launchButton = document.getElementById('launchButton');
const scoreDisplay = document.getElementById('scoreDisplay');
const bestScoreDisplay = document.getElementById('bestScoreDisplay');
const livesDisplay = document.getElementById('livesDisplay');

let gameRunning = false;
let score = 0;
let lives = 3;
const keys = {}; // Tableau pour suivre l'état des touches

// ******************************
// 2. CONSTANTES ET OBJETS DU JEU
// ******************************

// Les objets du jeu doivent être déclarés avant d'être utilisés
let player = {}; 
let aliens = [];
let bullets = [];
let alienBullets = [];

const ALIEN_ROWS = 4;
const ALIEN_COLS = 10;
const ALIEN_SIZE = 20;


// Fonction pour définir les propriétés de départ du joueur et des aliens
function resetGameState() {
    if (!canvas) return;

    player = { 
        x: canvas.width / 2, 
        y: canvas.height - 30, 
        size: 20, 
        speed: 5,
        color: 'var(--color-neon-green)' 
    };
    aliens = [];
    bullets = [];
    alienBullets = [];
}

// Création de la vague initiale d'aliens
function createAliens() {
    aliens = [];
    const padding = 20;
    const offsetTop = 50;
    
    for (let r = 0; r < ALIEN_ROWS; r++) {
        for (let c = 0; c < ALIEN_COLS; c++) {
            aliens.push({
                x: c * (ALIEN_SIZE + padding) + padding + 50,
                y: r * (ALIEN_SIZE + padding) + offsetTop,
                size: ALIEN_SIZE,
                color: 'var(--color-neon-red)',
                health: 1
            });
        }
    }
}

// ******************************
// 3. LOGIQUE DE JEU
// ******************************

// Mise à jour de la position du joueur en fonction des touches pressées
function updatePlayerMovement() {
    // Vérifie si l'initialisation a échoué
    if (!gameRunning || !canvas) return; 

    // WASD et ZQSD
    if (keys['a'] || keys['q']) { // Gauche
        player.x -= player.speed;
    }
    if (keys['d']) { // Droite
        player.x += player.speed;
    }
    
    // Empêcher le joueur de sortir des limites du Canvas
    if (player.x < player.size / 2) player.x = player.size / 2;
    if (player.x > canvas.width - player.size / 2) player.x = canvas.width - player.size / 2;
}

// La boucle principale de mise à jour de la logique du jeu
function update() {
    updatePlayerMovement();
    // Logique future: Mouvement aliens, tirs, collisions
}

// ******************************
// 4. FONCTIONS DE DESSIN
// ******************************

function draw() {
    if (!ctx) return;
    
    // 1. Effacer l'écran à chaque frame
    ctx.fillStyle = '#000000'; // Noir
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 2. Dessiner le joueur (triangle)
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - player.size / 2); 
    ctx.lineTo(player.x - player.size / 2, player.y + player.size / 2); 
    ctx.lineTo(player.x + player.size / 2, player.y + player.size / 2); 
    ctx.closePath();
    ctx.fill();
    
    // 3. Dessiner les aliens (simples carrés)
    aliens.forEach(alien => {
        ctx.fillStyle = alien.color;
        ctx.fillRect(alien.x - alien.size / 2, alien.y - alien.size / 2, alien.size, alien.size);
    });

    // 4. Mettre à jour l'affichage des informations
    scoreDisplay.textContent = `Score: ${score}`;
    livesDisplay.textContent = `Vies: ${lives}`;
}

// ******************************
// 5. BOUCLE PRINCIPALE ET DÉMARRAGE
// ******************************

function gameLoop() {
    if (!gameRunning) return;
    
    update();
    draw();
    
    // Demander au navigateur de rappeler gameLoop à la prochaine frame
    requestAnimationFrame(gameLoop);
}

// Fonction appelée par le bouton "LANCER LE JEU"
function initGame() {
    if (!ctx) {
        alert("Erreur: Le moteur du jeu (Canvas) n'est pas disponible. Veuillez vérifier le HTML.");
        return;
    }
    
    // Cacher l'écran de démarrage et afficher le Canvas
    startScreen.style.display = 'none';
    canvas.style.display = 'block';
    
    // Réinitialiser l'état du jeu et les variables
    resetGameState();
    score = 0;
    lives = 3;
    gameRunning = true;
    
    // Créer la première vague d'aliens
    createAliens();
    
    // Lancer la boucle de jeu
    gameLoop();
}

// Assure que le bouton lance initGame()
if (launchButton) {
    // Retirez l'ancienne fonction d'alerte et utilisez la vraie fonction de jeu
    launchButton.onclick = initGame;
}


// ******************************
// 6. GESTION DES ENTRÉES (Clavier)
// ******************************

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    keys[e.key.toLowerCase()] = true; 
});

document.addEventListener('keyup', (e) => {
    if (!gameRunning) return;
    keys[e.key.toLowerCase()] = false;
    
    // Gestion du tir (Espace)
    if (e.key === ' ' || e.key === 'Spacebar') {
        // Le code du tir sera implémenté ici
    }
});
