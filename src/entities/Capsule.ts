// src/entities/Capsules.ts
import { Actor, Rectangle, Color } from 'excalibur';
import { Resources } from '../resources/Resources';
import { GameConfig } from '../config/GameConfig';

/**
 * The orientation of a capsule
 */
export type CapsuleOrientation = 'horizontal' | 'vertical';

/**
 * Represents one half of a capsule
 */
export class CapsuleHalf extends Actor {
    // Which color this half is (0=pink, 1=blue, 2=yellow)
    public readonly colorIndex: number;

    // Reference to the parent capsule
    public parentCapsule: Capsule | null = null;

    // Grid position
    public gridCol: number = 0;
    public gridRow: number = 0;

    /**
     * Creates a new capsule half
     * @param colorIndex Color of this half (0=pink, 1=blue, 2=yellow)
     */
    constructor(colorIndex: number) {
        super({
            width: GameConfig.TILE_SIZE,
            height: GameConfig.TILE_SIZE,
            name: `capsule-half-${colorIndex}`
        });

        this.colorIndex = colorIndex;
    }

    /**
     * Updates the sprite based on orientation and position
     * @param orientation Horizontal or vertical
     * @param isFirst Is this the first half (left/top) or second (right/bottom)?
     */
    public updateSprite(orientation: CapsuleOrientation, isFirst: boolean): void {
        if (!Resources.SpriteSheet) {
            // Fallback to colored rectangle
            const fallbackColor = Color.fromHex(GameConfig.COLOR_VALUES[this.colorIndex]);
            this.graphics.use(new Rectangle({
                width: GameConfig.TILE_SIZE - 2,
                height: GameConfig.TILE_SIZE - 2,
                color: fallbackColor
            }));
            return;
        }
        
        // Determine which sprite to use
        let half: 'left' | 'right' | 'top' | 'bottom';
        if (orientation === 'horizontal') {
            half = isFirst ? 'left' : 'right';
        } else {
            half = isFirst ? 'top' : 'bottom';
        }

        // Get the sprite index
        const spriteIndex = Resources.getCapsuleSprite(this.colorIndex, orientation, half);
        const row = Math.floor(spriteIndex / 4);
        const col = spriteIndex % 4;
        const sprite = Resources.SpriteSheet.getSprite(col, row);

        if (sprite) {
            this.graphics.use(sprite);
        }
    }

    /**
     * Converts this half to a single/disconnected piece
     */
    public convertToSingle(): void {
        this.parentCapsule = null;

        if (!Resources.SpriteSheet) {
            return;
        }

        // Use the half capsule sprite
        const spriteIndex = Resources.getHalfCapsuleSprite(this.colorIndex);
        const row = Math.floor(spriteIndex / 4);
        const col = spriteIndex % 4;
        const sprite = Resources.SpriteSheet.getSprite(col, row);

        if (sprite) {
            this.graphics.use(sprite);
        }
    }
}

/**
 * Represents a full capsule made of two colored halves
 */
export class Capsule extends Actor {
    // The two halves of the capsule
    public readonly half1: CapsuleHalf;
    public readonly half2: CapsuleHalf;

    // Current orientation
    public orientation: CapsuleOrientation = 'horizontal';

    // Grid position (of the first half)
    public gridCol: number = 0;
    public gridRow: number = 0;

    // Is the capsule currently falling?
    public isFalling: boolean = true;

    /**
     * Creates a new capsule with two colored halves
     * @param color1 Color of the first half (0=pink, 1=blue, 2=yellow)
     * @param color2 Color of the second half (0=pink, 1=blue, 2=yellow)
     * @param orientation Initial orientation
     */
    constructor(color1: number, color2: number, orientation: CapsuleOrientation = 'horizontal') {
        super({
            name: `capsule-${color1}-${color2}`
        });

        // Create the two halves
        this.half1 = new CapsuleHalf(color1);
        this.half2 = new CapsuleHalf(color2);

        // Set parent references
        this.half1.parentCapsule = this;
        this.half2.parentCapsule = this;

        // Set initilal orientation
        this.orientation = orientation;
        this.updateHalfPositions();
        this.updateHalfSprites();
    }

    /**
     * Called when the capsule is added to the scene
     */
    public onInitialize(): void {
        // Add both halves to the scene
        this.scene?.add(this.half1);
        this.scene?.add(this.half2);
    }

    /**
     * Called before the capsule is removed
     */
    public onPreKill(): void {
        // Remove both halves from the scene
        this.half1.kill();
        this.half2.kill();
    }

    /**
     * Sets the grid position of the capsule
     * @param col Column position
     * @param row Row position
     */
    public setGridPosition(col: number, row: number): void {
        this.gridCol = col;
        this.gridRow = row;
        this.updateHalfPositions();
    }

    /**
     * Rotates the capsule 90 degrees clockwise
     * @returns True if rotation was successful
     */
    public rotate(): boolean {
        // Toggle orientation
        const newOrientation: CapsuleOrientation =
            this.orientation === 'horizontal' ? 'vertical' : 'horizontal';
        
        // Check if rotation is valid (we'll implement collision checking later)
        // For now, just rotate
        this.orientation = newOrientation;
        this.updateHalfPositions();
        this.updateHalfSprites();
        
        return true;
    }

    /**
     * Updates the positions of both halves based on orientation
     */
    private updateHalfPositions(): void {
        // Update grid positions
        this.half1.gridCol = this.gridCol;
        this.half1.gridRow = this.gridRow;
        
        if (this.orientation === 'horizontal') {
            // Second half is to the right
            this.half2.gridCol = this.gridCol + 1;
            this.half2.gridRow = this.gridRow;
        } else {
            // Second half is below
            this.half2.gridCol = this.gridCol;
            this.half2.gridRow = this.gridRow + 1;
        }
    }

    /**
     * Updates the sprites of both halves
     */
    private updateHalfSprites(): void {
        this.half1.updateSprite(this.orientation, true);
        this.half2.updateSprite(this.orientation, false);
    }

    /**
     * Checks if the capsule can move left
     * @returns True if move is valid
     */
    public canMoveLeft(): boolean {
        // Check boundaries
        if (this.gridCol <= 0) return false;

        // TODO: Check for collisions with other objects
        return true;
    }

    /**
     * Checks if the capsule can move right
     * @returns True if move is valid
     */
    public canMoveRight(): boolean {
        // Check boundaries
        const rightmostCol = this.orientation === 'horizontal' ?
            this.half2.gridCol : this.gridCol;

        if (rightmostCol >= GameConfig.FIELD_WIDTH - 1) return false;

        // TODO: Check for collisions with other objects
        return true;
    }

    /**
     * Checks if the capsule can move down
     * @returns True if move is valid
     */
    public canMoveDown(): boolean {
        // Check boundaries
        const bottomRow = this.orientation === 'vertical' ?
            this.half2.gridRow : this.gridRow;
        
        if (bottomRow >= GameConfig.FIELD_HEIGHT - 1) return false;

        // TODO: Check for collisions with other objects
        return true;
    }

    /**
     * Moves the capsule on column left
     * @returns True if move was successful
     */
    public moveLeft(): boolean {
        if (!this.canMoveLeft()) return false;

        this.setGridPosition(this.gridCol - 1, this.gridRow);
        return true;
    }

    /**
     * Moves the capsule on column right
     * @returns True if move was successful
     */
    public moveRight(): boolean {
        if (!this.canMoveRight()) return false;

        this.setGridPosition(this.gridCol + 1, this.gridRow);
        return true;
    }

    /**
     * Moves the capsule one row down
     * @returns True if move was successful
     */
    public moveDown(): boolean {
        if (!this.canMoveDown()) return false;

        this.setGridPosition(this.gridCol, this.gridRow + 1);
        return true;
    }

    /**
     * Separates the capsule into two individual pieces
     */
    public separateHalves(): void {
        // Converts halves into single pieces
        this.half1.convertToSingle();
        this.half2.convertToSingle();

        // Remove this capsule (but keep the halves)
        this.isFalling = false;
        this.kill();
    }
}