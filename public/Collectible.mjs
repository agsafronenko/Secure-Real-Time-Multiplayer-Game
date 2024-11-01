const COLLECTIBLE_WIDTH = 32;
const COLLECTIBLE_HEIGHT = 32;

class Collectible {
   // Constructor to initialize the collectible properties
  constructor({x, y, value, id, width = COLLECTIBLE_WIDTH, height = COLLECTIBLE_HEIGHT}) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;
    this.width = width;
    this.height = height;

    // Initialize image if the Image constructor is available
    if (typeof Image !== 'undefined') {
      this.img = new Image();
      this.img.src = `assets/${this.value}-coin.png`;
    } else {
      this.img = null;
    }
  }
  
  // Method to draw the collectible on the canvas
  draw(context) {
    if (this.img.complete) {
      // Draw immediately if loaded
      context.drawImage(this.img, this.x, this.y); 
      this.img.onload = () => {
        // Load and draw once the image is ready
        context.drawImage(this.img, this.x, this.y); 
      };
    }
  }
}

export default Collectible;
