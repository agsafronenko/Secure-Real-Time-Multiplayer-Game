import Player from './Player.mjs';
import Collectible from './Collectible.mjs';


const socket = io();

const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');
const mainPlayerImg = 'assets/main-player.png';
const otherPlayerImg = 'assets/other-player.png';
let rankInfo = document.getElementById('rank-info'); 

const players = {};
let collectibles = [];


// Listen for connection and player updates
socket.on('connect', () => {
  socket.emit('newPlayer', { id: socket.id });
});

// Update players based on server data
socket.on('updatePlayers', (playerData) => {
    // Clear existing player to prevent duplicates after window refresh
    Object.keys(players).forEach((id) => {
      if (!playerData[id]) {
        delete players[id];
      }
    });
    // Add player
  for (const id in playerData) {
    const { x, y, score } = playerData[id];
    const imgSrc = id === socket.id ? mainPlayerImg : otherPlayerImg;
    players[id] = new Player({ x, y, score, id, imgSrc });
  }
});

// Update player's rank based on server data
socket.on('updateRanks', (ranks) => {
  const playerRank = players[socket.id].calculateRank(ranks);
  rankInfo.textContent = playerRank;
});

// Update collectibles based on server data
socket.on('updateCollectibles', (serverCollectibles) => {
  collectibles = serverCollectibles.map(data => new Collectible(data));
});

// Draw the game elements
function drawGame() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  collectibles.forEach(collectible => collectible.draw(context));
  for (const id in players) {
    players[id].draw(context);
  }
  requestAnimationFrame(drawGame);
}
drawGame();

// Handle player movement based on keyboard input
document.addEventListener('keydown', (event) => {
  const playerId = socket.id;
  if (event.key === 'ArrowUp') {
    players[playerId].movePlayer('up');
  }
  if (event.key === 'ArrowDown') {
    players[playerId].movePlayer('down');
  }
  if (event.key === 'ArrowLeft') {
    players[playerId].movePlayer('left');
  }
  if (event.key === 'ArrowRight') {
    players[playerId].movePlayer('right');
  }
  socket.emit('playerMovement', { x: players[playerId].x, y: players[playerId].y, score: players[playerId].score });
});




