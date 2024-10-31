class Player {
  constructor({x, y, score, id, imgSrc}) {
    this.x = x;
    this.y = y;
    this.score = score || 0;
    this.id = id;
    this.width = 32;
    this.height = 32;
    this.img = new Image();
    this.img.src = imgSrc;
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

  calculateRank(arr) {
    arr.sort((a, b) => b.score - a.score);
    return arr.map((player, index) => ({
      id: player.id,
      rank: index + 1,
      score: player.score
    }));
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
