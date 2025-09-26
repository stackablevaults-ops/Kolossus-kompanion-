// Environment System - Handles apocalyptic meteor events and world state
class EnvironmentSystem {
    constructor(game) {
        this.game = game;
        this.meteorShowers = [];
        this.isMeteorShower = false;
        this.meteorActivity = 1;
        this.environmentEffects = [];
        this.lastMeteorTime = 0;
        this.terrain = this.generateTerrain();
        this.setupMeteorSystem();
    }
    
    setupMeteorSystem() {
        // Initialize meteor shower system
        setInterval(() => {
            if (Math.random() < this.meteorActivity * 0.1) {
                this.startMeteorShower();
            }
        }, 10000); // Check every 10 seconds
    }
    
    generateTerrain() {
        const terrains = [
            { type: 'wasteland', color: '#8B4513', hostility: 'high' },
            { type: 'forest', color: '#228B22', hostility: 'medium' },
            { type: 'mountains', color: '#696969', hostility: 'high' },
            { type: 'plains', color: '#9ACD32', hostility: 'low' },
            { type: 'desert', color: '#F4A460', hostility: 'medium' },
            { type: 'ocean', color: '#4682B4', hostility: 'medium' },
            { type: 'arctic', color: '#B0C4DE', hostility: 'high' },
            { type: 'swamp', color: '#556B2F', hostility: 'high' },
            { type: 'volcano', color: '#DC143C', hostility: 'extreme' }
        ];
        
        const selectedTerrain = terrains[Math.floor(Math.random() * terrains.length)];
        return selectedTerrain;
    }
    
    update() {
        this.updateMeteors();
        this.updateEnvironmentEffects();
        this.updateThreatLevel();
    }
    
    updateMeteors() {
        // Update existing meteors
        this.meteorShowers = this.meteorShowers.filter(meteor => {
            meteor.y += meteor.speed;
            meteor.x += meteor.drift;
            
            // Remove meteors that hit the ground
            if (meteor.y > this.game.canvas.height) {
                this.meteorImpact(meteor);
                return false;
            }
            
            return true;
        });
        
        // End meteor shower after duration
        if (this.isMeteorShower && Date.now() - this.lastMeteorTime > 30000) { // 30 seconds
            this.endMeteorShower();
        }
    }
    
    startMeteorShower() {
        if (this.isMeteorShower) return;
        
        this.isMeteorShower = true;
        this.lastMeteorTime = Date.now();
        
        console.log('METEOR SHOWER APPROACHING! Take shelter!');
        
        // Spawn meteors over time
        const meteorInterval = setInterval(() => {
            if (!this.isMeteorShower) {
                clearInterval(meteorInterval);
                return;
            }
            
            for (let i = 0; i < 2 + this.meteorActivity; i++) {
                this.spawnMeteor();
            }
        }, 1000);
    }
    
    spawnMeteor() {
        const meteor = {
            x: Math.random() * this.game.canvas.width,
            y: -20,
            speed: 3 + Math.random() * 5,
            drift: (Math.random() - 0.5) * 2,
            size: 2 + Math.random() * 6,
            type: this.getMeteorType(),
            glow: Math.random() * 0.5 + 0.5
        };
        
        this.meteorShowers.push(meteor);
    }
    
    getMeteorType() {
        const types = [
            { name: 'iron', color: '#CD853F', rarity: 0.6 },
            { name: 'ice', color: '#B0E0E6', rarity: 0.25 },
            { name: 'radioactive', color: '#32CD32', rarity: 0.1 },
            { name: 'crystal', color: '#9370DB', rarity: 0.04 },
            { name: 'antimatter', color: '#FF1493', rarity: 0.01 }
        ];
        
        const rand = Math.random();
        let cumulative = 0;
        
        for (const type of types) {
            cumulative += type.rarity;
            if (rand <= cumulative) {
                return type;
            }
        }
        
        return types[0]; // Fallback
    }
    
    meteorImpact(meteor) {
        // Create impact effect
        this.createImpactEffect(meteor);
        
        // Apply impact consequences
        switch (meteor.type.name) {
            case 'iron':
                // Standard damage
                if (Math.random() < 0.3) {
                    this.game.gameState.food = Math.max(0, this.game.gameState.food - 2);
                }
                break;
                
            case 'ice':
                // May provide water but damages food
                if (Math.random() < 0.4) {
                    this.game.gameState.water += 5;
                    this.game.gameState.food = Math.max(0, this.game.gameState.food - 1);
                }
                break;
                
            case 'radioactive':
                // Heavy damage but may spawn rare companions
                this.game.gameState.food = Math.max(0, this.game.gameState.food - 5);
                this.game.gameState.water = Math.max(0, this.game.gameState.water - 3);
                if (Math.random() < 0.1) {
                    this.spawnMutatedCompanion(meteor);
                }
                break;
                
            case 'crystal':
                // May enhance companion abilities
                if (Math.random() < 0.3) {
                    this.enhanceRandomCompanion();
                }
                break;
                
            case 'antimatter':
                // Extreme effects - very rare
                if (Math.random() < 0.5) {
                    this.createPortalEvent(meteor);
                } else {
                    this.game.gameState.food = Math.max(0, this.game.gameState.food - 10);
                    this.game.gameState.water = Math.max(0, this.game.gameState.water - 10);
                }
                break;
        }
    }
    
    createImpactEffect(meteor) {
        const effect = {
            x: meteor.x,
            y: this.game.canvas.height - 20,
            radius: meteor.size * 2,
            color: meteor.type.color,
            duration: 3000,
            startTime: Date.now()
        };
        
        this.environmentEffects.push(effect);
    }
    
    spawnMutatedCompanion(meteor) {
        // Create a special mutated companion from radiation
        if (this.game.companionSystem) {
            const mutatedTypes = this.game.companionSystem.companionTypes.filter(t => 
                t.rarity === 'Rare' || t.rarity === 'Epic'
            );
            
            if (mutatedTypes.length > 0) {
                const baseType = mutatedTypes[Math.floor(Math.random() * mutatedTypes.length)];
                const mutatedType = {
                    ...baseType,
                    name: `Mutated ${baseType.name}`,
                    rarity: 'Epic',
                    skills: [...baseType.skills, 'Radiation Resistance'],
                    emoji: baseType.emoji // Could be enhanced with mutation effects
                };
                
                const companion = this.game.companionSystem.createCompanion(mutatedType, meteor.x, meteor.y);
                this.game.companionSystem.addCompanion(companion);
                console.log(`A mutated ${baseType.name} emerged from the radioactive impact!`);
            }
        }
    }
    
    enhanceRandomCompanion() {
        if (this.game.gameState.companions.length === 0) return;
        
        const randomCompanion = this.game.gameState.companions[
            Math.floor(Math.random() * this.game.gameState.companions.length)
        ];
        
        randomCompanion.level++;
        randomCompanion.experience += 100;
        console.log(`${randomCompanion.name} was enhanced by crystal energy!`);
    }
    
    createPortalEvent(meteor) {
        // Ultra-rare event - spawn multiple rare companions
        console.log('ANTIMATTER PORTAL OPENED! Creatures from another dimension appear!');
        
        for (let i = 0; i < 3; i++) {
            const mythicalTypes = this.game.companionSystem.companionTypes.filter(t => 
                t.rarity === 'Mythical' || t.rarity === 'Legendary'
            );
            
            if (mythicalTypes.length > 0) {
                const type = mythicalTypes[Math.floor(Math.random() * mythicalTypes.length)];
                const companion = this.game.companionSystem.createCompanion(type, meteor.x + (i * 30), meteor.y);
                this.game.companionSystem.addCompanion(companion);
            }
        }
    }
    
    endMeteorShower() {
        this.isMeteorShower = false;
        console.log('Meteor shower has ended. Survey the damage...');
        this.updateThreatLevel();
    }
    
    increaseMeteorActivity() {
        this.meteorActivity += 0.5;
        this.meteorActivity = Math.min(this.meteorActivity, 10); // Cap at 10x intensity
        
        const threatLevels = ['Low', 'Moderate', 'High', 'Severe', 'Critical', 'MAXIMUM'];
        const threatIndex = Math.min(Math.floor(this.meteorActivity) - 1, threatLevels.length - 1);
        this.game.gameState.meteorThreat = threatLevels[threatIndex] || 'MAXIMUM';
    }
    
    updateThreatLevel() {
        const day = this.game.gameState.day;
        
        if (day < 10) {
            this.game.gameState.meteorThreat = 'Low';
        } else if (day < 25) {
            this.game.gameState.meteorThreat = 'Moderate';  
        } else if (day < 50) {
            this.game.gameState.meteorThreat = 'High';
        } else if (day < 100) {
            this.game.gameState.meteorThreat = 'Severe';
        } else {
            this.game.gameState.meteorThreat = 'Critical';
        }
    }
    
    updateEnvironmentEffects() {
        this.environmentEffects = this.environmentEffects.filter(effect => {
            const elapsed = Date.now() - effect.startTime;
            return elapsed < effect.duration;
        });
    }
    
    render(ctx) {
        this.renderTerrain(ctx);
        this.renderMeteors(ctx);
        this.renderEffects(ctx);
        this.renderEnvironmentInfo(ctx);
    }
    
    renderTerrain(ctx) {
        // Simple terrain indication
        ctx.fillStyle = this.terrain.color + '20'; // Semi-transparent
        ctx.fillRect(0, this.game.canvas.height - 100, this.game.canvas.width, 100);
        
        // Add terrain texture
        for (let i = 0; i < this.game.canvas.width; i += 50) {
            ctx.fillStyle = this.terrain.color + '40';
            ctx.fillRect(i, this.game.canvas.height - 80 + Math.random() * 20, 30, 20);
        }
    }
    
    renderMeteors(ctx) {
        this.meteorShowers.forEach(meteor => {
            // Draw meteor trail
            ctx.save();
            const gradient = ctx.createLinearGradient(meteor.x, meteor.y - 20, meteor.x, meteor.y);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(1, meteor.type.color);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = meteor.size;
            ctx.beginPath();
            ctx.moveTo(meteor.x, meteor.y - 20);
            ctx.lineTo(meteor.x, meteor.y);
            ctx.stroke();
            
            // Draw meteor core
            ctx.fillStyle = meteor.type.color;
            ctx.shadowColor = meteor.type.color;
            ctx.shadowBlur = meteor.glow * 10;
            ctx.beginPath();
            ctx.arc(meteor.x, meteor.y, meteor.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }
    
    renderEffects(ctx) {
        this.environmentEffects.forEach(effect => {
            const elapsed = Date.now() - effect.startTime;
            const progress = elapsed / effect.duration;
            const alpha = 1 - progress;
            const currentRadius = effect.radius * (1 + progress);
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, currentRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        });
    }
    
    renderEnvironmentInfo(ctx) {
        // Display current terrain info
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(`Terrain: ${this.terrain.type.charAt(0).toUpperCase() + this.terrain.type.slice(1)}`, 
                    this.game.canvas.width - 200, 30);
        
        if (this.isMeteorShower) {
            ctx.fillStyle = 'red';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('⚠️ METEOR SHOWER ACTIVE ⚠️', this.game.canvas.width / 2 - 100, 50);
        }
    }
    
    // Get environmental bonuses/penalties for companion spawning
    getEnvironmentModifier() {
        const modifiers = {
            'wasteland': { companionSpawn: 0.5, survivalPenalty: 0.2 },
            'forest': { companionSpawn: 1.2, survivalBonus: 0.1 },
            'mountains': { companionSpawn: 0.8, survivalPenalty: 0.1 },
            'plains': { companionSpawn: 1.0, survivalBonus: 0.05 },
            'desert': { companionSpawn: 0.7, survivalPenalty: 0.15 },
            'ocean': { companionSpawn: 1.1, fishingBonus: 0.2 },
            'arctic': { companionSpawn: 0.6, survivalPenalty: 0.3 },
            'swamp': { companionSpawn: 0.9, diseaseRisk: 0.1 },
            'volcano': { companionSpawn: 0.3, survivalPenalty: 0.4, rareSpawn: 2.0 }
        };
        
        return modifiers[this.terrain.type] || { companionSpawn: 1.0 };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnvironmentSystem;
}