// Survival System - Handles hunting, fishing, and resource management
class SurvivalSystem {
    constructor(game) {
        this.game = game;
        this.huntingCooldown = 0;
        this.fishingCooldown = 0;
        this.lastAction = null;
    }
    
    update() {
        // Update cooldowns
        if (this.huntingCooldown > 0) this.huntingCooldown--;
        if (this.fishingCooldown > 0) this.fishingCooldown--;
        
        // Natural resource depletion in apocalyptic environment
        if (Math.random() < 0.001) {
            this.environmentalHazard();
        }
    }
    
    hunt() {
        if (this.huntingCooldown > 0) {
            alert(`Must wait ${Math.ceil(this.huntingCooldown / 60)} more seconds before hunting again.`);
            return;
        }
        
        const huntingParty = this.assembleHuntingParty();
        const success = this.attemptHunt(huntingParty);
        
        if (success.success) {
            this.game.gameState.food += success.food;
            this.game.gameState.water -= 5; // Hunting uses water
            alert(`Successful hunt! Gained ${success.food} food. ${success.message}`);
        } else {
            this.game.gameState.water -= 3; // Failed hunt still uses some water
            alert(`Hunt failed. ${success.message}`);
        }
        
        this.huntingCooldown = 300; // 5 minutes cooldown
        this.lastAction = 'hunt';
    }
    
    fish() {
        if (this.fishingCooldown > 0) {
            alert(`Must wait ${Math.ceil(this.fishingCooldown / 60)} more seconds before fishing again.`);
            return;
        }
        
        const fishingParty = this.assembleFishingParty();
        const success = this.attemptFish(fishingParty);
        
        if (success.success) {
            this.game.gameState.food += success.food;
            this.game.gameState.water += success.water || 0;
            alert(`Successful fishing! Gained ${success.food} food${success.water ? ` and ${success.water} water` : ''}. ${success.message}`);
        } else {
            alert(`Fishing failed. ${success.message}`);
        }
        
        this.fishingCooldown = 240; // 4 minutes cooldown
        this.lastAction = 'fish';
    }
    
    assembleHuntingParty() {
        const huntingCompanions = this.game.gameState.companions.filter(companion =>
            companion.type.skills.includes('Hunting') || 
            companion.type.skills.includes('Stealth') ||
            companion.type.skills.includes('Strength')
        );
        
        return {
            companions: huntingCompanions,
            skill: this.calculatePartySkill(huntingCompanions, ['Hunting', 'Stealth', 'Strength'])
        };
    }
    
    assembleFishingParty() {
        const fishingCompanions = this.game.gameState.companions.filter(companion =>
            companion.type.skills.includes('Swimming') || 
            companion.type.habitat === 'Ocean' ||
            companion.type.skills.includes('Patience')
        );
        
        return {
            companions: fishingCompanions,
            skill: this.calculatePartySkill(fishingCompanions, ['Swimming', 'Patience'])
        };
    }
    
    calculatePartySkill(companions, relevantSkills) {
        let skill = 0;
        companions.forEach(companion => {
            companion.type.skills.forEach(s => {
                if (relevantSkills.includes(s)) {
                    skill += companion.level * this.getSkillMultiplier(companion.type.rarity);
                }
            });
        });
        return skill;
    }
    
    getSkillMultiplier(rarity) {
        const multipliers = {
            'Common': 1,
            'Rare': 1.5,
            'Epic': 2,
            'Legendary': 3,
            'Mythical': 5
        };
        return multipliers[rarity] || 1;
    }
    
    attemptHunt(huntingParty) {
        const baseSuccess = 40;
        let successRate = baseSuccess + (huntingParty.skill * 2);
        
        // Apocalypse makes hunting harder
        successRate -= this.game.gameState.apocalypseLevel * 5;
        
        // Weather and environmental factors
        if (this.game.environmentSystem.isMeteorShower) {
            successRate -= 30;
        }
        
        // Player condition affects hunting
        if (this.game.gameState.water < 30) successRate -= 20;
        if (this.game.gameState.food < 20) successRate -= 15;
        
        const isSuccess = Math.random() * 100 < Math.max(5, successRate);
        
        if (isSuccess) {
            const huntResults = this.generateHuntResults(huntingParty);
            return {
                success: true,
                food: huntResults.food,
                message: huntResults.message
            };
        } else {
            return {
                success: false,
                message: this.generateHuntFailureMessage()
            };
        }
    }
    
    attemptFish(fishingParty) {
        const baseSuccess = 60; // Fishing is generally easier than hunting
        let successRate = baseSuccess + (fishingParty.skill * 1.5);
        
        // Apocalypse affects water quality
        successRate -= this.game.gameState.apocalypseLevel * 3;
        
        // Meteor contamination
        if (this.game.environmentSystem.isMeteorShower) {
            successRate -= 20;
        }
        
        const isSuccess = Math.random() * 100 < Math.max(10, successRate);
        
        if (isSuccess) {
            const fishResults = this.generateFishResults(fishingParty);
            return {
                success: true,
                food: fishResults.food,
                water: fishResults.water,
                message: fishResults.message
            };
        } else {
            return {
                success: false,
                message: this.generateFishFailureMessage()
            };
        }
    }
    
    generateHuntResults(huntingParty) {
        const baseFood = 15 + Math.random() * 20;
        const skillBonus = huntingParty.skill * 0.5;
        const totalFood = Math.floor(baseFood + skillBonus);
        
        const creatures = [
            'deer', 'rabbit', 'wild boar', 'bird', 'small game',
            'mutated creature', 'wasteland beast', 'surviving livestock'
        ];
        
        const creature = creatures[Math.floor(Math.random() * creatures.length)];
        const companionCount = huntingParty.companions.length;
        
        let message = `Your hunting party tracked and caught a ${creature}.`;
        if (companionCount > 0) {
            message += ` Your ${companionCount} hunting companions were instrumental in the success!`;
        }
        
        return { food: totalFood, message };
    }
    
    generateFishResults(fishingParty) {
        const baseFood = 10 + Math.random() * 15;
        const skillBonus = fishingParty.skill * 0.3;
        const totalFood = Math.floor(baseFood + skillBonus);
        
        // Chance for water from fishing near clean sources
        const water = Math.random() < 0.3 ? Math.floor(5 + Math.random() * 10) : 0;
        
        const fish = [
            'fish', 'trout', 'salmon', 'bass', 'shellfish',
            'mutated fish', 'radioactive catch', 'deep-water survivor'
        ];
        
        const catch_type = fish[Math.floor(Math.random() * fish.length)];
        const companionCount = fishingParty.companions.length;
        
        let message = `You caught some ${catch_type} from the waters.`;
        if (companionCount > 0) {
            message += ` Your ${companionCount} aquatic companions helped locate the best spots!`;
        }
        if (water > 0) {
            message += ` You also found a source of clean water!`;
        }
        
        return { food: totalFood, water, message };
    }
    
    generateHuntFailureMessage() {
        const failures = [
            'The prey escaped into the wasteland.',
            'Meteor activity scared away all wildlife.',
            'Your hunting party was detected by the prey.',
            'Radioactive storms made tracking impossible.',
            'The apocalyptic conditions made hunting too dangerous.',
            'Mutated creatures proved too aggressive to hunt safely.'
        ];
        
        return failures[Math.floor(Math.random() * failures.length)];
    }
    
    generateFishFailureMessage() {
        const failures = [
            'The water was too contaminated to fish safely.',
            'Meteor debris clouded the water.',
            'All fish have fled to deeper, unreachable waters.',
            'Radioactive fallout made the catch inedible.',
            'The fishing spot was compromised by environmental damage.',
            'Predatory mutated sea creatures made fishing impossible.'
        ];
        
        return failures[Math.floor(Math.random() * failures.length)];
    }
    
    environmentalHazard() {
        const hazards = [
            {
                name: 'Acid Rain',
                effect: () => {
                    this.game.gameState.food = Math.max(0, this.game.gameState.food - 5);
                    console.log('Acid rain contaminated some food supplies!');
                }
            },
            {
                name: 'Meteor Dust Storm',
                effect: () => {
                    this.game.gameState.water = Math.max(0, this.game.gameState.water - 8);
                    console.log('Meteor dust contaminated water sources!');
                }
            },
            {
                name: 'Radiation Burst',
                effect: () => {
                    // Protected by companions with radiation resistance
                    const protection = this.game.gameState.companions.filter(c => 
                        c.type.skills.includes('Cold Resistance') || c.type.rarity === 'Mythical'
                    ).length;
                    
                    if (protection < 3) {
                        this.game.gameState.food = Math.max(0, this.game.gameState.food - 3);
                        this.game.gameState.water = Math.max(0, this.game.gameState.water - 3);
                        console.log('Radiation burst damaged supplies!');
                    } else {
                        console.log('Your companions protected you from radiation!');
                    }
                }
            }
        ];
        
        const hazard = hazards[Math.floor(Math.random() * hazards.length)];
        hazard.effect();
    }
    
    // Get daily resource requirements
    getDailyNeeds() {
        return {
            food: 2 + Math.floor(this.game.gameState.companions.length * 0.1),
            water: 3 + Math.floor(this.game.gameState.companions.length * 0.05)
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SurvivalSystem;
}