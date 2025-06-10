// src/scenes/GameScene.ts

import { Scene, Engine, Color, Actor, Rectangle, vec, Vector } from 'excalibur';
import { GameConfig } from '../config/GameConfig';
import { GameGrid } from '../game/GameGrid';
import { Pathogen } from '../entities/Pathogen';

/**
 * The main gameplay scene
 */
export class GameScene extends Scene {
    // Game state
    private level: number = 0;
    private speed: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    // Score will be used when we implement scoring system
    // private score: number = 0;

    // Playing field boundaries
    private fieldX: number = 0;
    private fieldY: number = 0;

    // Game grid to track what's in each cell
    private grid: GameGrid = new GameGrid();
    
    /**
     * Called once when the scene is first initialized
     * @param engine The game engine instance
     */
    public onInitialize(engine: Engine): void {
        // Calculate the playing field position (centered)
        this.fieldX = (engine.drawWidth - (GameConfig.FIELD_WIDTH * GameConfig.TILE_SIZE)) / 2;
        this.fieldY = (engine.drawHeight - (GameConfig.FIELD_HEIGHT * GameConfig.TILE_SIZE)) / 2;

        this.createPlayingField(engine);    // Draw the playing field background        
        this.createBottleNeck(engine);      // Draw the bottle neck indicator
    }

    /**
     * Called when the scene becomes active (when we transition to it)
     * @param context Scene activation context with data from previous scene
     */
    public onActivate(context: any): void {
        // Get the level and speed from the main menu
        if (context.data) {
            this.level = context.data.level || 0;
            this.speed = context.data.speed || 'LOW';
        }

        // Reset score
        // this.score = 0;

        // Initialize the game with selected settings
        console.log(`Game started! Level: ${this.level}, Speed: ${this.speed}`);
        console.log(`Need to clear ${GameConfig.PATHOGENS_PER_LEVEL(this.level)} pathogens`);

        this.clearField();  // Clear any existing pathogens
        this.generatePathogens();   // Generate random pathogens for this level
    }

    /**
     * Creates the visual representation of the playing field/bottle
     * @param engine The game engine instance
     */
    private createPlayingField(engine: Engine): void {
        // Create the main playing field background
        const fieldWidth = GameConfig.FIELD_WIDTH * GameConfig.TILE_SIZE;
        const fieldHeight = GameConfig.FIELD_HEIGHT * GameConfig.TILE_SIZE;
        
        // Dark background for the playing field
        const fieldBg = new Rectangle({
            width: fieldWidth,
            height: fieldHeight,
            color: Color.fromRGB(20, 20, 40)    // Slightly ligher than main background
        });

        const field = new Actor({
            pos: vec(engine.halfDrawWidth, engine.halfDrawHeight),
            width: fieldWidth,
            height: fieldHeight
        });
        field.graphics.use(fieldBg);
        this.add(field);

        // Add a border around the field
        this.createFieldBorder(engine, fieldWidth, fieldHeight);

        // Add grid lines for debugging (we can remove these later)
        this.createGridLines(engine);
    }

    /**
     * Creates a decorative border around the playing field
     * @param engine The game engine instance
     * @param fieldWidth Width of the playing field
     * @param fieldHeight Height of the playing field
     */
    private createFieldBorder(engine: Engine, fieldWidth: number, fieldHeight: number): void {
        const borderThickness = 3;
        const borderColor = Color.fromHex(GameConfig.COLORS.BORDER);

        // Top bordder
        const topBorder = new Actor({
            pos: vec(engine.halfDrawWidth, this.fieldY - borderThickness/2),
            width: fieldWidth + borderThickness * 2,
            height: borderThickness
        });
        topBorder.graphics.use(new Rectangle({
            width: fieldWidth + borderThickness * 2,
            height: borderThickness,
            color: borderColor
        }));
        this.add(topBorder);

        // Bottom border
        const bottomBorder = new Actor({
            pos: vec(engine.halfDrawWidth, this.fieldY + fieldHeight + borderThickness/2),
            width: fieldWidth + borderThickness * 2,
            height: borderThickness
        });
        bottomBorder.graphics.use(new Rectangle({
            width: fieldWidth + borderThickness * 2,
            height: borderThickness,
            color: borderColor
        }));
        this.add(bottomBorder);

        // Left border
        const leftBorder = new Actor({
            pos: vec(this.fieldX - borderThickness/2, engine.halfDrawHeight),
            width: borderThickness,
            height: fieldHeight + borderThickness * 2
        });
        leftBorder.graphics.use(new Rectangle({
            width: borderThickness,
            height: fieldHeight,
            color: borderColor
        }));
        this.add(leftBorder);

        // Right border
        const rightBorder = new Actor({
            pos: vec(this.fieldX + fieldWidth + borderThickness/2, engine.halfDrawHeight),
            width: borderThickness,
            height: fieldHeight
        });
        rightBorder.graphics.use(new Rectangle({
            width: borderThickness,
            height: fieldHeight,
            color: borderColor
        }));
        this.add(rightBorder);
    }

    /**
     * Removes all entities from the playing field
     */
    private clearField(): void {
        // Get all pathogens from the grid
        const pathogens = this.grid.getPathogens();

        // Remove each pathogen from the scene
        pathogens.forEach(pathogen => {
            this.remove(pathogen);
            pathogen.kill();
        });

        // Clear the grid
        this.grid.clear();
    }

    /**
     * Generates random pathogens for the current level
     */
    private generatePathogens(): void {
        const pathogenCount = GameConfig.PATHOGENS_PER_LEVEL(this.level);
        
        // Keep track of occupied positions to avoid overlaps
        const occupiedPositions = new Set<string>();

        let placed = 0;
        let attemps = 0;
        const maxAttempts = 1000;   // Prevent infinite loop

        while (placed < pathogenCount && attemps < maxAttempts) {
            attemps++;

            // Random position in the lower 2/3 of the field
            // We don't want pathogens too high at the start
            const col = Math.floor(Math.random() * GameConfig.FIELD_WIDTH);
            const row = Math.floor(Math.random() * 10) + 6; // Rows 6-15
            // TODO: Implement mechanic where the pathogens grow higher as the level increases

            // Check if position is already occupied
            const posKey = `${col},${row}`;
            if (occupiedPositions.has(posKey)) {
                continue;
            }

            // Random color
            const colorIndex = Math.floor(Math.random() * 3);

            // Create the pathogen
            const pathogen = new Pathogen(colorIndex, col, row);

            // Position it on screen
            pathogen.pos = this.gridToScreen(col, row);

            // Add to grid and scene
            this.grid.set(col, row, pathogen);
            this.add(pathogen);

            // Mark position as occupied
            occupiedPositions.add(posKey);
            placed++;
        }

        console.log(`Placed ${placed} pathogens on the field`);
    }

    /**
     * Creates a visual indicator for the bottle neck (game over line)
     * @param engine The game engine instance
     */
    private createBottleNeck(_engine: Engine): void {
        // Calculate Y position of the bottle neck
        const neckY = this.fieldY + (GameConfig.BOTTLE_NECK_ROW * GameConfig.TILE_SIZE);

        // Create a subtle line to show the danger zone
        // Make it a dashed line effect by creating multiple small segments
        const dashWidth = 10;
        const gapWidth = 5;
        const totalWidth = GameConfig.FIELD_WIDTH * GameConfig.TILE_SIZE;

        for (let x = 0; x < totalWidth; x += dashWidth + gapWidth) {
            const dash = new Rectangle({
                width: dashWidth,
                height: 1,
                color: Color.fromHex(GameConfig.COLORS.HOT_PINK).darken(0.5)
            });

            const dashActor = new Actor({
                pos: vec(this.fieldX + x + dashWidth/2, neckY),
                width: dashWidth,
                height: 1
            });
            dashActor.graphics.use(dash);
            this.add(dashActor);
        }
    }

    /**
     * Creates grid lines for debugging - shows tile boundaries
     * @param engine The game engine instance
     */
    private createGridLines(engine: Engine): void {
        const gridColor = Color.Gray.darken(0.7);   // Very subtle grid

        // Vertical lines
        for (let col = 1; col < GameConfig.FIELD_WIDTH; col++) {
            const x = this.fieldX + (col * GameConfig.TILE_SIZE);
            const line = new Actor({
                pos: vec(x, engine.halfDrawHeight),
                width: 1,
                height: GameConfig.FIELD_HEIGHT * GameConfig.TILE_SIZE
            });
            line.graphics.use(new Rectangle({
                width: 1,
                height: GameConfig.FIELD_HEIGHT * GameConfig.TILE_SIZE,
                color: gridColor
            }));
            this.add(line);
        }

        // Horizontal lines
        for (let row = 1; row < GameConfig.FIELD_HEIGHT; row++) {
            const y = this.fieldY + (row * GameConfig.TILE_SIZE);
            const line = new Actor({
                pos: vec(engine.halfDrawWidth, y),
                width: GameConfig.FIELD_WIDTH * GameConfig.TILE_SIZE,
                height: 1
            });
            line.graphics.use(new Rectangle({
                width: GameConfig.FIELD_WIDTH * GameConfig.TILE_SIZE,
                height: 1,
                color: gridColor
            }));
            this.add(line);
        }
    }

    /**
     * Converts grid coordinates to screen coordinates
     * @param col Column in the grid (0-7)
     * @param row Row in the grid (0-15)
     * @returns {Vector} Screen coordinates as a vector
     */
    public gridToScreen(col: number, row: number): Vector {
        // Calculate the center position of a tile at the given grid coordinates
        const x = this.fieldX + (col * GameConfig.TILE_SIZE) + (GameConfig.TILE_SIZE / 2);
        const y = this.fieldY + (row * GameConfig.TILE_SIZE) + (GameConfig.TILE_SIZE / 2);
        return vec(x, y);
    }
    
    /**
     * Converts screen coordinates to grid coordinates
     * @param x Screen X position
     * @param y Screen Y position
     * @returns Grid coordinates as {col, row} or null if outside grid
     */
    public screenToGrid(x: number, y: number): {col: number, row: number} | null {
        // Calculate which grid cell contains the given screen positions
        const col = Math.floor((x - this.fieldX) / GameConfig.TILE_SIZE);
        const row = Math.floor((y - this.fieldY) / GameConfig.TILE_SIZE);
        
        // Check if the position is within the grid bounds
        if (col >= 0 && col < GameConfig.FIELD_WIDTH && row >= 0 && row < GameConfig.FIELD_HEIGHT) {
            return {col, row};
        }

        return null;    // Outside the grid
    }
}