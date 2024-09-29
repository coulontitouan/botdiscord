import sharp from 'sharp';
import { createCanvas, loadImage } from 'canvas';

export interface MosaicOptions {
    gridSize: number;
    seed?: string[];
}

export default async function mosaicifyImage(imageSource: Buffer, gridSize: number): Promise<Buffer> {
    const image = sharp(imageSource);
    const { width, height } = await image.metadata() as { width: number, height: number };

    const tileSize = width / gridSize;

    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');

    const img = await loadImage(imageSource);

    let tiles = [];
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            tiles.push({ x: x * tileSize, y: y * tileSize });
        }
    }

    for (let i = tiles.length - 1; i > 0; i--) {
        let j: number;
        j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const tile = tiles[y * gridSize + x];
            context.drawImage(img, tile.x, tile.y, tileSize, tileSize, x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }

    const buffer = canvas.toBuffer('image/png');
    return buffer;
};
