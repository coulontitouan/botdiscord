const sharp = require('sharp');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

const mosaicifyImage = async (inputPath, outputPath, gridSize) => {
  try {
    // Load the image using sharp
    const image = await sharp(inputPath);
    const { width, height } = await image.metadata();

    // Ensure the image is square
    if (width !== height) {
      throw new Error('Image must be square');
    }

    const tileSize = width / gridSize;

    // Create a canvas to draw the shuffled image
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    // Load the image into the canvas
    const img = await loadImage(inputPath);

    // Create an array of tile coordinates
    const tiles = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        tiles.push({ x: x * tileSize, y: y * tileSize });
      }
    }

    // Shuffle the tiles array
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    // Draw the shuffled tiles on the canvas
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const tile = tiles[y * gridSize + x];
        context.drawImage(img, tile.x, tile.y, tileSize, tileSize, x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }

    // Save the result as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    console.log('Mosaic image created successfully');
  } catch (error) {
    console.error('Error creating mosaic image:', error);
  }
};

// Example usage
const inputImagePath = 'input.png'; // Replace with your input image path
const outputImagePath = 'output.png'; // Replace with your output image path
const gridSize = 4; // Change this to your desired grid size (e.g., 4x4 or 8x8)

mosaicifyImage(inputImagePath, outputImagePath, gridSize);
