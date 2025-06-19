// src/scenes/MainMenuScene.ts

import { Scene, Engine, Color, Text, Font, vec, Actor, Rectangle } from 'excalibur';
import { GameConfig } from '../config/GameConfig';

/**
 * The main menu where players select level and speed before starting
 */
export class MainMenuScene extends Scene {
    // Currently selected options
    private selectedLevel: number = 0;
    private selectedSpeed: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

    // UI elements that we'll update
    private levelText!: Text;
    private speedText!: Text;

    /**
     * Called once when the game is first initialized
     * @param engine The game engine instance
     */
    public onInitialize(engine: Engine): void {
        this.createTitle(engine);           // Create the title text
        this.createLevelSelector(engine);   // Create the level selector
        this.createSpeedSelector(engine);   // Create the speed selector
        this.createStartButton(engine);     // Create the start button
        this.createInstructions(engine);    // Create instructions
    }

    /**
     * Creates the game title display
     * @param engine The game engine instance
     */
    private createTitle(engine: Engine): void {
        // Main title
        const title = new Text({
            text: 'DR. RODGER',
            font: new Font({
                size: 36,
                color: Color.fromHex(GameConfig.COLORS.HOT_PINK),
                family: 'Arial',
                bold: true
            })
        });

        // Create an actor to hold the text
        const titleActor = new Actor({
            pos: vec(engine.halfDrawWidth, 60)
        });
        titleActor.graphics.use(title);
        this.add(titleActor);

        // Subtitle
        const subtitle = new Text({
            text: 'Idk what to put here',
            font: new Font({
                size: 16,
                color: Color.fromHex(GameConfig.COLORS.SKY_BLUE),
                family: 'Arial',
            })
        });

        const subtitleActor = new Actor({
            pos: vec(engine.halfDrawWidth, 90)
        });
        subtitleActor.graphics.use(subtitle);
        this.add(subtitleActor);
    }

    /**
     * Creates the level selection UI
     * @param engine The game engine instance
     */
    private createLevelSelector(engine: Engine): void {
        // Level label
        const levelLabel = new Text({
            text: 'LEVEL:',
            font: new Font({
                size: 20,
                color: Color.White,
                family: 'Arial'
            })
        });

        const levelLabelActor = new Actor({
            pos: vec(engine.halfDrawWidth - 60, 200)
        });
        levelLabelActor.graphics.use(levelLabel);
        this.add(levelLabelActor);

        // Level value (this will be updated)
        this.levelText = new Text({
            text: this.selectedLevel.toString(),
            font: new Font({
                size: 20,
                color: Color.fromHex(GameConfig.COLORS.PEAR),
                family: 'Arial',
                bold: true
            })
        });

        const levelValueActor = new Actor({
            pos: vec(engine.halfDrawWidth + 10, 200)
        });
        levelValueActor.graphics.use(this.levelText);
        this.add(levelValueActor);

        // Left arrow button
        this.createButton(
            engine,
            '<',
            engine.halfDrawWidth - 120,
            200,
            () => this.changeLevel(-1)
        );

        // Right arrow button
        this.createButton(
            engine,
            '>',
            engine.halfDrawWidth + 80,
            200,
            () => this.changeLevel(1)
        );
    }

    /**
     * Creates the speed selection UI
     * @param engine The game engine instance
     */
    private createSpeedSelector(engine: Engine): void {
        // Speed label
        const speedLabel = new Text({
            text: 'SPEED:',
            font: new Font({
                size: 20,
                color: Color.White,
                family: 'Arial'
            })
        });

        const speedLabelActor = new Actor({
            pos: vec(engine.halfDrawWidth - 60, 260)
        });
        speedLabelActor.graphics.use(speedLabel);
        this.add(speedLabelActor);

        // Speed value
        this.speedText = new Text({
            text: this.selectedSpeed,
            font: new Font({
                size: 20,
                color: Color.fromHex(GameConfig.COLORS.PEAR),
                family: 'Arial',
                bold: true
            })
        });

        const speedValueActor = new Actor({
            pos: vec(engine.halfDrawWidth + 20, 260)
        });
        speedValueActor.graphics.use(this.speedText);
        this.add(speedValueActor);

        // Speed buttons
        this.createButton(
            engine,
            '<',
            engine.halfDrawWidth - 120,
            260,
            () => this.changeSpeed(-1)
        );

        this.createButton(
            engine,
            '>',
            engine.halfDrawWidth + 120,
            260,
            () => this.changeSpeed(1)
        );
    }

    /**
     * Creates the start button
     * @param engine The game engine instance
     */
    private createStartButton(engine: Engine): void {
        // Create a Larger button for starting the game
        const buttonBg = new Rectangle({
            width: 120,
            height: 40,
            color: Color.fromHex(GameConfig.COLORS.HOT_PINK)
        });

        const startButton = new Actor({
            pos: vec(engine.halfDrawWidth, 340),
            width: 120,
            height: 40
        });
        startButton.graphics.use(buttonBg);

        // Enable pointer events
        startButton.pointer.useGraphicsBounds = true;
        startButton.pointer.useColliderShape = true;

        // Make it clickable
        startButton.on('pointerup', () => {
            this.startGame(engine);
        });

        this.add(startButton);

        // Add text to the button (as a separate actor on top)
        const buttonText = new Text({
            text: 'START',
            font: new Font({
                size: 24,
                color: Color.White,
                family: 'Arial',
                bold: true
            })
        });

        const textActor = new Actor({
            pos: vec(engine.halfDrawWidth, 340),
            z: 1    // Ensure text is on top
        });
        textActor.graphics.use(buttonText);
        this.add(textActor);
    }

    /**
     * Creates the instruction text
     * @param engine The game engine instance
     */
    private createInstructions(engine: Engine): void {
        const instructions = [
            'Clear all pathogens to win!',
            'Match 4 colors in a row',
            '← → to move, ↑ to rotate'
        ];

        instructions.forEach((text, index) => {
            const instruction = new Text({
                text: text,
                font: new Font({
                    size: 14,
                    color: Color.Gray,
                    family: 'Arial'
                })
            });

            const actor = new Actor({
                pos: vec(engine.halfDrawWidth, 420 + (index * 25))
            });
            actor.graphics.use(instruction);
            this.add(actor);
        });
    }

    /**
     * Helper method to create clickable buttons
     * @param engine The game engine instance
     * @param text Button text
     * @param x x position
     * @param y y position
     * @param onClick Click handler function
     */
    private createButton(_engine: Engine, text: string, x: number, y: number, onClick: () => void): void {
        // Button background
        const buttonBg = new Rectangle({
            width: 30,
            height: 30,
            color: Color.fromHex(GameConfig.COLORS.SKY_BLUE)
        });

        const button = new Actor({
            pos: vec(x, y),
            width: 30,
            height: 30
        });
        button.graphics.use(buttonBg);

        // Enable pointer events
        button.pointer.useGraphicsBounds = true;

        // Make it clickable
        button.on('pointerup', onClick);

        this.add(button);

        // Button text (add after button so it's on top)
        const buttonText = new Text({
            text: text,
            font: new Font({
                size: 20,
                color: Color.White,
                family: 'Arial',
                bold: true
            })
        });

        const textActor = new Actor({
            pos: vec(x, y),
            z: 1    // Ensure text is on top
        });
        textActor.graphics.use(buttonText);
        
        this.add(textActor);
    }

    /**
     * Changes the selected level
     * @param delta Amount to change by (-1 or 1)
     */
    private changeLevel(delta: number): void {
        // Update the level, keeping it within bounds
        this.selectedLevel = Math.max(
            GameConfig.MIN_LEVEL,
            Math.min(GameConfig.MAX_LEVEL, this.selectedLevel + delta)
        );

        // Update the display
        this.levelText.text = this.selectedLevel.toString();
    }

    /**
     * Changes the selected speed
     * @param delta Direction to change (-1 or 1)
     */
    private changeSpeed(delta: number): void {
        // Speed options in order
        const speeds: Array<'LOW' | 'MEDIUM' | 'HIGH'> = ['LOW', 'MEDIUM', 'HIGH'];
        const currentIndex = speeds.indexOf(this.selectedSpeed);

        // Calculated new index with wrapping
        let newIndex = currentIndex + delta;
        if (newIndex < 0) newIndex = speeds.length - 1;
        if (newIndex >= speeds.length) newIndex = 0;

        // Update speed
        this.selectedSpeed = speeds[newIndex];
        this.speedText.text = this.selectedSpeed;
    }

    /**
     * Starts the game with selected settings
     * @param engine The game engine instance
     */
    private startGame(engine: Engine): void {
        // Store the selected options (we'll pass these to the game scene later)
        console.log(`Starting game - Level: ${this.selectedLevel}, Speed: ${this.selectedSpeed}`);

        // Go to the game scene
        engine.goToScene('game', {
            sceneActivationData: {
                level: this.selectedLevel,
                speed: this.selectedSpeed
            }
        });
    }
}