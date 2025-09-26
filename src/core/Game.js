import * as THREE from 'three';
import { World } from 'cannon-es';
import { TerrainSystem } from '../systems/TerrainSystem.js';
import { CompanionSystem } from '../systems/CompanionSystem.js';
import { PlayerController } from '../systems/PlayerController.js';
import { WeatherSystem } from '../systems/WeatherSystem.js';
import { SurvivalSystem } from '../systems/SurvivalSystem.js';
import { UIManager } from '../ui/UIManager.js';
import { AssetLoader } from '../utils/AssetLoader.js';

export class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.world = null; // Physics world
        
        // Game systems
        this.terrainSystem = null;
        this.companionSystem = null;
        this.playerController = null;
        this.weatherSystem = null;
        this.survivalSystem = null;
        this.uiManager = null;
        this.assetLoader = null;
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.clock = new THREE.Clock();
        this.frameId = null;
        
        // World settings
        this.worldSize = 10000; // Massive world: 10km x 10km
        this.companionTargetCount = 200000;
        
        // Bind methods
        this.update = this.update.bind(this);
        this.handleResize = this.handleResize.bind(this);
        
        // Make game accessible globally for debugging
        window.game = this;
    }
    
    async init() {
        console.log('Initializing Kolossus Kompanion...');
        
        try {
            // Show loading screen
            this.showLoadingProgress('Initializing 3D engine...', 10);
            
            // Initialize Three.js
            this.initThreeJS();
            
            // Initialize physics
            this.showLoadingProgress('Setting up physics world...', 20);
            this.initPhysics();
            
            // Initialize asset loader
            this.showLoadingProgress('Loading assets...', 30);
            this.assetLoader = new AssetLoader();
            await this.assetLoader.loadEssentialAssets();
            
            // Initialize UI
            this.showLoadingProgress('Creating user interface...', 40);
            this.uiManager = new UIManager();
            this.uiManager.init();
            
            // Initialize game systems
            this.showLoadingProgress('Generating massive terrain...', 50);
            this.terrainSystem = new TerrainSystem(this.scene, this.world, this.worldSize);
            await this.terrainSystem.init();
            
            this.showLoadingProgress('Spawning companion animals...', 70);
            this.companionSystem = new CompanionSystem(this.scene, this.world, this.worldSize);
            await this.companionSystem.init(this.companionTargetCount);
            
            this.showLoadingProgress('Initializing player...', 80);
            this.playerController = new PlayerController(this.scene, this.world, this.camera);
            await this.playerController.init();
            
            this.showLoadingProgress('Setting up weather systems...', 85);
            this.weatherSystem = new WeatherSystem(this.scene, this.worldSize);
            this.weatherSystem.init();
            
            this.showLoadingProgress('Configuring survival mechanics...', 90);
            this.survivalSystem = new SurvivalSystem(this.playerController, this.uiManager);
            this.survivalSystem.init();
            
            // Final setup
            this.showLoadingProgress('Finalizing world...', 95);
            this.setupLighting();
            this.setupEventListeners();
            
            this.showLoadingProgress('Welcome to the apocalypse...', 100);
            
            // Hide loading screen and start game
            setTimeout(() => {
                this.hideLoadingScreen();
                this.start();
            }, 1000);
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showLoadingProgress('Error: ' + error.message, 0);
        }
    }
    
    initThreeJS() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x2c1810); // Apocalyptic sky
        this.scene.fog = new THREE.Fog(0x2c1810, 100, 2000); // Ash fog
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            this.worldSize
        );
        this.camera.position.set(0, 50, 0);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Add to DOM
        const container = document.getElementById('game-container');
        container.appendChild(this.renderer.domElement);
        
        // Add crosshair
        const crosshair = document.createElement('div');
        crosshair.className = 'crosshair';
        container.appendChild(crosshair);
    }
    
    initPhysics() {
        this.world = new World();
        this.world.gravity.set(0, -9.82, 0);
        this.world.broadphase = new THREE.SAPBroadphase();
        this.world.allowSleep = true;
        
        // Ground material
        const groundMaterial = new CANNON.Material('ground');
        const groundContactMaterial = new CANNON.ContactMaterial(
            groundMaterial,
            groundMaterial,
            {
                friction: 0.4,
                restitution: 0.3
            }
        );
        this.world.addContactMaterial(groundContactMaterial);
    }
    
    setupLighting() {
        // Ambient light (apocalyptic, dim)
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Directional light (sun through ash clouds)
        const directionalLight = new THREE.DirectionalLight(0xffa500, 0.8);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -200;
        directionalLight.shadow.camera.right = 200;
        directionalLight.shadow.camera.top = 200;
        directionalLight.shadow.camera.bottom = -200;
        this.scene.add(directionalLight);
        
        // Point lights for fire/meteor effects
        const meteorLight = new THREE.PointLight(0xff4500, 1, 100);
        meteorLight.position.set(0, 200, 0);
        this.scene.add(meteorLight);
    }
    
    setupEventListeners() {
        // Pointer lock for first-person controls
        const canvas = this.renderer.domElement;
        canvas.addEventListener('click', () => {
            canvas.requestPointerLock();
        });
        
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement === canvas) {
                this.playerController.enableMouseLook();
            } else {
                this.playerController.disableMouseLook();
            }
        });
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        console.log('Game started!');
        console.log(`World size: ${this.worldSize}m x ${this.worldSize}m`);
        console.log(`Target companions: ${this.companionTargetCount.toLocaleString()}`);
        
        this.update();
    }
    
    pause() {
        this.isPaused = true;
        console.log('Game paused');
    }
    
    resume() {
        this.isPaused = false;
        console.log('Game resumed');
    }
    
    stop() {
        this.isRunning = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
        console.log('Game stopped');
    }
    
    update() {
        if (!this.isRunning) return;
        
        this.frameId = requestAnimationFrame(this.update);
        
        if (this.isPaused) return;
        
        const deltaTime = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();
        
        // Update physics
        this.world.step(1/60, deltaTime, 3);
        
        // Update all systems
        if (this.playerController) this.playerController.update(deltaTime);
        if (this.terrainSystem) this.terrainSystem.update(deltaTime, this.camera.position);
        if (this.companionSystem) this.companionSystem.update(deltaTime, this.camera.position);
        if (this.weatherSystem) this.weatherSystem.update(deltaTime, elapsedTime);
        if (this.survivalSystem) this.survivalSystem.update(deltaTime);
        if (this.uiManager) this.uiManager.update(deltaTime);
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
    
    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    showLoadingProgress(text, percentage) {
        const loadingText = document.getElementById('loading-text');
        const progressFill = document.getElementById('progress-fill');
        
        if (loadingText) loadingText.textContent = text;
        if (progressFill) progressFill.style.width = percentage + '%';
        
        console.log(`Loading: ${text} (${percentage}%)`);
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }
}