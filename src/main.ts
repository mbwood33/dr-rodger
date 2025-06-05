// src/main.ts

// Import Excalibur game engine and configurations
import { Engine, DisplayMode, Color } from 'excalibur';
import { GameConfig } from './config/GameConfig';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameScene } from './scenes/GameScene';

/**
 * Creates and configures the main Excalibur game engine instance
 * @returns {game} The configured Excalibur Engine instance
 */
function createGame(): Engine {
    // Get the canvas element
    const canvas = document.getElementById('game') as HTMLCanvasElement;
    if (!canvas) {
        throw new Error('Canvas element with id "game" not found');
    }
    
    // Create the main game engine with our configuration
    const game = new Engine({
        width: GameConfig.GAME_WIDTH,           // Set the game dimensions from our config
        height: GameConfig.GAME_HEIGHT,         // ...
        displayMode: DisplayMode.FitScreen,     // To scale the game to fit the container, which maintains aspect ratio and centers the game
        backgroundColor: Color.fromHex(GameConfig.COLORS.BACKGROUND),   // Set the background color to our dark theme
        antialiasing: false,                    // Disable anti-aliasing for crisp pixel art
        canvasElement: canvas,                // Attach the game canvas to our HTML container
        suppressPlayButton: true                // Disable the default Excalibur loader (we'll make our own later)
    });

    return game;
}

/**
 * Creates and adds all game scenes to the engine
 * @param game The Excalibur engine instance
 */
function setupScenes(game: Engine): void {
    // Create the main menu scene where players select level and speed
    const mainMenu = new MainMenuScene();
    game.addScene('mainMenu', mainMenu);

    // Create the main game scene where gameplay happens
    const gameScene = new GameScene();
    game.addScene('game', gameScene);

    // Notes: We'll add more scenes later (game over, pause, etc.)
}

/**
 * Main entry point for the game - initializes and starts everything
 */
async function main(): Promise<void> {
    const game = createGame();                  // Create the game engine
    setupScenes(game);                          // Set up all the game scenes
    await game.start();                         // Start the game engine
    game.goToScene('mainMenu');                 // Go to the main menu scene
    console.log('Dr. Rodger game started! 🏳️‍🌈'); // Log to console that the game has started successfully
}

// Start the game when the page loads
// The 'DOMContentLoaded' event ensures the HTML is fully loaded first
document.addEventListener('DOMContentLoaded', () => {
    main().catch(error => {
        console.error('Failed to start game:', error);
    });
});