import { canvas, cellSize, controlsBar, ctx, gameGrid, mouse } from './globalConstants.js';
import levelData from './levelData.JSON' assert { type: 'json' };
import { drawGhost, handleDefenders, chooseDefender, getDefenderTypes, createDefender } from './defenders.js';
import { handleProjectiles } from './projectiles.js';
import { handleEnemies, getSpawnedEnemies, enemies, deadEnemies, enemyPosition } from './enemies.js';
import { handleFloatingMessages, handleTooltips } from './floatingMessages.js';
import {
	collision,
	getScore,
	getResources,
	getLevel,
	getEnemiesToSpawn,
	getGameOver,
	setGameOver
} from './methodUtil.js';
import { handleResources } from './resources.js';
import { getGameStart, getHordeMode, levelOverScreen } from './view.js';

let canvasPosition = canvas.getBoundingClientRect(),
	listenersAdded = false,
	frame = 0,
	//framerate
	fpsInterval,
	now,
	then,
	elapsed;
class Cell {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.width = cellSize;
		this.height = cellSize;
	}
	draw() {
		if (mouse.x && mouse.y && collision(this, mouse)) {
			ctx.fillStyle = 'darkgreen';
			ctx.globalAlpha = 0.2;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
		ctx.globalAlpha = 1;
	}
}

window.addEventListener('resize', function () {
	canvasPosition = canvas.getBoundingClientRect();
});

function createListeners(enemiesInterval, frame, enemies, enemyPosition) {
	canvas.addEventListener('mouseup', function () {
		mouse.clicked = true;
	});

	canvas.addEventListener('mousemove', function (e) {
		mouse.x = e.x - canvasPosition.left;
		mouse.y = e.y - canvasPosition.top;
	});

	canvas.addEventListener('mouseleave', function () {
		mouse.x = undefined;
		mouse.y = undefined;
	});

	canvas.addEventListener('click', function () {
		createDefender(getResources());
	});
	// Event listener for right click ( ie, Context Menu )
	canvas.addEventListener('contextmenu', function (e) {
		// Disabling context menu
		e.preventDefault();
		e.stopPropagation();
		mouse.rightClicked = true;
	});
	frame = 0;
	enemies.splice(0, enemies.length);
	enemyPosition.splice(0, enemyPosition.length);
	enemiesInterval = levelData.level.spawnRate;
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
		if (!drawGhost(gameGrid[i])) {
			gameGrid[i].draw();
		}
	}
}

//utilities
function handleGameStatus(gameComplete, hordeMode, enemiesToSpawn, enemies) {
	const defenderTypes = getDefenderTypes();
	const numberOfResources = getResources();
	if (!gameComplete) {
		ctx.fillStyle = 'gold';
		ctx.font = '30px Arial';
		ctx.fillText('Score: ' + getScore(), defenderTypes[defenderTypes.length - 1].x + 90, 40);
		ctx.fillText('Resources: ' + numberOfResources, defenderTypes[defenderTypes.length - 1].x + 90, 80);
		hordeMode
			? ctx.fillText('Horde Mode', canvas.width - 200, 60)
			: ctx.fillText('Level ' + getLevel(), canvas.width - 120, 60);
	}
	if (enemiesToSpawn <= getSpawnedEnemies() && enemies.length <= 0 && deadEnemies.length <= 0) {
		ctx.fillStyle = 'blue';
		ctx.font = '60px Arial';
		ctx.fillText('Level Complete!', 300, 300);
		setGameOver(true);
	} else if (getGameOver()) {
		ctx.fillStyle = 'black';
		ctx.font = '90px Arial';
		ctx.fillText('GAME OVER', 135, 330);
	}
}

function startAnimating() {
	const fps = 60;
	fpsInterval = 1000 / fps;
	then = window.performance.now();
	animate();
}

function animate(newtime) {
	now = newtime;
	elapsed = now - then;
	const gameStarted = getGameStart(),
		hordeMode = getHordeMode(),
		enemiesInterval = 100;
	if (elapsed > fpsInterval) {
		then = now - (elapsed % fpsInterval);
		const background = new Image();
		background.src = './images/battleground.png';
		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
		handleGameGrid();
		handleProjectiles(enemies);
		handleEnemies(frame, enemiesInterval, gameStarted, hordeMode, getEnemiesToSpawn());
		if (!listenersAdded && gameStarted) {
			createListeners(enemiesInterval, frame, enemies, enemyPosition);
			listenersAdded = true;
		}
		if (gameStarted) {
			ctx.fillStyle = 'darkgreen'; //#5D682F - colour of battleground (lighter area) #545D2A - darker area
			ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
			handleDefenders(enemyPosition, enemies);
			chooseDefender();
			handleResources(frame, getGameOver());
			handleGameStatus(false, hordeMode, getEnemiesToSpawn(), enemies);
		}

		handleFloatingMessages();
		handleTooltips();
		frame++;
		mouse.clicked = false;
		mouse.rightClicked = false;
	}
	if (!getGameOver()) {
		requestAnimationFrame(animate);
	} else {
		levelOverScreen();
		handleGameStatus(true, hordeMode, getEnemiesToSpawn(), enemies);
	}
}

createGrid();
startAnimating();
