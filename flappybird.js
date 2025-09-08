//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdimgs = [];
let birdimgsIndex = 0;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;

//sounds
let pointSound = new Audio("./sfx_point.wav");
let wingSound = new Audio("./sfx_wing.wav");
let hitSound = new Audio("./sfx_hit.wav");
let swooshSound = new Audio("./sfx_swooshing.wav"); // ✅ swoosh sound
let bmg = new Audio("./bgm_mario.mp3");
bmg.loop = true;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    // Load bird images
    for (let i = 0; i < 4; i++) {
        let birdImg = new Image();
        birdImg.src = `./flappybird${i}.png`;
        birdimgs.push(birdImg);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds
    setInterval(animateBird, 100); // animate bird

    // controls: keyboard, mouse, touch
    document.addEventListener("keydown", moveBird);
    document.addEventListener("mousedown", moveBird);
    document.addEventListener("touchstart", moveBird);

    bmg.play();
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity, limit to top

    context.drawImage(birdimgs[birdimgsIndex], bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; // 0.5 for each pipe
            pointSound.play();
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            hitSound.play();
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element
    }

    //score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(Math.floor(score), 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
        bmg.pause();
        bmg.currentTime = 0;
    }
}

function animateBird() {
    birdimgsIndex++;
    birdimgsIndex %= birdimgs.length;
}

function placePipes() {
    if (gameOver) {
        return;
    }
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);

    swooshSound.play(); // ✅ play swoosh when new pipes appear
}

function moveBird(e) {
    if (
        e.type === "mousedown" ||
        e.type === "touchstart" ||
        e.code == "Space" ||
        e.code == "ArrowUp" ||
        e.code == "KeyX"
    ) {
        if (bmg.paused) {
            bmg.play();
        }
        wingSound.play();
        velocityY = -6;

        //reset game
        if (gameOver) {
            swooshSound.play(); // ✅ play swoosh when restarting
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
        a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
        a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}
  