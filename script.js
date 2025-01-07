// Canvas-opsætning
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Spilvariabler
let lives = 7; // Antal liv tilbage
let obstacles = []; // Liste over forhindringer
let fallingObjects = []; // Liste over faldende objekter
let score = 0; // Score
let highScore = localStorage.getItem("highScore") || 0; // Gemt highscore
let gameOver = false;

// Fuglenes position og bevægelse
const bird = { x: 100, y: canvas.height / 2, width: 50, height: 50, dx: 0, dy: 0, controlledByMouse: false };

// DOM-element til GIF-fuglen
const animatedBird = document.getElementById("animated-bird");

// Hastighedsforøgelse
let speedMultiplier = 1;

// Tidsstyring
let lastTime = 0;
const obstacleInterval = 2000;
const fallingObjectInterval = 3000;
let lastObstacleTime = 0;
let lastFallingObjectTime = 0;

// Indlæs lydfiler
const collisionSound = new Audio("sounds/collision.mp3");
const gameOverSound = new Audio("sounds/gameover.mp3");
const backgroundMusic = new Audio("sounds/background.mp3");

// Baggrundsmusik opsætning
backgroundMusic.loop = true;
backgroundMusic.volume = 0.9; // Juster volumen

// Indlæs billeder
const obstacleImage = new Image();
obstacleImage.src = "images/obstacle.png";

const fallingImage = new Image();
fallingImage.src = "images/falling.png";

// Funktion til at spille lyd
function playSound(audio) {
    if (audio.paused) {
        audio.currentTime = 0;
        audio.play().catch((event) => {
            console.log("Lyd kunne ikke afspilles." + event.message);
        });
    }
}

// Funktion til at tegne baggrunden
function drawBackground() {
    ctx.fillStyle = "#87ceeb"; // Himmelblå
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Funktion til at vise resterende liv
function drawLives() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Lives: ${lives}`, 20, 60);
}

// Funktion til at tegne forhindringer
function drawObstacles() {
    for (let obstacle of obstacles) {
        ctx.drawImage(obstacleImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
}

// Funktion til at tegne faldende objekter
function drawFallingObjects() {
    for (let falling of fallingObjects) {
        ctx.drawImage(fallingImage, falling.x, falling.y, falling.width, falling.height);
    }
}

// Funktion til at lave en ny forhindring
function createObstacle() {
    const height = Math.random() * (canvas.height - 100) + 50;
    obstacles.push({
        x: canvas.width,
        y: height,
        width: 50,
        height: 50,
        dx: -5 * speedMultiplier,
    });
}

// Funktion til at lave et faldende objekt
function createFallingObject() {
    const x = Math.random() * canvas.width;
    fallingObjects.push({
        x: x,
        y: 0,
        width: 40,
        height: 40,
        dy: 5 * speedMultiplier,
    });
}

// Funktion til at opdatere forhindringer
function updateObstacles() {
    for (let obstacle of obstacles) {
        obstacle.x += obstacle.dx;
    }
    obstacles = obstacles.filter((obstacle) => obstacle.x + obstacle.width > 0);
}

// Funktion til at opdatere faldende objekter
function updateFallingObjects() {
    for (let falling of fallingObjects) {
        falling.y += falling.dy;
    }
    fallingObjects = fallingObjects.filter((falling) => falling.y < canvas.height);
}

// Funktion til at registrere kollisioner
function checkCollisions() {
    for (let obstacle of obstacles) {
        if (
            bird.x < obstacle.x + obstacle.width &&
            bird.x + bird.width > obstacle.x &&
            bird.y < obstacle.y + obstacle.height &&
            bird.y + bird.height > obstacle.y
        ) {
            lives--;
            playSound(collisionSound);
            obstacles.splice(obstacles.indexOf(obstacle), 1);
            if (lives <= 0) {
                gameOver = true;
            }
        }
    }

    for (let falling of fallingObjects) {
        if (
            bird.x < falling.x + falling.width &&
            bird.x + bird.width > falling.x &&
            bird.y < falling.y + falling.height &&
            bird.y + bird.height > falling.y
        ) {
            lives--;
            playSound(collisionSound);
            fallingObjects.splice(fallingObjects.indexOf(falling), 1);
            if (lives <= 0) {
                gameOver = true;
            }
        }
    }
}

// Funktion til at vise "Game Over"
function showGameOver() {
    const gameOverElement = document.getElementById("game-over");
    const finalScoreElement = document.getElementById("final-score");
    const highScoreElement = document.getElementById("high-score");

    // Stop baggrundsmusik og afspil game over-lyd
    backgroundMusic.pause();
    playSound(gameOverSound);

    // Vis Game Over-boksen
    gameOverElement.style.display = "block";

    // Opdater score og highscore
    finalScoreElement.textContent = Math.floor(score);

    if (score > highScore) {
        highScore = Math.floor(score); // Opdater highscore
        localStorage.setItem("highScore", highScore);
    }
    highScoreElement.textContent = highScore;
}

// Musestyring
canvas.addEventListener("mousemove", (e) => {
    bird.controlledByMouse = true; // Skift til musestyring
    bird.x = e.clientX - bird.width / 2;
    bird.y = e.clientY - bird.height / 2;

    // Begræns fuglen til skærmen
    if (bird.x < 0) bird.x = 0;
    if (bird.x > canvas.width - bird.width) bird.x = canvas.width - bird.width;
    if (bird.y < 0) bird.y = 0;
    if (bird.y > canvas.height - bird.height) bird.y = canvas.height - bird.height;

    // Flyt GIF-fuglen til fuglens position
    animatedBird.style.left = `${bird.x}px`;
    animatedBird.style.top = `${bird.y}px`;
});

// Funktion til at håndtere styring med tastatur
document.addEventListener("keydown", (e) => {
    bird.controlledByMouse = false; // Skift til pilstyring
    if (e.key === "ArrowUp") bird.dy = -5; // Flyv op
    if (e.key === "ArrowDown") bird.dy = 5; // Flyv ned
    if (e.key === "ArrowLeft") bird.dx = -5; // Flyv til venstre
    if (e.key === "ArrowRight") bird.dx = 5; // Flyv til højre
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") bird.dy = 0;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") bird.dx = 0;
});

// Spilsløjfe
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (gameOver) {
        showGameOver();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawLives();
    drawObstacles();
    drawFallingObjects();
    updateObstacles();
    updateFallingObjects();
    checkCollisions();

    // Opdater fuglens position
    if (!bird.controlledByMouse) {
        bird.x += bird.dx;
        bird.y += bird.dy;
    }

    // Begræns fuglen til skærmen
    if (bird.x < 0) bird.x = 0;
    if (bird.x > canvas.width - bird.width) bird.x = canvas.width - bird.width;
    if (bird.y < 0) bird.y = 0;
    if (bird.y > canvas.height - bird.height) bird.y = canvas.height - bird.height;

    // Flyt GIF-fuglen til fuglens position
    animatedBird.style.left = `${bird.x}px`;
    animatedBird.style.top = `${bird.y}px`;

    // Lav nye forhindringer og faldende objekter
    if (timestamp - lastObstacleTime > obstacleInterval) {
        createObstacle();
        lastObstacleTime = timestamp;
    }

    if (timestamp - lastFallingObjectTime > fallingObjectInterval) {
        createFallingObject();
        lastFallingObjectTime = timestamp;
    }

    score += deltaTime * 0.01;

    // Opdater scoren i HTML
    document.getElementById("score-display").textContent = `Score: ${Math.floor(score)}`;

    requestAnimationFrame(gameLoop);
}

// Start baggrundsmusikken
playSound(backgroundMusic);

// Start spillet
animatedBird.style.left = `${bird.x}px`;
animatedBird.style.top = `${bird.y}px`;
requestAnimationFrame(gameLoop);
