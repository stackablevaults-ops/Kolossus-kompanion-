import { Game } from './core/Game.js';
import './ui/styles.css';

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.game) {
        window.game.handleResize();
    }
});

// Handle visibility change to pause/resume game
document.addEventListener('visibilitychange', () => {
    if (window.game) {
        if (document.hidden) {
            window.game.pause();
        } else {
            window.game.resume();
        }
    }
});