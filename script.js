const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 700;
const cellSize = 100;
const cellGap = 3;
const gameGrid = [];

let canvasPosition = canvas.getBoundingClientRect();
let level = 9;
let numberOfResources = levelData[level].numberOfResources; // seperation of concerns!
let frame = 0; // SoC
let enemiesToSpawn = levelData[level].enemiesToSpawn; //SoC
let enemiesInterval = 100; //SoC
let gameOver = false; // SoC
let score = 0; // SoC
//framerate
var fpsInterval, now, then, elapsed;
//
const mouse = {
  x: undefined,
  y: undefined,
  width: 0.1,
  height: 0.1,
  clicked: false,
};
function createListeners() {
  canvas.addEventListener("mousedown", function () {
    mouse.clicked = true;
  });

  canvas.addEventListener("mouseup", function () {
    mouse.clicked = false;
  });

  canvas.addEventListener("mousemove", function (e) {
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
  });

  canvas.addEventListener("mouseleave", function () {
    mouse.x = undefined;
    mouse.y = undefined;
  });

  canvas.addEventListener("click", function () {
    createDefender();
  });
  frame = 0;
  enemies.splice(0, enemies.length);
  enemyPosition.splice(0, enemyPosition.length);
  enemiesInterval = levelData[level].enemiesInterval;
}

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
  }
  draw() {
    if (mouse.x && mouse.y && collision(this, mouse)) {
      ctx.fillStyle = "darkgreen";
      ctx.globalAlpha = 0.2;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    ctx.globalAlpha = 1;
  }
}

function createGrid() {
  for (let y = cellSize; y < 600; y += cellSize) {
    for (let x = 0; x < 900; x += cellSize) {
      gameGrid.push(new Cell(x, y));
    }
  }
}

function handleGameGrid() {
  for (let i = 0; i < gameGrid.length; i++) {
    gameGrid[i].draw();
  }
}

//utilities
function handleGameStatus(gameComplete) {
  if (!gameComplete) {
    ctx.fillStyle = "gold";
    ctx.font = "30px Arial";
    ctx.fillText(
      "Score: " + score,
      defenderTypes[defenderTypes.length - 1].x + 90,
      40
    );
    ctx.fillText(
      "Resources: " + numberOfResources,
      defenderTypes[defenderTypes.length - 1].x + 90,
      80
    );
    hordeMode
      ? ctx.fillText("Horde Mode", canvas.width - 200, 60)
      : ctx.fillText("Level " + level, canvas.width - 120, 60);
  }
  if (
    enemiesToSpawn <= spawnedEnemies &&
    enemies.length <= 0 &&
    deadEnemies.length <= 0
  ) {
    ctx.fillStyle = "blue";
    ctx.font = "60px Arial";
    ctx.fillText("Level Complete!", 300, 300);
    gameOver = true;
  } else if (gameOver) {
    ctx.fillStyle = "black";
    ctx.font = "90px Arial";
    ctx.fillText("GAME OVER", 135, 330);
  }
}
const controlsBar = {
  width: canvas.width,
  height: cellSize,
};
createGrid();
startAnimating();
function startAnimating() {
  fps = 60;
  fpsInterval = 1000 / fps;
  then = window.performance.now();
  animate();
}

function animate(newtime) {
  now = newtime;
  elapsed = now - then;
  if (elapsed > fpsInterval) {
    then = now - (elapsed % fpsInterval);
    const background = new Image();
    background.src = "./images/battleground.png";
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    handleGameGrid();
    handleProjectiles();
    handleEnemies();
    if (gameStarted) {
      ctx.fillStyle = "darkgreen"; //#5D682F - colour of battleground (lighter area) #545D2A - darker area
      ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
      chooseDefender();
      handleDefenders();
      handleResources();
      handleGameStatus(false);
    }

    handleFloatingMessages();
    frame++;
  }
  if (!gameOver) {
    requestAnimationFrame(animate);
  } else {
    levelOverScreen();
    handleGameStatus(true);
  }
}
function collision(first, second, value) {
  if (
    !(
      first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y
    )
  ) {
    if (!value) {
      return 1;
    }
    return value;
  }
  return 0;
}
window.addEventListener("resize", function () {
  canvasPosition = canvas.getBoundingClientRect();
});
