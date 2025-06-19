// src/entities/Capsules.ts
import { Actor, Rectangle, Color } from 'excalibur';
import { Resources } from '../resources/Resources';
import { GameConfig } from '../config/GameConfig';
import { GameGrid } from '../game/GameGrid';

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

    // Which half is "first" (determines rotation state)
    private half1IsFirst: boolean = true;

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
     * @param grid The game grid to check collisions against
     * @returns True if rotation was successful
     */
    public rotate(grid?: GameGrid): boolean {
        // Check if rotation is valid
        if (!this.canRotate(grid)) return false;
        
        // Perform 90-degree clockwise rotation
        if (this.orientation === 'horizontal') {
            // Horizontal to vertical
            this.orientation = 'vertical';
            // Keep the same "first" half
        } else {
            // Vertical to horizontal
            this.orientation = 'horizontal';
            this.half1IsFirst = !this.half1IsFirst;
        }

        this.updateHalfPositions();
        this.updateHalfSprites();
        
        return true;
    }

    /**
     * Updates the positions of both halves based on orientation
     */
    private updateHalfPositions(): void {
        if (this.half1IsFirst) {
            // Half1 is at the base position
            this.half1.gridCol = this.gridCol;
            this.half1.gridRow = this.gridRow;

            if (this.orientation === 'horizontal') {
                // Half2 is to the right
                this.half2.gridCol = this.gridCol + 1;
                this.half2.gridRow = this.gridRow;
            } else {
                // Half2 is below
                this.half2.gridCol = this.gridCol;
                this.half2.gridRow = this.gridRow + 1;
            }
        } else {
            // Half2 is at the base position
            this.half2.gridCol = this.gridCol;
            this.half2.gridRow = this.gridRow;

            if (this.orientation === 'horizontal') {
                // Half1 is to the right
                this.half1.gridCol = this.gridCol + 1;
                this.half1.gridRow = this.gridRow;
            } else {
                // Half1 is below
                this.half1.gridCol = this.gridCol;
                this.half1.gridRow = this.gridRow + 1;
            }
        }
    }

    /**
     * Updates the sprites of both halves
     */
    private updateHalfSprites(): void {
        if (this.half1IsFirst) {
            this.half1.updateSprite(this.orientation, true);
            this.half2.updateSprite(this.orientation, false);
        } else {
            this.half1.updateSprite(this.orientation, false);
            this.half2.updateSprite(this.orientation, true);
        }
    }

    /**
     * Checks if the capsule can move left
     * @param grid The game grid to check collisions against
     * @returns True if move is valid
     */
    public canMoveLeft(grid?: GameGrid): boolean {
        // Check boundaries
        if (this.gridCol <= 0) return false;

        // Check for collisions with other objects
        if (grid) {
            // For horizontal capsules, we need to check the leftmost position
            // For vertical capsules, both halves are in the same column
            if (this.orientation === 'horizontal') {
                // Only need to check the left half's new position
                if (grid.isOccupied(this.gridCol - 1, this.gridRow)) {
                    console.log(`Capsule: canMoveLeft (horizontal): grid.isOccupied(${this.gridCol - 1}, ${this.gridRow}) = ${grid.isOccupied(this.gridCol - 1, this.gridRow)}`);
                    return false;
                }
            } else {
                // Vertical - check both halves at the new column
                if (grid.isOccupied(this.gridCol - 1, this.gridRow) ||
                    grid.isOccupied(this.gridCol - 1, this.gridRow + 1)) {
                    console.log(`Capsule: canMoveLeft (vertical 1/2): grid.isOccupied(${this.gridCol - 1}, ${this.gridRow}) = ${grid.isOccupied(this.gridCol - 1, this.gridRow)}`);
                    console.log(`Capsule: canMoveLeft (vertical 2/2): grid.isOccupied(${this.gridCol - 1}, ${this.gridRow + 1}) = ${grid.isOccupied(this.gridCol - 1, this.gridRow + 1)}`);
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Checks if the capsule can move right
     * @param grid The game grid to check collisions against
     * @returns True if move is valid
     */
    public canMoveRight(grid?: GameGrid): boolean {
        // Check boundaries
        if (this.orientation === 'horizontal') {
            if (this.gridCol + 1 >= GameConfig.FIELD_WIDTH - 1) return false;
        } else {
            if (this.gridCol >= GameConfig.FIELD_WIDTH - 1) return false;
        }

        // Check for collisions with other objects
        if (grid) {
            if (this.orientation === 'horizontal') {
                // Only need to check the right half's new position
                if (grid.isOccupied(this.gridCol + 2, this.gridRow)) {
                    console.log(`Capsule: canMoveRight (horizontal): grid.isOccupied(${this.gridCol - 2}, ${this.gridRow}) = ${grid.isOccupied(this.gridCol - 2, this.gridRow)}`);
                    return false;
                }
            } else {
                // Vertical - check both halves at the new column
                if (grid.isOccupied(this.gridCol + 1, this.gridRow) ||
                    grid.isOccupied(this.gridCol + 1, this.gridRow + 1)) {
                    console.log(`Capsule: canMoveRight (vertical 1/2): grid.isOccupied(${this.gridCol + 1}, ${this.gridRow}) = ${grid.isOccupied(this.gridCol + 1, this.gridRow)}`);
                    console.log(`Capsule: canMoveRight (vertical 2/2): grid.isOccupied(${this.gridCol + 1}, ${this.gridRow + 1}) = ${grid.isOccupied(this.gridCol + 1, this.gridRow + 1)}`);
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Checks if the capsule can move down
     * @param grid The game grid to check collisions against
     * @returns True if move is valid
     */
    public canMoveDown(grid?: GameGrid): boolean {
        // Check boundaries
        if (this.orientation === 'horizontal') {
            if (this.gridRow + 1 >= GameConfig.FIELD_HEIGHT) return false;
        } else {
            if (this.gridRow + 2 >= GameConfig.FIELD_HEIGHT) return false;
        }

        // Check for collisions with other objects
        if (grid) {
            if (this.orientation === 'horizontal') {
                // Check both halves at the new row
                if (grid.isOccupied(this.gridCol, this.gridRow + 1) ||
                    grid.isOccupied(this.gridCol + 1, this.gridRow + 1)) {
                    console.log(`Capsule: canMoveDown (horizontal 1/2): grid.isOccupied(${this.gridCol}, ${this.gridRow + 1}) = ${grid.isOccupied(this.gridCol, this.gridRow + 1)}`);
                    console.log(`Capsule: canMoveDown (horizontal 2/2): grid.isOccupied(${this.gridCol + 1}, ${this.gridRow + 1}) = ${grid.isOccupied(this.gridCol + 1, this.gridRow + 1)}`);
                    return false;
                }
            } else {
                // Vertical - only need to check the bottom half's new position
                if (grid.isOccupied(this.gridCol, this.gridRow + 2)) {
                    console.log(`Capsule: canMoveDown (vertical): grid.isOccupied(${this.gridCol}, ${this.gridRow + 2}) = ${grid.isOccupied(this.gridCol, this.gridRow + 2)}`);
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Checks if the capsule can rotate
     * @param grid The game grid to check collisions against
     * @returns True if rotation is valid
     */
    public canRotate(grid?: GameGrid): boolean {
        // Calculate new position after rotation
        let newCol2 = this.gridCol;
        let newRow2 = this.gridRow;

        if (this.orientation === 'horizontal') {
            // Currently horizontal, would become vertical
            newRow2 = this.gridRow + 1;

            // Check if it would go out of bounds
            if (newRow2 >= GameConfig.FIELD_HEIGHT) return false;
        } else {
            // Current vertical, would become horizontal
            newCol2 = this.gridCol + 1;

            // Check if it would go out of bounds
            if (newCol2 >= GameConfig.FIELD_WIDTH) return false;
        }

        // Check for collisions
        if (grid && grid.isOccupied(newCol2, newRow2)) {
            console.log(`Capsule: canRotate: grid.isOccupied(${newCol2}, ${newRow2}) = ${grid.isOccupied(newCol2, newRow2)}`);
            return false;
        }

        return true;
    }

    /**
     * Moves the capsule on column left
     * @param grid The game grid to check collisions against
     * @returns True if move was successful
     */
    public moveLeft(grid?: GameGrid): boolean {
        if (!this.canMoveLeft(grid)) return false;

        this.setGridPosition(this.gridCol - 1, this.gridRow);
        return true;
    }

    /**
     * Moves the capsule on column right
     * @param grid The game grid to check collisions against
     * @returns True if move was successful
     */
    public moveRight(grid?: GameGrid): boolean {
        if (!this.canMoveRight(grid)) return false;

        this.setGridPosition(this.gridCol + 1, this.gridRow);
        return true;
    }

    /**
     * Moves the capsule one row down
     * @param grid The game grid to check collisions against
     * @returns True if move was successful
     */
    public moveDown(grid?: GameGrid): boolean {
        if (!this.canMoveDown(grid)) return false;

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