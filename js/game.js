// Main Game Engine for Kolossus Kompanion
class KolossusGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Game state
        this.gameState = {
            survivors: 1,
            food: 100,
            water: 100,
            day: 1,
            companions: [],
            apocalypseLevel: 1,
            meteorThreat: 'Low',
            isRunning: true
        };
        
        // Game systems
        this.companionSystem = new CompanionSystem(this);
        this.survivalSystem = new SurvivalSystem(this);
        this.environmentSystem = new EnvironmentSystem(this);
        
        // Initialize
        this.setupEventListeners();
        this.gameLoop();
        this.updateUI();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.handleCanvasClick(x, y);
        });
    }
    
    handleCanvasClick(x, y) {
        // Check for companion encounters in the environment
        if (Math.random() < 0.1) { // 10% chance to find companion on click
            this.companionSystem.encounterWildCompanion(x, y);
        }
    }
    
    gameLoop() {
        if (!this.gameState.isRunning) return;
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Update all game systems
        this.environmentSystem.update();
        this.survivalSystem.update();
        this.companionSystem.update();
        
        // Check for day progression
        if (Date.now() % 60000 < 16) { // Roughly every minute = 1 day
            this.advanceDay();
        }
        
        this.updateUI();
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = 'linear-gradient(to bottom, #ff6b35, #2c1810)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw environment
        this.environmentSystem.render(this.ctx);
        
        // Draw companions
        this.companionSystem.render(this.ctx);
    }
    
    advanceDay() {
        this.gameState.day++;
        
        // Increase apocalypse intensity over time
        if (this.gameState.day % 5 === 0) {
            this.gameState.apocalypseLevel++;
            this.environmentSystem.increaseMeteorActivity();
        }
        
        // Daily resource consumption
        this.gameState.food = Math.max(0, this.gameState.food - 2);
        this.gameState.water = Math.max(0, this.gameState.water - 3);
        
        // Check survival conditions
        if (this.gameState.food <= 0 || this.gameState.water <= 0) {
            this.gameOver();
        }
    }
    
    updateUI() {
        document.getElementById('survivorCount').textContent = this.gameState.survivors;
        document.getElementById('foodCount').textContent = this.gameState.food;
        document.getElementById('waterCount').textContent = this.gameState.water;
        document.getElementById('companionCount').textContent = this.gameState.companions.length;
        document.getElementById('dayCount').textContent = this.gameState.day;
        document.getElementById('apocalypseLevel').textContent = this.getApocalypseLevelText();
        document.getElementById('meteorThreat').textContent = this.gameState.meteorThreat;
    }
    
    getApocalypseLevelText() {
        const levels = ['Rising', 'Moderate', 'High', 'Severe', 'Critical', 'Maximum'];
        return levels[Math.min(this.gameState.apocalypseLevel - 1, levels.length - 1)] || 'Maximum';
    }
    
    startHunting() {
        this.survivalSystem.hunt();
    }
    
    startFishing() {
        this.survivalSystem.fish();
    }
    
    searchCompanions() {
        this.companionSystem.searchForCompanions();
    }
    
    gameOver() {
        this.gameState.isRunning = false;
        alert(`Game Over! You survived ${this.gameState.day} days with ${this.gameState.companions.length} companions.`);
    }
}

// Start the game when page loads
let game;
window.addEventListener('load', () => {
    game = new KolossusGame();
});