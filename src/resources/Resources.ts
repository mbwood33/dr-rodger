// src/resources/Resources.ts
// Resource Manager

import { ImageSource, Loader, SpriteSheet } from 'excalibur';

/**
 * Manages all game resources like images, sounds, and sprite sheets
 */
export class Resources {
    // Image sources - these load the actual image files
    public static readonly SpriteSheetImage = new ImageSource('./images/sprites/png/sprite_sheet.png');

    // Sprite sheet - this will be initialized after the image loads
    public static SpriteSheet: SpriteSheet;

    // Resource loader - Excalibur's built-in loading screen
    public static readonly ResourceLoader = new Loader([
        Resources.SpriteSheetImage
        // We'll add more resources here later (sounds, music, etc.)
    ]);

    /**
     * Sets up sprite sheets after images are loaded
     */
    public static initialize(): void {
        // Check if the image is actually loaded
        if (!Resources.SpriteSheetImage.isLoaded()) {
            console.log('Sprite sheet image not loaded!');
            return;
        }

        // Create the sprite sheet with 32x32 sprites in a 4x7 grid
        Resources.SpriteSheet = SpriteSheet.fromImageSource({
            image: Resources.SpriteSheetImage,
            grid: {
                rows: 7,
                columns: 4,
                spriteWidth: 32,
                spriteHeight: 32
            }
        });

        console.log('Sprite sheet initialized with', Resources.SpriteSheet.sprites.length, 'sprites');
    }

    /**
     * Gets a specific capsule sprite from the sheet
     * @param color Color index (0=pink, 1=blue, 2=yellow)
     * @param orientation 'horizontal' or 'vertical'
     * @param half 'left', 'right', 'top', 'bottom'
     * @returns Sprite index of the sprite sheet
     */
    public static getCapsuleSprite(color: number, orientation: 'horizontal' | 'vertical', half: 'left' | 'right' | 'top' | 'bottom'): number {
        // Base row for the color (0 for pink, 1 for blue, 2 for yellow)
        const row = color;

        // Column based on oritentation and half
        let col = 0;
        if (orientation === 'horizontal') {
            col = half === 'left' ? 0 : 1;
        } else {
            col = half === 'top' ? 2: 3;
        }

        // Convert row,col to sprite index (row * columns + col)
        return row * 4 + col;
    }

    /**
     * Gets a half capsule sprite (for separated pieces)
     * @param color Color index (0=pink, 1=blue, 2=yellow)
     * @param returns Sprite index of the sprite sheet
     */
    public static getHalfCapsuleSprite(color: number): number {
        // Half capsules are in row 3, columns 0-2
        return 3 * 4 + color;
    }

    /**
     * Gets a pathogen sprite for animation
     * @param color Color index (0=pink, 1=blue, 2=yellow)
     * @param frame Animation frame (0-3)
     * @returns Sprite index in the sprite sheet
     */
    public static getPathogenSprite(color: number, frame: number): number {
        // Pathogens start at row 4 for pink, row 5 for blue, row 6 for yellow
        const row = 4 + color;
        // Frame determines the column (0-3)
        const col = frame;

        // Convert row,col to sprite index
        return row * 4 + col;
    }
}