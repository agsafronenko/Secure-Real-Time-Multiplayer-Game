class Player {
  constructor({x, y, score, id, imgSrc}) {
    this.x = x;
    this.y = y;
    this.score = score || 0;
    this.id = id;
    this.width = 32;
    this.height = 32;
    // this.img = new Image();
    // this.img.src = imgSrc;
    if (typeof Image !== 'undefined') {  // Check if 'Image' is defined
      this.img = new Image();
      this.img.src = imgSrc;
    } else {
      this.img = null;  // Set to null in non-browser environments
    }
  }

  movePlayer(dir, speed = 15) {
    if (dir === 'up') this.y -= speed;
    if (dir === 'down') this.y += speed;
    if (dir === 'left') this.x -= speed;
    if (dir === 'right') this.x += speed;
  }

  collision(item) {
    return (
      this.x < item.x + item.width &&
      this.x + this.width > item.x &&
      this.y < item.y + item.height &&
      this.y + this.height > item.y
    );
  }

  // calculateRank(arr) {
  //   arr.sort((a, b) => b.score - a.score);
  //   return arr.map((player, index) => ({
  //     id: player.id,
  //     rank: index + 1,
  //     score: player.score
  //   }));
  // }

  calculateRank(arr) {
    // Sort players by score in descending order
    arr.sort((a, b) => b.score - a.score);
    
    // Find this player's rank
    const rank = arr.findIndex(player => player.id === this.id) + 1;
    const totalPlayers = arr.length;

    // Return the rank string in the format "Rank: X/Y"
    return `Rank: ${rank}/${totalPlayers}`;
  }

  draw(context) {
    if (this.img.complete) {
      context.drawImage(this.img, this.x, this.y);
    } else {
      this.img.onload = () => {
        context.drawImage(this.img, this.x, this.y);
      };
    }
  }
}

export default Player;
