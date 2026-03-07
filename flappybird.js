// Board Setup
let board, context;
let boardWidth = 360;
let boardHeight = 640;

// Bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
//let birdImg;
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
    // birdImg = new Image();
    // birdImg.src = "./flappybird.gif";
    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";
    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    // Menu Logic
    let playBtn = document.getElementById("playBtn");
    let menu = document.getElementById("menu");
    
    playBtn.addEventListener("click", function() {
        gameStarted = true;
        pipeArray = []; // Clear any accidental pipes
        menu.style.display = "none";
        bgm.play().catch(() => {}); 
    });

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); // Fixed by the 'if(!gameStarted)' check inside
    document.addEventListener("keydown", handleInput);
    document.addEventListener("touchstart", handleInput);

     // image loading
    for(let i=0; i<4; i+=1){
       let birdImg = new Image();
        birdImg.src = `./flappybird${i}.png`;
        birdImgs.push(birdImg);
    }

    board.addEventListener("mousedown", function(e) {
    if (gameOver) {
        // Get mouse coordinates relative to canvas
        let rect = board.getBoundingClientRect();
        let mouseX = e.clientX - rect.left;
        let mouseY = e.clientY - rect.top;

        // Check if mouse is inside the Restart Button area
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

    // --- BIRD PHYSICS (Only if NOT game over) ---
    if (!gameOver) {
        velocityY += gravity;
        bird.y = Math.max(bird.y + velocityY, 0); 

        // Animation logic
        if (frameCount % 5 === 0) {
            birdImgsIndex = (birdImgsIndex + 1) % birdImgs.length;
        }
        frameCount++;
    }

    // --- DRAW PIPES ---
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        if (!gameOver) {
            pipe.x += velocityX; // Only move pipes if alive
        }
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!gameOver && !pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectedCollision(bird, pipe)) {
            triggerGameOver();
        }
    }

    // --- DRAW BIRD ---
    // We draw this AFTER pipes so the bird sits in front of them
    let currentBirdImg = birdImgs[birdImgsIndex];
    if (currentBirdImg) {
        context.drawImage(currentBirdImg, bird.x, bird.y, bird.width, bird.height);
    }

    if (bird.y > board.height) {
        triggerGameOver();
    }

    // --- CLEANUP ---
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    // --- UI LAYER ---
    drawScore();

    // Finally, if it's Game Over, draw the menu ON TOP of the frozen game
    if (gameOver) {
        drawGameOver();
    }
}

function handleInput(e) {
    // Check for Space, ArrowUp, or Touch
    if (e.code === "Space" || e.code === "ArrowUp" || e.type === "touchstart") {
        
        if (!gameStarted) {
            // IF THE MENU IS OPEN: Start the game
            startGame();
        } else if (gameOver) {
            // IF DIED: Reset the game
            resetGame();
        } else {
            // IF PLAYING: Jump
            velocityY = -6;
            wingSound.play();
        }
        
        // Prevent page scrolling when hitting Space
        if (e.code === "Space") e.preventDefault();
    }
}

function triggerGameOver() {
    if (!gameOver) {
        gameOver = true;
        hitSound.play();
        dieSound.play();
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

function placePipes() {
    // THE FIX: Prevent pipes from spawning if the game hasn't started
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
    
    // Current Score
    context.fillText(Math.floor(score), 20, 45);
    
    // Best Score (added this)
    context.font = "12px 'Press Start 2P', cursive";
    context.fillText("BEST: " + bestScore, 20, 75);
}

function drawGameOver() {
    // 1. Darken the background slightly for focus
    context.fillStyle = "rgba(0, 0, 0, 0.4)";
    context.fillRect(0, 0, boardWidth, boardHeight);

    // 2. Game Over Text
    context.fillStyle = "white";
    context.font = "24px 'Press Start 2P', cursive";
    context.textAlign = "center";
    context.fillText("GAME OVER", boardWidth / 2, 220);

    // 3. Stats Box
    context.font = "16px 'Press Start 2P', cursive";
    context.fillText("SCORE: " + Math.floor(score), boardWidth / 2, 280);
    context.fillText("BEST: " + bestScore, boardWidth / 2, 320);

    // 4. THE RESTART ICON/BUTTON
    let btnX = boardWidth / 2 - 80;
    let btnY = 360;
    let btnW = 160;
    let btnH = 50;

    // Draw Button Border/Shadow
    context.fillStyle = "#543847"; // Dark brown border
    context.fillRect(btnX, btnY, btnW, btnH);
    
    // Draw Button Face
    context.fillStyle = "#e86101"; // Classic orange
    context.fillRect(btnX + 4, btnY - 4, btnW - 8, btnH);

    // Draw Icon (The Emoji/Symbol)
    context.fillStyle = "white";
    context.font = "20px Arial"; // Using Arial for the emoji to ensure it renders
    context.fillText("↻ RESTART", boardWidth / 2, 392);

    context.textAlign = "left"; // Reset alignment for other functions
}

// function to handle the transition
function startGame() {
    gameStarted = true;
    pipeArray = []; 
    document.getElementById("menu").style.display = "none";
    bgm.play().catch(() => {}); 
}

// Update window.onload playBtn listener to use it:
playBtn.addEventListener("click", startGame);

function detectedCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}