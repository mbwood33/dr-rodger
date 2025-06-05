import { defineConfig } from 'vite';

// Vite configuration for Dr. Rodger game
export default defineConfig({
    // Use the current directory as root
    root: '.',
    
    // Build output directory
    build: {
        outDir: 'dist',
        // Generate source maps for debugging
        sourcemap: true
    },
    
    // Development server settings
    server: {
        port: 3000,
        open: true  // Automatically open browser
    },
    
    // For Netlify deployment
    base: '/'
});