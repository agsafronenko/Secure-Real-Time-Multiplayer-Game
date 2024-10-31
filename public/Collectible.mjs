class Collectible {
  constructor({x, y, value, id}) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;
    this.width = 32;
    this.height = 32;
    this.img = new Image();
    this.img.src = `assets/${this.value}-coin.png`;
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

// check the following block of code
try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
