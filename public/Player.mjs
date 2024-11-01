const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;
const PLAYER_WIDTH = 32;
const PLAYER_HEIGHT = 32;
const SPEED = 15

class Player {
  constructor({x, y, score, id, imgSrc, width = PLAYER_WIDTH, height = PLAYER_HEIGHT}) {
    // Initialize player properties with provided values
    this.x = x;
    this.y = y;
    this.score = score || 0;
    this.id = id;
    this.width = width;
    this.height = height;

    // Initialize image if the Image constructor is available
    if (typeof Image !== 'undefined') { 
      this.img = new Image();
      this.img.src = imgSrc;
    } else {
      this.img = null;
    }
  }

  // Method to move the player in a specified direction
  movePlayer(dir, speed = SPEED) {
    if (dir === 'up') {
      this.y = Math.max(0, this.y - speed); 
    }
    if (dir === 'down') {
      this.y = Math.min(CANVAS_HEIGHT - this.height, this.y + speed); 
    }
    if (dir === 'left') {
      this.x = Math.max(0, this.x - speed); 
    }
    if (dir === 'right') {
      this.x = Math.min(CANVAS_WIDTH - this.width, this.x + speed); 
    }
  }

  // Method to check for collision with another item
  collision(item) {
    return (
      this.x < item.x + item.width &&
      this.x + this.width > item.x &&
      this.y < item.y + item.height &&
      this.y + this.height > item.y
    );
  }

  // Method to calculate player's rank
  calculateRank(arr) {
    arr.sort((a, b) => b.score - a.score);
    const rank = arr.findIndex(player => player.id === this.id) + 1;
    const totalPlayers = arr.length;
    return `Rank: ${rank}/${totalPlayers}`;
  }

  // Method to draw the player on a canvas context
  draw(context) {
    // Draw immediately if loaded
    if (this.img.complete) {
      context.drawImage(this.img, this.x, this.y);
    } else {
      // Load and draw once the image is ready
      this.img.onload = () => {
        context.drawImage(this.img, this.x, this.y);
      };
    }
  }
}

export default Player;
