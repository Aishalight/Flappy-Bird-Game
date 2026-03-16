// Board Setup
let board, context;
let boardWidth = 360;
let boardHeight = 640;

// Bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImgs = [];
let birdImgsIndex = 0;
let frameCount = 0;

let bird = { x: birdX, y: birdY, width: birdWidth, height: birdHeight };

// Pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let topPipeImg, bottomPipeImg;

// Physics & State
let velocityX = -2; 
let velocityY = 0; 
let gravity = 0.4;
let gameStarted = false;
let gameOver = false;
let score = 0;
let bestScore = Number(localStorage.getItem("bestScore")) || 0;

// Audio
let wingSound = new Audio("./sfx_wing.wav");
let hitSound = new Audio("./sfx_hit.wav");
let dieSound = new Audio("./sfx_die.wav");
let bgm = new Audio("./bgm_mario.mp3");
bgm.loop = true;

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    // Load Assets
    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";
    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    for(let i=0; i<4; i++){
        let birdImg = new Image();
        birdImg.src = `./flappybird${i}.png`;
        birdImgs.push(birdImg);
    }

    // Menu Logic
    let playBtn = document.getElementById("playBtn");
    let menu = document.getElementById("menu");
    
    playBtn.addEventListener("click", startGame);

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); 

    document.addEventListener("keydown", handleInput);
    document.addEventListener("touchstart", handleInput);

    board.addEventListener("mousedown", function(e) {
        if (gameOver) {
            let rect = board.getBoundingClientRect();
            let mouseX = e.clientX - rect.left;
            let mouseY = e.clientY - rect.top;

            // Restart Button Hitbox
            if (mouseX > boardWidth/2 - 80 && mouseX < boardWidth/2 + 80 &&
                mouseY > 360 && mouseY < 410) {
                resetGame();
            }
        }
    });
}

function update() {
    requestAnimationFrame(update);
    if (!gameStarted) return;
    
    context.clearRect(0, 0, board.width, board.height);

    // --- BIRD PHYSICS ---
    if (!gameOver) {
        velocityY += gravity;
        bird.y = Math.max(bird.y + velocityY, 0); 

        if (frameCount % 5 === 0) {
            birdImgsIndex = (birdImgsIndex + 1) % birdImgs.length;
        }
        frameCount++;
    }

    // --- DRAW PIPES ---
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        if (!gameOver) pipe.x += velocityX; 
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!gameOver && !pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; // Two pipes per gap, so 0.5 each
            pipe.passed = true;
        }

        if (detectedCollision(bird, pipe)) {
            triggerGameOver();
        }
    }

    // --- DRAW BIRD WITH TILT ---
    let currentBirdImg = birdImgs[birdImgsIndex];
    if (currentBirdImg) {
        context.save();
        // Translate to bird center
        context.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
        
        // Calculate Rotation: Up-tilt on flap, nose-dive on fall
        // Math.PI/6 is ~30 degrees up, Math.PI/2 is 90 degrees down
        let rotation = Math.min(Math.PI / 2, Math.max(-Math.PI / 6, velocityY * 0.1));
        if (gameOver) rotation = Math.PI / 2; // Face down on death
        
        context.rotate(rotation);
        context.drawImage(currentBirdImg, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
        context.restore();
    }

    if (bird.y > board.height) {
        triggerGameOver();
    }

    // Cleanup
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    drawScore();

    if (gameOver) {
        drawGameOver();
    }
}

function handleInput(e) {
    if (e.code === "Space" || e.code === "ArrowUp" || e.type === "touchstart") {
        if (!gameStarted) {
            startGame();
        } else if (gameOver) {
            resetGame();
        } else {
            velocityY = -6;
            wingSound.play();
        }
        if (e.code === "Space") e.preventDefault();
    }
}

function triggerGameOver() {
    if (!gameOver) {
        gameOver = true;
        hitSound.play();
        bgm.pause();
        if (Math.floor(score) > bestScore) {
            bestScore = Math.floor(score);
            localStorage.setItem("bestScore", bestScore);
        }
    }
}

function resetGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    velocityY = 0;
    gameOver = false;
    bgm.currentTime = 0;
    bgm.play();
}

function startGame() {
    gameStarted = true;
    pipeArray = []; 
    document.getElementById("menu").style.display = "none";
    bgm.play().catch(() => {}); 
}

function placePipes() {
    if (!gameStarted || gameOver) return;

    let randomPipeY = -pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openSpace = board.height/4;

    pipeArray.push({
        img: topPipeImg, x: pipeX, y: randomPipeY, 
        width: pipeWidth, height: pipeHeight, passed: false
    });
    pipeArray.push({
        img: bottomPipeImg, x: pipeX, y: randomPipeY + pipeHeight + openSpace, 
        width: pipeWidth, height: pipeHeight, passed: false
    });
}

function drawScore() {
    context.fillStyle = "white";
    context.font = "20px 'Press Start 2P', cursive";
    context.fillText(Math.floor(score), 20, 45);
    context.font = "12px 'Press Start 2P', cursive";
    context.fillText("BEST: " + bestScore, 20, 75);
}

function drawGameOver() {
    context.fillStyle = "rgba(0, 0, 0, 0.4)";
    context.fillRect(0, 0, boardWidth, boardHeight);

    context.fillStyle = "white";
    context.font = "24px 'Press Start 2P', cursive";
    context.textAlign = "center";
    context.fillText("GAME OVER", boardWidth / 2, 220);

    context.font = "16px 'Press Start 2P', cursive";
    context.fillText("SCORE: " + Math.floor(score), boardWidth / 2, 280);
    context.fillText("BEST: " + bestScore, boardWidth / 2, 320);

    // Restart Button
    let btnX = boardWidth / 2 - 80;
    let btnY = 360;
    let btnW = 160;
    let btnH = 50;

    context.fillStyle = "#543847"; 
    context.fillRect(btnX, btnY, btnW, btnH);
    context.fillStyle = "#e86101"; 
    context.fillRect(btnX + 4, btnY - 4, btnW - 8, btnH);

    context.fillStyle = "white";
    context.font = "20px Arial";
    context.fillText("↻ RESTART", boardWidth / 2, 392);
    context.textAlign = "left"; 
}

function detectedCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}
