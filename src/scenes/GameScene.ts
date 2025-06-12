// src/scenes/GameScene.ts

import { Scene, Engine, Color, Actor, Rectangle, vec, Vector, Keys, KeyEvent, Text, Font } from 'excalibur';
import { GameConfig } from '../config/GameConfig';
import { GameGrid } from '../game/GameGrid';
import { Pathogen } from '../entities/Pathogen';
import { Capsule } from '../entities/Capsule';

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

    // Current falling capsule
    private currentCapsule: Capsule | null = null;

    // Input handling
    private keyHeldTime: Map<Keys, number> = new Map();
    private keyRepeatTime: Map<Keys, number> = new Map();

    // Falling mechanics
    private fallTimer: number = 0;
    private fallSpeed: number = GameConfig.SPEEDS.LOW;  // TODO: Should this be a function of level and speed?
    
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
        this.createSpeedDisplay(engine);    // Draw the speed display

        // Set up keyboard input handlers
        engine.input.keyboard.on('press', (evt: KeyEvent) => this.handleKeyPress(evt));
        engine.input.keyboard.on('release', (evt: KeyEvent) => this.handleKeyRelease(evt));
    }

    /**
     * Called when the scene becomes active (when we transition to it)
     * @param context Scene activation context with data from previous scene
     */
    public onActivate(context: any): void {
        // Get the level and speed from the main menu
        if (context?.sceneActivationData) {
            this.level = context.data.level || 0;
            this.speed = context.data.speed || 'LOW';
        }

        // Reset score
        // this.score = 0;

        // Set fall speed based on selected speed
        this.fallSpeed = GameConfig.SPEEDS[this.speed];
        this.fallTimer = 0;

        // Initialize the game with selected settings
        console.log(`Game started! Level: ${this.level}, Speed: ${this.speed}`);
        console.log(`Need to clear ${GameConfig.PATHOGENS_PER_LEVEL(this.level)} pathogens`);

        this.clearField();  // Clear any existing pathogens
        this.generatePathogens();   // Generate random pathogens for this level
        this.spawnNewCapsule(); // Spawn the first capsule
    }

    /**
     * Called every frame before update
     * @param engine The game engine instance
     * @param delta Time elapsed since last frame in milliseconds
     */
    public onPreUpdate(_engine: Engine, delta: number): void {
        // Handle held keys for continuous movement
        this.handleHeldKeys(delta);

        // Handle automatic falling
        this.handleAutomaticFalling(delta);
    }

    /**
     * Makes the current capsule fall automatically based on speed setting
     */
    private handleAutomaticFalling(delta: number): void {
        if (!this.currentCapsule || !this.currentCapsule.isFalling) return;

        // Update fall timer
        this.fallTimer += delta;

        // Check if it's time to fall
        if (this.fallTimer >= this.fallSpeed) {
            this.fallTimer = 0;     // Reset timer
            this.moveCapsuleDown(); // Try to move down
        }
    }
    

    /**
     * Handles initial key press
     * @param evt Keyboard event
     */
    private handleKeyPress(evt: KeyEvent): void {
        if (!this.currentCapsule || !this.currentCapsule.isFalling) return;

        switch (evt.key) {
            case Keys.Left:
            case Keys.ArrowLeft:
                this.moveCapsuleLeft();
                this.keyHeldTime.set(evt.key, 0);
                this.keyRepeatTime.set(evt.key, 0);
                break;
            
            case Keys.Right:
            case Keys.ArrowRight:
                this.moveCapsuleRight();
                this.keyHeldTime.set(evt.key, 0);
                this.keyRepeatTime.set(evt.key, 0);
                break;
            
            case Keys.Down:
            case Keys.ArrowDown:
                this.moveCapsuleDown();
                this.keyHeldTime.set(evt.key, 0);
                this.keyRepeatTime.set(evt.key, 0);
                break;
            
            case Keys.Up:
            case Keys.ArrowUp:
            case Keys.Space:
                this.rotateCapsule();
                break;
        }
    }

    /**
     * Handles key release
     * @param evt Keyboard event
     */
    private handleKeyRelease(evt: KeyEvent): void {
        this.keyHeldTime.delete(evt.key);
        this.keyRepeatTime.delete(evt.key);
    }

    /**
     * Handles continuous movement for held keys
     * @param delta Time since last frame
     */
    private handleHeldKeys(delta: number): void {
        if (!this.currentCapsule || !this.currentCapsule.isFalling) return;

        // Check each held key
        for (const [key, heldTime] of this.keyHeldTime) {
            // Update held time
            this.keyHeldTime.set(key, heldTime + delta);

            const newHeldTime = this.keyHeldTime.get(key) || 0;
            const repeatTime = this.keyRepeatTime.get(key) || 0;

            // Check if we should repeat the action
            if (newHeldTime >= GameConfig.INPUT_REPEAT_DELAY) {
                if (repeatTime >= GameConfig.INPUT_REPEAT_RATE) {
                    // Reset repeat timer and perform action
                    this.keyRepeatTime.set(key, 0);

                    switch (key) {
                        case Keys.Left:
                        case Keys.ArrowLeft:
                            this.moveCapsuleLeft();
                            break;
                        
                        case Keys.Right:
                        case Keys.ArrowRight:
                            this.moveCapsuleRight();
                            break;
                        
                        case Keys.Down:
                        case Keys.ArrowDown:
                            this.moveCapsuleDown(true); // Pass true for soft drop
                            break;
                    }
                } else {
                    // Update repeat timer
                    this.keyRepeatTime.set(key, repeatTime + delta);
                }
            }
            
        }
    }

    /**
     * Moves the current capsule left if possible
     */
    private moveCapsuleLeft(): void {
        if (!this.currentCapsule) return;

        if (this.currentCapsule.moveLeft()) {
            // Update visual positions
            this.updateCapsuleVisualPosition();
        }
    }

    /**
     * Moves the current capsule right if possible
     */
    private moveCapsuleRight(): void {
        if (!this.currentCapsule) return;

        if (this.currentCapsule.moveRight()) {
            // Update visual positions
            this.updateCapsuleVisualPosition();
        }
    }

    /**
     * Moves the current capsule down if possible
     * @param isSoftDrop Whether this is a soft drop (player holding down)
     */
    private moveCapsuleDown(isSoftDrop: boolean = false): void {
        if (!this.currentCapsule) return;

        if (this.currentCapsule.moveDown()) {
            // Update visual positions
            this.updateCapsuleVisualPosition();

            // If this is a soft drop, reset the fall timer
            // This prevents the capsule from getting an extra automatic drop
            if (isSoftDrop) {
                this.fallTimer = 0;
            }
        } else {
            // Can't move down - capsule has landed
            this.landCapsule();
        }
    }

    /**
     * Rotates the current capsule if possible
     */
    private rotateCapsule(): void {
        if (!this.currentCapsule) return;

        if (this.currentCapsule.rotate()) {
            // Update visual positions
            this.updateCapsuleVisualPosition();
        }
    }

    /**
     * Updates the visual position of the capsule halves
     */
    private updateCapsuleVisualPosition(): void {
        if (!this.currentCapsule) return;

        this.currentCapsule.half1.pos = this.gridToScreen(
            this.currentCapsule.half1.gridCol,
            this.currentCapsule.half1.gridRow            
        );
        this.currentCapsule.half2.pos = this.gridToScreen(
            this.currentCapsule.half2.gridCol,
            this.currentCapsule.half2.gridRow
        );
    }

    /**
     * Handles when a capsule lands and can't fall anymore
     */
    private landCapsule(): void {
        if (!this.currentCapsule) return;

        console.log('Capsule landed!');

        // Mark as not falling
        this.currentCapsule.isFalling = false;

        // Add both halves to the grid
        this.grid.set(
            this.currentCapsule.half1.gridCol,
            this.currentCapsule.half1.gridRow,
            this.currentCapsule.half1
        );
        this.grid.set(
            this.currentCapsule.half2.gridCol,
            this.currentCapsule.half2.gridRow,
            this.currentCapsule.half2
        );

        // TODO: Check for matches
        // TODO: Apply gravity

        // Clear current capsule reference
        this.currentCapsule = null;

        // TODO: Check for game over

        // Spawn a new capsule
        this.spawnNewCapsule();
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
     * Creates a display showing the current game speed
     * @param engine The game engine instance
     */
    private createSpeedDisplay(engine: Engine): void {
        // Create speed label
        const speedLabel = new Text({
            text: `Speed: ${this.speed}`,
            font: new Font({
                size: 16,
                color: Color.fromHex(GameConfig.COLORS.PEAR),
                family: 'Arial'
            })
        });

        // Position it in the top right corner
        const speedActor = new Actor({
            pos: vec(engine.drawWidth - 60, 30),
            name: 'speed-display'
        });
        speedActor.graphics.use(speedLabel);
        this.add(speedActor);

        // Create level label
        const levelLabel = new Text({
            text: `Level: ${this.level}`,
            font: new Font({
                size: 16,
                color: Color.fromHex(GameConfig.COLORS.SKY_BLUE),
                family: 'Arial'
            })
        });

        // Position it below speed
        const levelActor = new Actor({
            pos: vec(engine.drawWidth - 60, 50),
            name: 'level-display'
        })
        levelActor.graphics.use(levelLabel);
        this.add(levelActor);
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

    /**
     * Spawns a new capsule at the top of the field
     */
    private spawnNewCapsule(): void {
        // Random colors for both halves
        const color1 = Math.floor(Math.random() * 3);
        const color2 = Math.floor(Math.random() * 3);        
        
        // Create new capsule
        this.currentCapsule = new Capsule(color1, color2, 'horizontal');

        // Start at the top center of the field
        const startCol = Math.floor(GameConfig.FIELD_WIDTH / 2) - 1;
        const startRow = 0;

        // Set position
        this.currentCapsule.setGridPosition(startCol, startRow);

        // Update visual positions
        this.currentCapsule.half1.pos = this.gridToScreen(
            this.currentCapsule.half1.gridCol,
            this.currentCapsule.half1.gridRow
        );
        this.currentCapsule.half2.pos = this.gridToScreen(
            this.currentCapsule.half2.gridCol,
            this.currentCapsule.half2.gridRow
        );

        // Add to scene
        this.add(this.currentCapsule);

        // Don't add to grid yet - it's falling
        console.log(`Spawned new capsule with colors ${color1} and ${color2}`);
    }
}