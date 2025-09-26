import * as THREE from 'three';
import { CompanionData } from '../entities/CompanionData.js';
import { CompanionAI } from '../entities/CompanionAI.js';

export class CompanionSystem {
    constructor(scene, world, worldSize) {
        this.scene = scene;
        this.world = world;
        this.worldSize = worldSize;
        
        // Companion management
        this.companions = new Map(); // All companions in the world
        this.activeCompanions = new Map(); // Currently loaded/active companions
        this.discoveredCompanions = new Set(); // Companions player has discovered
        this.playerCompanions = []; // Companions following/owned by player
        
        // Performance optimization
        this.loadDistance = 500; // Distance to load companions
        this.unloadDistance = 1000; // Distance to unload companions
        this.maxActiveCompanions = 1000; // Maximum simultaneously active
        this.chunksSize = 100; // World divided into chunks for efficient loading
        
        // Spawn parameters
        this.spawnDensity = 0.02; // Companions per square meter
        this.rarityRates = {
            common: 0.6,
            uncommon: 0.25,
            rare: 0.12,
            legendary: 0.03
        };
        
        // Companion types and their spawn biomes
        this.companionTypes = this.initCompanionTypes();
        this.chunks = new Map(); // World chunks containing companion data
        
        // Performance tracking
        this.updateCount = 0;
        this.lastUpdateTime = 0;
    }
    
    async init(targetCount) {
        console.log(`Initializing companion system for ${targetCount.toLocaleString()} companions...`);
        
        // Pre-generate companion distribution across the world
        await this.generateCompanionDistribution(targetCount);
        
        // Initialize companion materials and geometries
        this.initCompanionAssets();
        
        console.log(`Companion system initialized with ${this.companions.size.toLocaleString()} companions distributed across ${this.chunks.size} chunks`);
    }
    
    initCompanionTypes() {
        return {
            // Mammalian companions
            wolf: {
                name: 'Shadow Wolf',
                rarity: 'uncommon',
                biomes: ['forest', 'mountain'],
                size: { min: 0.8, max: 1.2 },
                behaviors: ['pack_hunter', 'loyal', 'territorial'],
                stats: { speed: 8, strength: 7, intelligence: 6, endurance: 8 },
                color: 0x404040
            },
            bear: {
                name: 'Ash Bear',
                rarity: 'rare',
                biomes: ['forest', 'mountain'],
                size: { min: 1.5, max: 2.0 },
                behaviors: ['solitary', 'aggressive', 'protective'],
                stats: { speed: 4, strength: 10, intelligence: 5, endurance: 9 },
                color: 0x5d4037
            },
            deer: {
                name: 'Ember Deer',
                rarity: 'common',
                biomes: ['forest', 'plains'],
                size: { min: 0.9, max: 1.1 },
                behaviors: ['herd', 'skittish', 'fast'],
                stats: { speed: 10, strength: 3, intelligence: 4, endurance: 7 },
                color: 0x8d6e63
            },
            
            // Avian companions
            eagle: {
                name: 'Storm Eagle',
                rarity: 'uncommon',
                biomes: ['mountain', 'plains'],
                size: { min: 1.0, max: 1.3 },
                behaviors: ['aerial', 'hunter', 'keen_sight'],
                stats: { speed: 12, strength: 6, intelligence: 8, endurance: 6 },
                color: 0x795548
            },
            raven: {
                name: 'Ash Raven',
                rarity: 'common',
                biomes: ['forest', 'wasteland'],
                size: { min: 0.3, max: 0.5 },
                behaviors: ['intelligent', 'scavenger', 'social'],
                stats: { speed: 9, strength: 2, intelligence: 9, endurance: 5 },
                color: 0x212121
            },
            
            // Legendary/Rare companions
            phoenix: {
                name: 'Meteor Phoenix',
                rarity: 'legendary',
                biomes: ['wasteland', 'volcano'],
                size: { min: 1.8, max: 2.2 },
                behaviors: ['aerial', 'fire_immunity', 'rebirth'],
                stats: { speed: 15, strength: 8, intelligence: 10, endurance: 10 },
                color: 0xff4500
            },
            dragon: {
                name: 'Apocalypse Drake',
                rarity: 'legendary',
                biomes: ['mountain', 'volcano'],
                size: { min: 3.0, max: 4.0 },
                behaviors: ['aerial', 'territorial', 'ancient_wisdom'],
                stats: { speed: 8, strength: 15, intelligence: 12, endurance: 12 },
                color: 0x8b0000
            }
        };
    }
    
    async generateCompanionDistribution(targetCount) {
        const chunkSize = this.chunksSize;
        const chunksPerSide = Math.ceil(this.worldSize / chunkSize);
        let companionId = 0;
        let totalGenerated = 0;
        
        console.log(`Generating ${targetCount.toLocaleString()} companions across ${chunksPerSide}x${chunksPerSide} chunks...`);
        
        for (let chunkX = 0; chunkX < chunksPerSide; chunkX++) {
            for (let chunkZ = 0; chunkZ < chunksPerSide; chunkZ++) {
                const chunk = {
                    x: chunkX,
                    z: chunkZ,
                    companions: [],
                    loaded: false
                };
                
                // Calculate companions for this chunk based on biome and density
                const worldX = chunkX * chunkSize - this.worldSize / 2;
                const worldZ = chunkZ * chunkSize - this.worldSize / 2;
                const biome = this.getBiome(worldX, worldZ);
                const chunkCompanionCount = Math.floor((targetCount / (chunksPerSide * chunksPerSide)) * this.getBiomeDensityMultiplier(biome));
                
                // Generate companions for this chunk
                for (let i = 0; i < chunkCompanionCount && totalGenerated < targetCount; i++) {
                    const companion = this.generateCompanion(companionId++, worldX, worldZ, chunkSize, biome);
                    chunk.companions.push(companion);
                    this.companions.set(companion.id, companion);
                    totalGenerated++;
                }
                
                this.chunks.set(`${chunkX}_${chunkZ}`, chunk);
                
                // Progress update
                if (totalGenerated % 10000 === 0) {
                    console.log(`Generated ${totalGenerated.toLocaleString()} companions...`);
                }
            }
        }
        
        console.log(`Generated ${totalGenerated.toLocaleString()} companions total`);\n    }\n    \n    generateCompanion(id, chunkWorldX, chunkWorldZ, chunkSize, biome) {\n        // Random position within chunk\n        const x = chunkWorldX + Math.random() * chunkSize;\n        const z = chunkWorldZ + Math.random() * chunkSize;\n        const y = this.getTerrainHeight(x, z); // Get terrain height at this position\n        \n        // Select companion type based on biome and rarity\n        const availableTypes = Object.entries(this.companionTypes).filter(\n            ([key, type]) => type.biomes.includes(biome)\n        );\n        \n        if (availableTypes.length === 0) {\n            // Fallback to common types if no biome-specific types\n            availableTypes = Object.entries(this.companionTypes).filter(\n                ([key, type]) => type.rarity === 'common'\n            );\n        }\n        \n        const [typeKey, typeData] = this.selectByRarity(availableTypes);\n        const size = typeData.size.min + Math.random() * (typeData.size.max - typeData.size.min);\n        \n        return new CompanionData({\n            id,\n            type: typeKey,\n            name: this.generateUniqueName(typeData.name, id),\n            position: { x, y, z },\n            size,\n            rarity: typeData.rarity,\n            stats: this.randomizeStats(typeData.stats),\n            behaviors: [...typeData.behaviors],\n            biome,\n            discovered: false,\n            tamed: false,\n            level: 1,\n            experience: 0,\n            color: typeData.color\n        });\n    }\n    \n    selectByRarity(availableTypes) {\n        const rand = Math.random();\n        let cumulativeProbability = 0;\n        \n        // Sort by rarity (common first)\n        const rarityOrder = ['common', 'uncommon', 'rare', 'legendary'];\n        availableTypes.sort((a, b) => {\n            return rarityOrder.indexOf(a[1].rarity) - rarityOrder.indexOf(b[1].rarity);\n        });\n        \n        for (const [key, type] of availableTypes) {\n            cumulativeProbability += this.rarityRates[type.rarity];\n            if (rand <= cumulativeProbability) {\n                return [key, type];\n            }\n        }\n        \n        // Fallback to last available type\n        return availableTypes[availableTypes.length - 1];\n    }\n    \n    getBiome(x, z) {\n        // Simple biome generation based on position and noise\n        const distance = Math.sqrt(x * x + z * z);\n        const noise = this.noise(x * 0.01, z * 0.01);\n        \n        if (distance > this.worldSize * 0.4) {\n            return 'wasteland'; // Outer edges are wasteland\n        }\n        \n        if (noise > 0.3) {\n            return 'mountain';\n        } else if (noise > 0) {\n            return 'forest';\n        } else if (noise > -0.3) {\n            return 'plains';\n        } else {\n            return 'swamp';\n        }\n    }\n    \n    getBiomeDensityMultiplier(biome) {\n        const multipliers = {\n            forest: 1.5,\n            plains: 1.2,\n            mountain: 0.8,\n            swamp: 1.0,\n            wasteland: 0.3,\n            volcano: 0.1\n        };\n        return multipliers[biome] || 1.0;\n    }\n    \n    getTerrainHeight(x, z) {\n        // Simple height calculation - in real implementation would query terrain system\n        return this.noise(x * 0.05, z * 0.05) * 50 + 10;\n    }\n    \n    noise(x, z) {\n        // Simple pseudo-random noise function\n        const n = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;\n        return 2 * (n - Math.floor(n)) - 1;\n    }\n    \n    generateUniqueName(baseName, id) {\n        const prefixes = ['Shadow', 'Ember', 'Storm', 'Ash', 'Thunder', 'Frost', 'Flame', 'Wind'];\n        const suffixes = ['runner', 'stalker', 'wing', 'claw', 'heart', 'soul', 'spirit', 'fang'];\n        \n        if (Math.random() < 0.3) {\n            const prefix = prefixes[id % prefixes.length];\n            return `${prefix} ${baseName}`;\n        } else if (Math.random() < 0.5) {\n            const suffix = suffixes[id % suffixes.length];\n            return `${baseName} ${suffix}`;\n        }\n        \n        return baseName;\n    }\n    \n    randomizeStats(baseStats) {\n        const stats = {};\n        for (const [key, value] of Object.entries(baseStats)) {\n            stats[key] = Math.max(1, Math.floor(value + (Math.random() - 0.5) * 4));\n        }\n        return stats;\n    }\n    \n    initCompanionAssets() {\n        // Create simple geometries and materials for different companion types\n        this.companionGeometries = {\n            default: new THREE.BoxGeometry(1, 1, 2),\n            bird: new THREE.ConeGeometry(0.5, 1, 8),\n            large: new THREE.BoxGeometry(2, 2, 3)\n        };\n        \n        this.companionMaterials = new Map();\n        \n        // Create materials for different companion types\n        for (const [type, data] of Object.entries(this.companionTypes)) {\n            this.companionMaterials.set(type, new THREE.MeshLambertMaterial({\n                color: data.color,\n                transparent: true,\n                opacity: 0.9\n            }));\n        }\n    }\n    \n    update(deltaTime, playerPosition) {\n        this.updateCount++;\n        const currentTime = performance.now();\n        \n        // Limit update frequency for performance\n        if (currentTime - this.lastUpdateTime < 100) return; // Update every 100ms\n        this.lastUpdateTime = currentTime;\n        \n        // Update chunk loading/unloading based on player position\n        this.updateChunkLoading(playerPosition);\n        \n        // Update active companions\n        for (const [id, companion] of this.activeCompanions) {\n            if (companion.ai) {\n                companion.ai.update(deltaTime, playerPosition);\n            }\n        }\n        \n        // Performance logging\n        if (this.updateCount % 600 === 0) { // Every 60 seconds at 10fps\n            console.log(`Companions: ${this.activeCompanions.size} active, ${this.discoveredCompanions.size} discovered`);\n        }\n    }\n    \n    updateChunkLoading(playerPosition) {\n        const chunkSize = this.chunksSize;\n        const playerChunkX = Math.floor((playerPosition.x + this.worldSize / 2) / chunkSize);\n        const playerChunkZ = Math.floor((playerPosition.z + this.worldSize / 2) / chunkSize);\n        \n        const loadRadius = Math.ceil(this.loadDistance / chunkSize);\n        const unloadRadius = Math.ceil(this.unloadDistance / chunkSize);\n        \n        // Load nearby chunks\n        for (let x = playerChunkX - loadRadius; x <= playerChunkX + loadRadius; x++) {\n            for (let z = playerChunkZ - loadRadius; z <= playerChunkZ + loadRadius; z++) {\n                const chunkKey = `${x}_${z}`;\n                const chunk = this.chunks.get(chunkKey);\n                \n                if (chunk && !chunk.loaded) {\n                    this.loadChunk(chunk);\n                }\n            }\n        }\n        \n        // Unload distant chunks\n        for (const [key, chunk] of this.chunks) {\n            if (chunk.loaded) {\n                const distance = Math.max(\n                    Math.abs(chunk.x - playerChunkX),\n                    Math.abs(chunk.z - playerChunkZ)\n                );\n                \n                if (distance > unloadRadius) {\n                    this.unloadChunk(chunk);\n                }\n            }\n        }\n    }\n    \n    loadChunk(chunk) {\n        if (chunk.loaded || this.activeCompanions.size >= this.maxActiveCompanions) {\n            return;\n        }\n        \n        chunk.loaded = true;\n        \n        // Load companions in this chunk\n        for (const companionData of chunk.companions) {\n            this.loadCompanion(companionData);\n        }\n    }\n    \n    unloadChunk(chunk) {\n        if (!chunk.loaded) return;\n        \n        chunk.loaded = false;\n        \n        // Unload companions in this chunk\n        for (const companionData of chunk.companions) {\n            this.unloadCompanion(companionData);\n        }\n    }\n    \n    loadCompanion(companionData) {\n        if (this.activeCompanions.has(companionData.id)) return;\n        \n        // Create 3D mesh\n        const typeData = this.companionTypes[companionData.type];\n        const geometry = this.getGeometryForType(companionData.type);\n        const material = this.companionMaterials.get(companionData.type);\n        \n        const mesh = new THREE.Mesh(geometry, material);\n        mesh.position.set(\n            companionData.position.x,\n            companionData.position.y,\n            companionData.position.z\n        );\n        mesh.scale.setScalar(companionData.size);\n        mesh.castShadow = true;\n        mesh.userData = { companionId: companionData.id };\n        \n        // Add to scene\n        this.scene.add(mesh);\n        \n        // Create AI controller\n        const ai = new CompanionAI(companionData, mesh, this.world);\n        \n        // Store active companion\n        this.activeCompanions.set(companionData.id, {\n            data: companionData,\n            mesh: mesh,\n            ai: ai\n        });\n    }\n    \n    unloadCompanion(companionData) {\n        const activeCompanion = this.activeCompanions.get(companionData.id);\n        if (!activeCompanion) return;\n        \n        // Remove from scene\n        this.scene.remove(activeCompanion.mesh);\n        \n        // Cleanup\n        activeCompanion.mesh.geometry.dispose();\n        activeCompanion.ai.dispose();\n        \n        // Remove from active companions\n        this.activeCompanions.delete(companionData.id);\n    }\n    \n    getGeometryForType(type) {\n        const typeData = this.companionTypes[type];\n        \n        if (typeData.behaviors.includes('aerial')) {\n            return this.companionGeometries.bird;\n        } else if (typeData.size.max > 2.0) {\n            return this.companionGeometries.large;\n        }\n        \n        return this.companionGeometries.default;\n    }\n    \n    // Player interaction methods\n    discoverCompanion(companionId) {\n        if (this.discoveredCompanions.has(companionId)) return false;\n        \n        this.discoveredCompanions.add(companionId);\n        const companion = this.companions.get(companionId);\n        \n        if (companion) {\n            companion.discovered = true;\n            console.log(`Discovered new companion: ${companion.name} (${companion.type})`);\n            this.showCompanionDiscovery(companion);\n            return true;\n        }\n        \n        return false;\n    }\n    \n    showCompanionDiscovery(companion) {\n        // Create discovery UI notification\n        const alert = document.createElement('div');\n        alert.className = 'companion-alert companion-discovered';\n        alert.innerHTML = `\n            <h2>New Companion Discovered!</h2>\n            <div>${companion.name}</div>\n            <div>Rarity: ${companion.rarity}</div>\n            <div>Biome: ${companion.biome}</div>\n        `;\n        \n        document.body.appendChild(alert);\n        alert.style.display = 'block';\n        \n        // Auto-hide after 3 seconds\n        setTimeout(() => {\n            alert.style.opacity = '0';\n            setTimeout(() => {\n                document.body.removeChild(alert);\n            }, 500);\n        }, 3000);\n    }\n    \n    getDiscoveryStats() {\n        const stats = {\n            total: this.companions.size,\n            discovered: this.discoveredCompanions.size,\n            active: this.activeCompanions.size,\n            owned: this.playerCompanions.length\n        };\n        \n        // Count by rarity\n        stats.byRarity = {};\n        for (const companion of this.companions.values()) {\n            if (companion.discovered) {\n                stats.byRarity[companion.rarity] = (stats.byRarity[companion.rarity] || 0) + 1;\n            }\n        }\n        \n        return stats;\n    }\n}