// src/scenes/MainMenuScene.ts

import { Scene, Engine, Color, Text, Font, vec, Actor, Rectangle } from 'excalibur';
import { GameConfig } from '../config/GameConfig';
import { Resources} from '../resources/Resources';

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
        this.createSpriteButton(
            engine,
            'left',
            engine.halfDrawWidth - 120,
            200,
            () => this.changeLevel(-1)
        );

        // Right arrow button
        this.createSpriteButton(
            engine,
            'right',
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
        this.createSpriteButton(
            engine,
            'left',
            engine.halfDrawWidth - 120,
            260,
            () => this.changeSpeed(-1)
        );

        this.createSpriteButton(
            engine,
            'right',
            engine.halfDrawWidth + 120,
            260,
            () => this.changeSpeed(1)
        );
    }

    /**
     * Creates the start button using three sprites to form a larger button
     * @param engine The game engine instance
     */
    private createStartButton(engine: Engine): void {
        const buttonY = 340;
        const buttonSpacing = 32;   // Since each sprite is 32x32, no gap between them

        // Left part of start button
        this.createSpriteButton(
            engine,
            'start-left',
            engine.halfDrawWidth - buttonSpacing,
            buttonY,
            () => this.startGame(engine)
        );

        // Middle part of start button
        this.createSpriteButton(
            engine,
            'start-middle',
            engine.halfDrawWidth,
            buttonY,
            () => this.startGame(engine)
        );

        // Right part of start button
        this.createSpriteButton(
            engine,
            'start-right',
            engine.halfDrawWidth + buttonSpacing,
            buttonY,
            () => this.startGame(engine)
        );
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
     * Helper method to create clickable sprite buttons
     * @param engine The game engine instance
     * @param buttonType Type of button sprite to use
     * @param x x position
     * @param y y position
     * @param onClick Click handler function
     */
    private createSpriteButton(
        _engine: Engine,
        buttonType: 'left' | 'right' | 'start-left' | 'start-middle' | 'start-right',
        x: number,
        y: number,
        onClick: () => void
    ): void {
        // Get the sprite for this button type
        const sprite = Resources.getButtonSprite(buttonType);
        
        const button = new Actor({
            pos: vec(x, y),
            width: 32,
            height: 32,
            name: `sprite-button-${buttonType}-${x}-${y}`   // Add unique names for debugging
        });

        // Use the sprite if available, otherwise fall back to colored rectangles
        if (sprite) {
            button.graphics.use(sprite);
        } else {
            console.warn(`Could not load sprite for button type: ${buttonType}, using fallback`);
            // Fallback to colored rectangle
            const fallbackColor = buttonType.startsWith('start')
                ? Color.fromHex(GameConfig.COLORS.HOT_PINK)
                : Color.fromHex(GameConfig.COLORS.SKY_BLUE);
            
            const buttonBg = new Rectangle({
                width: 32,
                height: 32,
                color: fallbackColor
            });
            button.graphics.use(buttonBg);

            // Add text for fallback buttons
            const fallbackText = buttonType === 'left' ? '<' :
                                buttonType === 'right' ? '>' :
                                'S';    // For start button parts
            
            const buttonText = new Text({
                text: fallbackText,
                font: new Font({
                    size: 16,
                    color: Color.White,
                    family: 'Arial',
                    bold: true
                })
            });

            const textActor = new Actor({
                pos: vec(x, y),
                z: 1
            });
            textActor.graphics.use(buttonText);
            this.add(textActor);
        }

        // Enable pointer events
        button.pointer.useGraphicsBounds = true;

        // Make it clickable
        button.on('pointerup', () => {
            console.log(`Sprite button ${buttonType} clicked!`);    // Debug log
            onClick();
        });

        this.add(button);
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