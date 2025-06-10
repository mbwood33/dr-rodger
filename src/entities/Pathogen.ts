// src/entities/Pathogen.ts
// Pathogen Entity

import { Actor, Animation, AnimationStrategy, vec } from 'excalibur';
import { Resources } from '../resources/Resources';
import { GameConfig } from '../config/GameConfig';

/**
 * Represents a pathogen that needs to be cleared from the field
 */
export class Pathogen extends Actor {
    // Which color this pathogen is (0=pink, 1=blue, 2=yellow)
    public readonly colorIndex: number;

    // Grid position of this pathogen
    public gridCol: number;
    public gridRow: number;

    /**
     * Creates a new pathogen at the specified grid position
     * @param colorIndex Color of the pathogen (0=pink, 1=blue, 2=yellow)
     * @param gridCol Column position in the grid (0-7)
     * @param gridRow Row position in the grid (0-15)
     */
    constructor(colorIndex: number, gridCol: number, gridRow: number) {
        super({
            // Size matches our tile size
            width: GameConfig.TILE_SIZE,
            height: GameConfig.TILE_SIZE,

            // Position will be set properly when added to scene
            pos: vec(0, 0),

            // Name for debugging
            name: `pathogen-${colorIndex}-${gridCol},${gridRow}`
        });

        this.colorIndex = colorIndex;
        this.gridCol = gridCol;
        this.gridRow = gridRow;
    }

    /**
     * Sets up the pathogens' animation when first created
     */
    public onInitialize(): void {
        // Create an animation frame from the 4 frames
        const frames = []
        for (let frame = 0; frame < 4; frame++) {
            const spriteIndex = Resources.getPathogenSprite(this.colorIndex, frame);
            const sprite = Resources.SpriteSheet.sprites[spriteIndex];            
            if (sprite) {
                frames.push(sprite);
            }
        }

        // Create the animation
        // Each frame lasts 500ms, creating a wiggling effect
        const wiggleAnimation = new Animation({
            frames: frames.map(sprite => ({
                graphic: sprite,
                duration: 500
            })),
            strategy: AnimationStrategy.Loop    // Loop forever
        });

        // Use the animation
        this.graphics.use(wiggleAnimation);

        // Set a slightly random animation offset so they don't all wiggle in sync
        // This makes the field look more organic
        wiggleAnimation.goToFrame(Math.floor(Math.random() * 4));
    }

    /**
     * Updates the pathogen's grid position (used when falling)
     * @param gridCol New column position
     * @param gridRow New row position
     */
    public updateGridPosition(newCol: number, newRow: number): void {
        this.gridCol = newCol;
        this.gridRow = newRow;

        // Update the actor name for debugging
        this.name = `pathogen-${this.colorIndex}-${this.gridCol},${this.gridRow}`;
    }

    /**
     * Gets the human-readable color name
     * @returns Color name as string
     */
    public getColorName(): string {
        switch (this.colorIndex) {
            case 0: return 'Hot Pink';
            case 1: return 'Sky Blue';
            case 2: return 'Pear';
            default: return 'Unknown';
        }
    }

    /**
     * Gets the hex color value for this pathogen
     * @returns Hex color string
     */
    public getColorHex(): string {
        return GameConfig.COLOR_VALUES[this.colorIndex];
    }
}