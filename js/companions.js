// Companion System - Handles all companion animals
class CompanionSystem {
    constructor(game) {
        this.game = game;
        this.companionTypes = this.initializeCompanionTypes();
        this.activeCompanions = [];
    }
    
    initializeCompanionTypes() {
        return [
            // Mammals
            { id: 1, name: 'Wolf', emoji: '🐺', rarity: 'Common', skills: ['Hunting', 'Guard'], habitat: 'Forest' },
            { id: 2, name: 'Bear', emoji: '🐻', rarity: 'Rare', skills: ['Strength', 'Foraging'], habitat: 'Mountains' },
            { id: 3, name: 'Fox', emoji: '🦊', rarity: 'Common', skills: ['Stealth', 'Hunting'], habitat: 'Forest' },
            { id: 4, name: 'Rabbit', emoji: '🐰', rarity: 'Common', skills: ['Speed', 'Foraging'], habitat: 'Plains' },
            { id: 5, name: 'Deer', emoji: '🦌', rarity: 'Common', skills: ['Speed', 'Alert'], habitat: 'Forest' },
            { id: 6, name: 'Lion', emoji: '🦁', rarity: 'Legendary', skills: ['Leadership', 'Hunting'], habitat: 'Savanna' },
            { id: 7, name: 'Tiger', emoji: '🐅', rarity: 'Legendary', skills: ['Stealth', 'Strength'], habitat: 'Jungle' },
            { id: 8, name: 'Elephant', emoji: '🐘', rarity: 'Epic', skills: ['Strength', 'Memory'], habitat: 'Savanna' },
            { id: 9, name: 'Horse', emoji: '🐴', rarity: 'Common', skills: ['Speed', 'Endurance'], habitat: 'Plains' },
            { id: 10, name: 'Cow', emoji: '🐄', rarity: 'Common', skills: ['Food Production', 'Calm'], habitat: 'Farm' },
            
            // Birds
            { id: 11, name: 'Eagle', emoji: '🦅', rarity: 'Rare', skills: ['Flight', 'Vision'], habitat: 'Mountains' },
            { id: 12, name: 'Owl', emoji: '🦉', rarity: 'Common', skills: ['Night Vision', 'Wisdom'], habitat: 'Forest' },
            { id: 13, name: 'Crow', emoji: '🐦‍⬛', rarity: 'Common', skills: ['Intelligence', 'Communication'], habitat: 'Urban' },
            { id: 14, name: 'Parrot', emoji: '🦜', rarity: 'Rare', skills: ['Communication', 'Intelligence'], habitat: 'Jungle' },
            { id: 15, name: 'Penguin', emoji: '🐧', rarity: 'Rare', skills: ['Swimming', 'Cold Resistance'], habitat: 'Arctic' },
            
            // Marine Life
            { id: 16, name: 'Dolphin', emoji: '🐬', rarity: 'Epic', skills: ['Swimming', 'Intelligence'], habitat: 'Ocean' },
            { id: 17, name: 'Whale', emoji: '🐋', rarity: 'Legendary', skills: ['Swimming', 'Communication'], habitat: 'Ocean' },
            { id: 18, name: 'Shark', emoji: '🦈', rarity: 'Epic', skills: ['Swimming', 'Hunting'], habitat: 'Ocean' },
            { id: 19, name: 'Octopus', emoji: '🐙', rarity: 'Rare', skills: ['Intelligence', 'Camouflage'], habitat: 'Ocean' },
            
            // Reptiles
            { id: 20, name: 'Dragon', emoji: '🐉', rarity: 'Mythical', skills: ['Fire', 'Flight', 'Magic'], habitat: 'Volcano' },
            { id: 21, name: 'Snake', emoji: '🐍', rarity: 'Common', skills: ['Stealth', 'Poison'], habitat: 'Desert' },
            { id: 22, name: 'Turtle', emoji: '🐢', rarity: 'Common', skills: ['Defense', 'Longevity'], habitat: 'Swamp' },
            { id: 23, name: 'Lizard', emoji: '🦎', rarity: 'Common', skills: ['Camouflage', 'Climbing'], habitat: 'Desert' },
            
            // Insects & Others
            { id: 24, name: 'Butterfly', emoji: '🦋', rarity: 'Common', skills: ['Pollination', 'Beauty'], habitat: 'Garden' },
            { id: 25, name: 'Bee', emoji: '🐝', rarity: 'Common', skills: ['Pollination', 'Teamwork'], habitat: 'Garden' },
            { id: 26, name: 'Spider', emoji: '🕷️', rarity: 'Common', skills: ['Web Building', 'Patience'], habitat: 'Cave' },
            { id: 27, name: 'Scorpion', emoji: '🦂', rarity: 'Rare', skills: ['Poison', 'Desert Survival'], habitat: 'Desert' },
            
            // Domestic Animals
            { id: 28, name: 'Cat', emoji: '🐱', rarity: 'Common', skills: ['Stealth', 'Pest Control'], habitat: 'Urban' },
            { id: 29, name: 'Dog', emoji: '🐶', rarity: 'Common', skills: ['Loyalty', 'Guard'], habitat: 'Urban' },
            { id: 30, name: 'Pig', emoji: '🐷', rarity: 'Common', skills: ['Foraging', 'Intelligence'], habitat: 'Farm' }
        ];
    }
    
    update() {
        // Update active companions
        this.activeCompanions.forEach(companion => {
            this.updateCompanion(companion);
        });
    }
    
    updateCompanion(companion) {
        // Simple AI for companion movement
        companion.x += (Math.random() - 0.5) * 2;
        companion.y += (Math.random() - 0.5) * 2;
        
        // Keep companions on screen
        companion.x = Math.max(50, Math.min(this.game.canvas.width - 50, companion.x));
        companion.y = Math.max(50, Math.min(this.game.canvas.height - 50, companion.y));
        
        // Use companion skills for various benefits
        this.applyCompanionSkills(companion);
    }
    
    applyCompanionSkills(companion) {
        companion.type.skills.forEach(skill => {
            switch(skill) {
                case 'Hunting':
                    if (Math.random() < 0.001) { // Small chance to provide food
                        this.game.gameState.food += 5;
                    }
                    break;
                case 'Foraging':
                    if (Math.random() < 0.0005) {
                        this.game.gameState.food += 3;
                    }
                    break;
                case 'Food Production':
                    if (Math.random() < 0.0008) {
                        this.game.gameState.food += 2;
                    }
                    break;
                case 'Guard':
                    // Reduces chance of losing resources to meteors
                    break;
            }
        });
    }
    
    render(ctx) {
        this.activeCompanions.forEach(companion => {
            ctx.font = '24px Arial';
            ctx.fillText(companion.type.emoji, companion.x, companion.y);
            
            // Draw companion name
            ctx.font = '12px Arial';
            ctx.fillStyle = 'white';
            ctx.fillText(companion.name, companion.x - 20, companion.y + 30);
        });
    }
    
    encounterWildCompanion(x, y) {
        if (this.game.gameState.companions.length >= 200000) {
            console.log('Maximum companions reached!');
            return;
        }
        
        const randomType = this.getRandomCompanionType();
        const companion = this.createCompanion(randomType, x, y);
        
        if (this.attemptTaming(companion)) {
            this.addCompanion(companion);
            console.log(`Tamed a ${companion.type.name}!`);
        }
    }
    
    getRandomCompanionType() {
        const rarityWeights = {
            'Common': 60,
            'Rare': 25,
            'Epic': 10,
            'Legendary': 4,
            'Mythical': 1
        };
        
        const rand = Math.random() * 100;
        let cumulative = 0;
        
        for (const [rarity, weight] of Object.entries(rarityWeights)) {
            cumulative += weight;
            if (rand <= cumulative) {
                const companionsOfRarity = this.companionTypes.filter(c => c.rarity === rarity);
                return companionsOfRarity[Math.floor(Math.random() * companionsOfRarity.length)];
            }
        }
        
        return this.companionTypes[0]; // Fallback
    }
    
    createCompanion(type, x, y) {
        return {
            id: Date.now() + Math.random(),
            name: this.generateCompanionName(type),
            type: type,
            x: x || Math.random() * this.game.canvas.width,
            y: y || Math.random() * this.game.canvas.height,
            level: 1,
            experience: 0,
            happiness: 100,
            health: 100,
            discovered: new Date()
        };
    }
    
    generateCompanionName(type) {
        const prefixes = ['Swift', 'Brave', 'Wild', 'Ancient', 'Noble', 'Fierce', 'Gentle', 'Wise', 'Storm', 'Shadow'];
        const suffixes = ['paw', 'claw', 'wing', 'tail', 'fang', 'eye', 'heart', 'spirit', 'soul', 'fire'];
        
        return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${type.name} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    }
    
    attemptTaming(companion) {
        const baseSuccess = 70; // 70% base success rate
        let successRate = baseSuccess;
        
        // Adjust by rarity
        const rarityModifiers = {
            'Common': 0,
            'Rare': -20,
            'Epic': -40,
            'Legendary': -60,
            'Mythical': -80
        };
        
        successRate += rarityModifiers[companion.type.rarity] || 0;
        
        // Player survival state affects success
        if (this.game.gameState.food < 50) successRate -= 20;
        if (this.game.gameState.water < 50) successRate -= 20;
        
        return Math.random() * 100 < Math.max(5, successRate);
    }
    
    addCompanion(companion) {
        this.game.gameState.companions.push(companion);
        this.activeCompanions.push(companion);
        this.updateCompanionUI();
    }
    
    searchForCompanions() {
        if (this.game.gameState.food < 10) {
            alert('Not enough food to search! Need at least 10 food.');
            return;
        }
        
        this.game.gameState.food -= 10;
        
        // Multiple search attempts
        const attempts = 3;
        for (let i = 0; i < attempts; i++) {
            if (Math.random() < 0.3) { // 30% chance per attempt
                this.encounterWildCompanion(
                    Math.random() * this.game.canvas.width,
                    Math.random() * this.game.canvas.height
                );
            }
        }
    }
    
    updateCompanionUI() {
        const companionList = document.getElementById('companionList');
        companionList.innerHTML = '';
        
        this.game.gameState.companions.slice(-10).forEach(companion => {
            const div = document.createElement('div');
            div.className = 'companion';
            div.innerHTML = `
                <strong>${companion.type.emoji} ${companion.name}</strong><br>
                <small>Level ${companion.level} ${companion.type.rarity}</small><br>
                <small>Skills: ${companion.type.skills.join(', ')}</small>
            `;
            companionList.appendChild(div);
        });
        
        if (this.game.gameState.companions.length > 10) {
            const moreDiv = document.createElement('div');
            moreDiv.innerHTML = `<small>... and ${this.game.gameState.companions.length - 10} more companions</small>`;
            companionList.appendChild(moreDiv);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CompanionSystem;
}