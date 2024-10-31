require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.use(helmet({
  noSniff: true,
  xssFilter: true,                    
  noCache: true,
  hidePoweredBy: { setTo: 'PHP 7.4.3' },       
}));

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/public/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});


const io = socket(server);
const players = {};

function calculateRanks() {
  const playerArray = Object.keys(players).map(id => ({
    id,
    score: players[id].score
  }));

  playerArray.sort((a, b) => b.score - a.score); // Sort players by score

  return playerArray.map((player, index) => ({
    id: player.id,
    rank: index + 1,
    score: player.score
  }));
}

let collectibles = [];

// NEW: Function to create collectibles on the server
function createCollectible() {
  const x = Math.random() * 640;
  const y = Math.random() * 480;
  const value = ['bronze', 'silver', 'gold'][Math.floor(Math.random() * 3)];
  const id = collectibles.length + 1; 
  collectibles.push({ x, y, value, id, width: 32, height: 32 });
  io.emit('updateCollectibles', collectibles); // Sync collectibles across clients
}

// Initialize a few collectibles at the start
for (let i = 0; i < 5; i++) {
  createCollectible();
}





// Collision detection function
function checkCollision(player, collectible) {
  return (
    player.x < collectible.x + collectible.width &&
    player.x + 32 > collectible.x &&
    player.y < collectible.y + collectible.height &&
    player.y + 32 > collectible.y
  );
}




io.on('connection', (socket) => {
  console.log(`New player connected: ${socket.id}`);

  // If player already exists, retrieve their previous state
  if (!players[socket.id]) {
    players[socket.id] = { x: Math.random() * 640, y: Math.random() * 480, score: 0 };
  }

  io.emit('updatePlayers', players);
  const ranks = calculateRanks(); // Get the initial ranks
  io.emit('updateRanks', ranks); 
  console.log("list_of_players: ", players)
  socket.emit('updateCollectibles', collectibles);

  socket.on('playerMovement', (data) => {

    // Update player position and score
    if (players[socket.id]) {
        players[socket.id].x = data.x;
        players[socket.id].y = data.y;
    


    // Check for collisions with each collectible
    collectibles.forEach((collectible, index) => {
      if (checkCollision(players[socket.id], collectible)) {
        players[socket.id].score += collectible.value === 'gold' ? 10 : collectible.value === 'silver' ? 5 : 1;
        
        // Remove collectible from array and create a new one
        collectibles.splice(index, 1);
        createCollectible();
        
        // Emit updated data after a collectible is collected

        const ranks = calculateRanks();
        io.emit('updatePlayers', players);
        io.emit('updateCollectibles', collectibles);
        io.emit('updateRanks', ranks); // Emit the new ranks
      }
    })
  }



  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    delete players[socket.id];
    io.emit('updatePlayers', players);
    const ranks = calculateRanks();
    io.emit('updateRanks', ranks)
  });
});



module.exports = app; // For testing
