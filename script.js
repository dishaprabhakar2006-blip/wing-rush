const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

/* =========================
   GAME STATE
========================= */

let gameState = "start";
let score = 0;
let bestScore = localStorage.getItem("bestScore") || 0;

/* =========================
   CHARACTER
========================= */

const characterImg = new Image();
characterImg.src = "assets/character.png";

let bird = {
    x: 80,
    y: 200,
    width: 60,
    height: 60,
    gravity: 0.5,
    lift: -9,
    velocity: 0
};

function drawBird() {
    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(bird.velocity * 0.05);

    ctx.drawImage(
        characterImg,
        -bird.width / 2,
        -bird.height / 2,
        bird.width,
        bird.height
    );

    ctx.restore();
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
    }
}

/* =========================
   PIPES
========================= */

let pipes = [];
let baseGap = 160;

function createPipe() {
    if (gameState !== "playing") return;

    let topHeight = Math.random() * 250 + 50;

    pipes.push({
        x: canvas.width,
        top: topHeight,
        width: 70,
        passed: false,
        direction: 1
    });
}

function drawPipes() {
    pipes.forEach(pipe => {

        ctx.fillStyle = "#3B1E00";
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);

        ctx.fillStyle = "#8B4513";
        ctx.fillRect(pipe.x + 6, 0, pipe.width - 12, pipe.top);

        ctx.fillStyle = "#3B1E00";
        ctx.fillRect(pipe.x, pipe.top + getGap(), pipe.width, canvas.height);

        ctx.fillStyle = "#8B4513";
        ctx.fillRect(pipe.x + 6, pipe.top + getGap(), pipe.width - 12, canvas.height);
    });
}

function updatePipes() {

    pipes.forEach(pipe => {

        pipe.x -= getSpeed();

        // Moving pipes from score 3
        // Pipes always move
pipe.top += pipe.direction * 0.8;

if (pipe.top < 50 || pipe.top > 300) {
    pipe.direction *= -1;
}


        let margin = 10;

        if (
            bird.x + margin < pipe.x + pipe.width &&
            bird.x + bird.width - margin > pipe.x &&
            (bird.y + margin < pipe.top ||
             bird.y + bird.height - margin > pipe.top + getGap())
        ) {
            endGame();
        }

        if (!pipe.passed && pipe.x + pipe.width < bird.x) {
            score++;
            pipe.passed = true;
        }
    });

    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
}

/* =========================
   DIFFICULTY SETTINGS
========================= */

function getGap() {
    if (score >= 6) {
        return 130; // smaller gap
    }
    return baseGap;
}

function getSpeed() {
    if (score >= 9) {
        return 4; // fast mode
    }
    if (score >= 3) {
        return 3;
    }
    return 2;
}

/* =========================
   BACKGROUND
========================= */

function drawBackground() {
    ctx.fillStyle = "#1E90FF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#006400";
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
}

/* =========================
   ARCADE SCORE
========================= */

function drawScore() {
    ctx.textAlign = "center";
    ctx.font = "bold 60px Arial";

    ctx.strokeStyle = "black";
    ctx.lineWidth = 6;
    ctx.strokeText(score, canvas.width / 2, 80);

    ctx.fillStyle = "white";
    ctx.fillText(score, canvas.width / 2, 80);
}

/* =========================
   GAME LOOP
========================= */

function gameLoop() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    // START SCREEN
    if (gameState === "start") {

        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = "center";
        ctx.font = "bold 50px Arial";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 6;
        ctx.strokeText("WING RUSH", canvas.width / 2, 250);

        ctx.fillStyle = "yellow";
        ctx.fillText("WING RUSH", canvas.width / 2, 250);

        ctx.font = "20px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("Press Space to Start", canvas.width / 2, 300);

        requestAnimationFrame(gameLoop);
        return;
    }

    // GAME OVER
    if (gameState === "gameover") {

        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = "center";
        ctx.font = "bold 60px Arial";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 8;
        ctx.strokeText("GAME OVER", canvas.width / 2, 250);

        ctx.fillStyle = "red";
        ctx.fillText("GAME OVER", canvas.width / 2, 250);

        ctx.font = "24px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("Score: " + score, canvas.width / 2, 300);
        ctx.fillText("Best: " + bestScore, canvas.width / 2, 330);

        if (Math.floor(Date.now() / 500) % 2 === 0) {
            ctx.fillText("Press Space to Restart", canvas.width / 2, 380);
        }

        requestAnimationFrame(gameLoop);
        return;
    }

    // PLAYING
    updateBird();
    drawBird();

    updatePipes();
    drawPipes();

    drawScore();

    requestAnimationFrame(gameLoop);
}

function endGame() {
    if (gameState !== "playing") return;

    gameState = "gameover";

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
    }
}

function restartGame() {
    score = 0;
    pipes = [];
    bird.y = 200;
    bird.velocity = 0;
    gameState = "playing";
}

/* =========================
   CONTROLS
========================= */

document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        if (gameState === "start" || gameState === "gameover") {
            restartGame();
        }
        else if (gameState === "playing") {
            bird.velocity = bird.lift;
        }
    }
});

document.addEventListener("click", () => {
    if (gameState === "start" || gameState === "gameover") {
        restartGame();
    }
    else if (gameState === "playing") {
        bird.velocity = bird.lift;
    }
});

setInterval(createPipe, 2000);
gameLoop();
