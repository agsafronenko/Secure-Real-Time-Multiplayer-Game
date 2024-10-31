import Player from './Player.mjs';
import Collectible from './Collectible.mjs';


const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');
const players = {};
let collectibles = [];




// Image sources
const mainPlayerImg = 'assets/main-player.png';
const otherPlayerImg = 'assets/other-player.png';


// Listen for connection
socket.on('connect', () => {
  console.log(`Player ID: ${socket.id}`); // Now this will log the socket.id correctly

  // Emit player connection to the server if necessary
  socket.emit('newPlayer', { id: socket.id }); // You can customize this based on your server setup
});


socket.on('updatePlayers', (playerData) => {
  for (const id in playerData) {
    if (!players[id]) {
      const imgSrc = id === socket.id ? mainPlayerImg : otherPlayerImg;
      players[id] = new Player({x: playerData[id].x, y: playerData[id].y, score: playerData[id].score, id, imgSrc});
    } else {
      players[id].x = playerData[id].x;
      players[id].y = playerData[id].y;
      players[id].score = playerData[id].score;
    }
  }
});

// socket.on('updateRank', ({ rankData, totalPlayers }) => {
//   const playerRank = rankData.find(player => player.id === socket.id);
//   const rankDisplay = playerRank ? `Rank: ${playerRank.rank}/${totalPlayers}` : `Rank: 0/${totalPlayers}`;
  
//   document.getElementById('rank').innerText = rankDisplay;
// });

let rankInfo = document.getElementById('rank-info'); 

socket.on('updateRanks', (ranks) => {
  const playerRank = ranks.find(player => player.id === socket.id);
  if (playerRank) {
    rankInfo.textContent = `Rank: ${playerRank.rank}/${ranks.length}`;
  }
});




// NEW: Listen for collectible updates from the server
socket.on('updateCollectibles', (serverCollectibles) => {
  // Update local collectible list with the server's data
  collectibles = serverCollectibles.map(data => new Collectible(data));
});





// Draw Game
function drawGame() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Draw collectibles
  collectibles.forEach(collectible => collectible.draw(context));

  // Draw players
  for (const id in players) {
    players[id].draw(context);
  }

  requestAnimationFrame(drawGame);
}

drawGame();


// Player movement
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

  // Emit the player's new position
  socket.emit('playerMovement', { x: players[playerId].x, y: players[playerId].y, score: players[playerId].score });
});




