class Collectible {
  constructor({x, y, value, id}) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;
    this.width = 32;
    this.height = 32;
    // this.img = new Image();
    // this.img.src = `assets/${this.value}-coin.png`;
    if (typeof Image !== 'undefined') {  // Check if 'Image' is defined
      this.img = new Image();
      this.img.src = `assets/${this.value}-coin.png`;
    } else {
      this.img = null;  // Set to null in non-browser environments
    }
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

try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
