// src/game/GameGrid.ts
// Game Grid System

import { GameConfig } from "../config/GameConfig";
import { Pathogen } from "../entities/Pathogen";
import { CapsuleHalf } from "../entities/Capsule";

/**
 * Represents what can be in a grid cell
 */
type GridCell = Pathogen | CapsuleHalf | null;

/**
 * Manages the game playing field grid and what's in each cell
 */
export class GameGrid {
    // 2D array representing the playing field
    // [column (0-7)][row (0-15)]
    private grid: GridCell[][];

    /**
    * Creates a new empty game grid
    */
    constructor() {
        // Initialize empty grid
        this.grid = [];
        for (let col = 0; col < GameConfig.FIELD_WIDTH; col++) {
            this.grid[col] = [];
            for (let row = 0; row < GameConfig.FIELD_HEIGHT; row++) {
                this.grid[col][row] = null;
            }
        }
        console.log('GameGrid: Grid initialized');
        console.table(this.grid);
    }

    /**
     * Clears all contents from the grid
     */
    public clear(): void {
        for (let col = 0; col < GameConfig.FIELD_WIDTH; col++) {
            for (let row = 0; row < GameConfig.FIELD_HEIGHT; row++) {
                this.grid[col][row] = null;
            }
        }
        console.log('GameGrid: clear - Grid cleared');
        console.table(this.grid);
    }

    /**
     * Gets the contents of a cell
     * @param col Column (0-7)
     * @param row Row (0-15)
     * @returns Contents of the cell or null if empty/out of bounds
     */
    public get(col: number, row: number): GridCell {
        // Check bounds
        if (col < 0 || col >= GameConfig.FIELD_WIDTH ||
            row < 0 || row >= GameConfig.FIELD_HEIGHT) {
            return null;
        }
        console.log('GameGrid: get - Getting cell contents');
        console.table(this.grid);

        return this.grid[col][row];
    }

    /**
     * Sets the contents of a cell
     * @param col Column (0-7)
     * @param row Row (0-15)
     * @param content What to put in the cell
     * @returns True if successful, false if out of bounds
     */
    public set(col: number, row: number, content: GridCell): boolean {
        // Check bounds
        if (col < 0 || col >= GameConfig.FIELD_WIDTH ||
            row < 0 || row >= GameConfig.FIELD_HEIGHT) {
            return false;
        }

        this.grid[col][row] = content;
        
        // Update the entity's grid position if it's a pathogen
        if (content instanceof Pathogen) {
            content.updateGridPosition(col, row);
        }

        console.log(`GameGrid: set - cell (${col}, ${row}) updated with ${content}`);
        // console.table(this.grid);

        return true;
    }

    /**
     * Removes content from a cell
     * @param col Column (0-7)
     * @param row Row (0-15)
     * @returns The removed content, or null if cell was empty
     */
    public remove(col: number, row: number): GridCell {
        const content = this.get(col, row);
        this.set(col, row, null);

        console.log(`GameGrid: remove - cell (${col}, ${row}) set to null`);
        // console.table(this.grid);

        return content;
    }

    /**
     * Checks if a cell is occupied
     * @col Column (0-7)
     * @row Row (0-15)
     * @returns True if cell has content, false if empty or out of bounds
     */
    public isOccupied(col: number, row: number): boolean {
        const occupied = this.get(col, row) !== null;
        console.log(`GameGrid.isOccupied(${col}, ${row}) = ${occupied}`);
        return occupied;
    }

    /**
     * Checks if a cell is empty
     * @col Column (0-7)
     * @row Row (0-15)
     * @returns True if cell is empty or out of bounds, false if occupied
     */
    public isEmpty(col: number, row: number): boolean {
        const empty = this.get(col, row) === null;
        console.log(`GameGrid.isEmpty(${col}, ${row}) = ${empty}`);
        return empty;
    }

    /**
     * Counts how many pathogens are currently on the field
     * @returns Number of pathogens
     */
    public countPathogens(): number {
        let count = 0;
        for (let col = 0; col < GameConfig.FIELD_WIDTH; col++) {
            for (let row = 0; row < GameConfig.FIELD_HEIGHT; row++) {
                if (this.grid[col][row] instanceof Pathogen) {
                    count++;
                }
            }
        }
        return count;
    }

    /**
     * Gets all pathogens currently on the field
     * @returns Array of all pathogens
     */
    public getPathogens(): Pathogen[] {
        const pathogens: Pathogen[] = [];
        for (let col = 0; col < GameConfig.FIELD_WIDTH; col++) {
            for (let row = 0; row < GameConfig.FIELD_HEIGHT; row++) {
                const cell = this.grid[col][row];
                if (cell instanceof Pathogen) {
                    pathogens.push(cell);
                }
            }
        }
        return pathogens;
    }

    /**
     * Checks if the bottle neck area is clear (for game over detection)
     * @returns True if bottle neck is clear, false if occupied
     */
    public isBottleNeckClear(): boolean {
        // Check all cells above and including the bottle neck row
        for (let col = 0; col < GameConfig.FIELD_WIDTH; col++) {
            for (let row = 0; row < GameConfig.BOTTLE_NECK_ROW; row++) {
                if (this.isOccupied(col, row)) {
                    return false;
                }
            }
        }
        return true;
    }
}