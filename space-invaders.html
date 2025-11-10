// --- VARIABLES GLOBALES DU JEU ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreValue');
const livesElement = document.getElementById('livesValue');
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

let gameLoopInterval;
let score = 0;
let lives = 3;
let gameOver = false;
let gameStarted = false;

// --- DÉFINITION DES ÉMOJIS ---
const EMOJIS = {
    player: '🚀', // Vaisseau du joueur
    invader1: '👽', // Ennemi type 1
    invader2: '👾', // Ennemi type 2 (pour la variation)
    bullet: '⚡',  // Laser/Tir
    shield: '🧱', // Bloc de défense (simplifié)
    mystery: '🛸'  // Vaisseau bonus
};

// --- PARAMÈTRES D'AFFICHAGE DES ÉMOJIS ---
const EMOJI_FONT_SIZE = 30; // Taille pour tous les émojis
const PLAYER_SIZE = 30;
const INVADER_SIZE = 30;


// --- CLASSE ENTITÉ (Adaptée aux Émojis) ---

class Entity {
    constructor(x, y, width, height, emojiKey) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.emoji = EMOJIS[emojiKey]; // Stocke l'émoji correspondant
    }

    draw(ctx) {
        ctx.font = `${EMOJI_FONT_SIZE}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Ajustement pour centrer l'émoji dans la zone de l'entité
        // On dessine l'émoji au centre de la boîte (x + width/2, y + height/2)
        ctx.fillText(this.emoji, this.x + this.width / 2, this.y + this.height / 2);
    }
}

class Player extends Entity {
    constructor() {
        super(GAME_WIDTH / 2 - (PLAYER_SIZE / 2), GAME_HEIGHT - 50, PLAYER_SIZE, PLAYER_SIZE, 'player');
        this.speed = 5;
        this.bullets = [];
        this.canShoot = true;
    }

    update(keys) {
        if (keys['ArrowLeft'] || keys['a']) {
            this.x = Math.max(0, this.x - this.speed);
        }
        if (keys['ArrowRight'] || keys['d']) {
            this.x = Math.min(GAME_WIDTH - this.width, this.x + this.speed);
        }
        // Logique de tir
        if ((keys[' '] || keys['Space']) && this.canShoot) {
            this.shoot();
            this.canShoot = false;
            // Retard pour le tir
            setTimeout(() => this.canShoot = true, 500); 
        }
    }
    
    shoot() {
        const bulletX = this.x + this.width / 2;
        const bulletY = this.y;
        this.bullets.push(new Bullet(bulletX, bulletY, 'player'));
    }
    
    draw(ctx) {
        super.draw(ctx);
        this.bullets.forEach(b => b.draw(ctx));
    }
}

class Invader extends Entity {
    constructor(x, y, type) {
        const imageKey = (type % 2 === 0) ? 'invader2' : 'invader1';
        super(x, y, INVADER_SIZE, INVADER_SIZE, imageKey);
        this.type = type;
        this.xDirection = 1; // 1: droite, -1: gauche
    }

    move() {
        this.x += 1 * this.xDirection;
    }
}

class Bullet extends Entity {
    constructor(x, y, type) {
        // Les tirs sont petits, mais l'émoji est grand, on ajuste la zone de collision
        super(x - 5, y, 10, 20, 'bullet'); 
        this.speed = (type === 'player') ? -7 : 5; // Tirs joueur montent (-), tirs ennemis descendent (+)
        this.color = (type === 'player') ? 'yellow' : 'red';
    }

    update() {
        this.y += this.speed;
    }
}


// --- GESTION DES ENNEMIS ET DU JEU ---

let player;
let invaders = [];
let keys = {};
let playerBullets = []; // Pour séparer les tirs pour les collisions
let invaderBullets = [];

function createInvaders() {
    invaders = [];
    // Création de 5 lignes de 10 ennemis
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 10; col++) {
            const x = 50 + col * 60;
            const y = 50 + row * 40;
            invaders.push(new Invader(x, y, row));
        }
    }
}

function updateGame() {
    if (gameOver || !gameStarted) return;

    // 1. Déplacer le joueur
    player.update(keys);
    
    // Mettre à jour les tirs du joueur
    player.bullets = player.bullets.filter(b => {
        b.update();
        return b.y > 0; // Garder si dans l'écran
    });

    // 2. Déplacer les ennemis
    let edgeReached = false;
    invaders.forEach(invader => {
        invader.move();
        if (invader.x + invader.width >= GAME_WIDTH || invader.x <= 0) {
            edgeReached = true;
        }
    });
    
    if (edgeReached) {
        invaders.forEach(invader => {
            invader.xDirection *= -1; // Change la direction
            invader.y += 15;          // Descend d'un cran
        });
    }

    // 3. (Ajouter la logique des tirs ennemis et des collisions ici plus tard)

    // 4. Vérification de fin de jeu
    if (invaders.length === 0) {
        // Gagner la partie
        gameOver = true;
        // Laisser le message dans drawGame
    }
}

function drawGame() {
    // Effacer l'écran
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    if (!gameStarted) {
        ctx.fillStyle = '#00ff00';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Appuyez sur ESPACE pour commencer', GAME_WIDTH / 2, GAME_HEIGHT / 2);
        return;
    }

    // Dessiner les entités
    player.draw(ctx);
    player.bullets.forEach(bullet => bullet.draw(ctx)); // Dessin des tirs du joueur
    invaders.forEach(invader => invader.draw(ctx));
    
    if (gameOver) {
         ctx.fillStyle = 'red';
         ctx.font = '50px Arial';
         ctx.textAlign = 'center';
         ctx.fillText('FIN DE JEU !', GAME_WIDTH / 2, GAME_HEIGHT / 2);
    }
}

function gameLoop() {
    updateGame();
    drawGame();
}

// --- GESTION DES ÉVÉNEMENTS ---

document.addEventListener('keydown', (e) => {
    // Utiliser 'e.code' pour des touches non-caractères (meilleur pour les jeux)
    keys[e.key] = true; 
    keys[e.code] = true; 

    if (e.code === 'Space' && !gameOver) {
        if (!gameStarted) {
            startGame();
        } 
        e.preventDefault(); 
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    keys[e.code] = false;
});

// --- INITIALISATION DU JEU ---

function startGame() {
    if (gameStarted) return;
    
    score = 0;
    lives = 3;
    gameOver = false;
    gameStarted = true;

    // Initialisation des entités
    player = new Player();
    createInvaders();

    // Démarrage de la boucle de jeu
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS
}

// Dessiner l'écran initial immédiatement (plus besoin du chargement d'images)
drawGame();
