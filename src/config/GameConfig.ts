// src/config/GameConfig.ts

/**
 * @class GameConfig
 * @description Central configuration for Dr. Rodger game constants and settings
 */
export class GameConfig {
    // Game dimensions - based on classic Dr. Mario proportions
    // The playing field is taller than it is wide, like a medicine bottle
    public static readonly GAME_WIDTH = 480;    // Width in pixels
    public static readonly GAME_HEIGHT = 640;   // Height in pixels

    // Playing field dimensions in tiles
    // Classic Dr. Mario uses an 8x16 grid (width x height)
    public static readonly FIELD_WIDTH = 8;     // Number of columns
    public static readonly FIELD_HEIGHT = 16;   // Number of rows

    // Size of each tile/block in pixels
    // This determines how big each pathogen and capsule piece appears
    public static readonly TILE_SIZE = 24;

    // The "neck" of the bottle starts at row 3 (0-indexed)
    // If capsules reach this height, it's game over
    public static readonly BOTTLE_NECK_ROW = 3;

    // Pathogen colors - using the specified color palette
    public static readonly COLORS = {
        HOT_PINK: '#FF00AA',
        SKY_BLUE: '#24E0FF',
        PEAR: '#E2E603',
        BACKGROUND: '#1a1a2e',
        BORDER: '#FF00AA'
    }

    // Color indices for easier array access
    public static readonly COLOR_INDEX = {
        PINK: 0,
        BLUE: 1,
        YELLOW: 2
    }

    // Array of color values for easy iteration
    public static readonly COLOR_VALUES = [
        GameConfig.COLORS.HOT_PINK,
        GameConfig.COLORS.SKY_BLUE,
        GameConfig.COLORS.PEAR
    ];

    // Game speed settings (milliseconds between drops)
    // These determine how fast capsules fall
    public static readonly SPEEDS = {
        LOW: 1000,      // 1 second between drops
        MEDIUM: 500,    // 0.5 seconds between drops
        HIGH: 250       // 0.25 seconds between drops
    };

    // Scoring system
    public static readonly SCORING = {
        SINGLE_PATHOGEN: 100,   // Points for clearing one pathogen
        COMBO_MULTIPLIER: 2,    // Multiplier for clearing multiple at once
        SPEED_BONUS: {
            LOW: 1,         // No bonus for low speed
            MEDIUM: 1.5,    // 50% bonus for medium speed
            HIGH: 2         // 100% bonus for high speed
        }
    };

    // Level configuration
    public static readonly MIN_LEVEL = 0;
    public static readonly MAX_LEVEL = 20;

    // Number of pathogens per level
    // Formula: 4 + (Level * 2) pathogens
    // So level 0 = 4 pathogens, level 20 = 44 pathogens
    public static readonly PATHOGENS_PER_LEVEL = (level: number): number => {
        return 4 + (level * 2);
    }

    // Input repeat delays (for holding down movement keys)
    public static readonly INPUT_REPEAT_DELAY = 200;    // Initial delay in ms
    public static readonly INPUT_REPEAT_RATE = 50;      // Repeat rate in ms
}