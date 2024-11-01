require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const COLLECTIBLE_WIDTH = 32;
const COLLECTIBLE_HEIGHT = 32;
const NUMBER_COLLECTIBLES = 5
const POINTS = {GOLD: 5, SILVER: 3, BRONZE: 1}

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
let collectibles = [];


// Function to create ranks for players
function createRanks() {
  return Object.keys(players).map(id => ({
    id,
    score: players[id].score
  }));
}

// Function to create collectibles on the server
function createCollectible() {
  const x = Math.random() * CANVAS_WIDTH;
  const y = Math.random() * CANVAS_HEIGHT;
  const value = Object.keys(POINTS)[Math.floor(Math.random() * Object.keys(POINTS).length)];
  const id = collectibles.length + 1; 
  collectibles.push({ x, y, value, id, width: COLLECTIBLE_WIDTH, height: COLLECTIBLE_HEIGHT });
  io.emit('updateCollectibles', collectibles);
}

// Initialize collectibles at the start
for (let i = 0; i < NUMBER_COLLECTIBLES; i++) {
  createCollectible();
}

// Collision detection function to check if a player has collided with a collectible
function checkCollision(player, collectible) {
  return (
    player.x < collectible.x + collectible.width &&
    player.x + COLLECTIBLE_WIDTH > collectible.x &&
    player.y < collectible.y + collectible.height &&
    player.y + COLLECTIBLE_HEIGHT > collectible.y
  );
}

// Socket.io connection event for new players
io.on('connection', (socket) => {
  if (!players[socket.id]) {
    players[socket.id] = { x: Math.random() * CANVAS_WIDTH, y: Math.random() * CANVAS_HEIGHT, score: 0 };
  }
  // Emit the current state of players and collectibles to all clients
  io.emit('updatePlayers', players);
  io.emit('updateRanks', createRanks()); 
  socket.emit('updateCollectibles', collectibles);

  // Listen for player movement updates
  socket.on('playerMovement', (data) => {
    if (players[socket.id]) {
        players[socket.id].x = data.x;
        players[socket.id].y = data.y;
    
    // Check for collisions with each collectible
    collectibles.forEach((collectible, index) => {
      if (checkCollision(players[socket.id], collectible)) {
         // Update player score based on collectible value
        players[socket.id].score += collectible.value === 'GOLD' ? POINTS.GOLD : collectible.value === 'SILVER' ? POINTS.SILVER : POINTS.BRONZE;
        // Remove collectible from array and create a new one
        collectibles.splice(index, 1);
        createCollectible();
        
        // Emit updated data after a collectible is collected
        io.emit('updatePlayers', players);
        io.emit('updateCollectibles', collectibles);
        io.emit('updateRanks', createRanks());
      }
    })
  }
  });

  // Listen for player disconnection events
  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('updatePlayers', players);
    io.emit('updateRanks', createRanks())
  });
});

module.exports = app; // For testing
