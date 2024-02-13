// this file is responsible for loading sounds, and letting the game know when they are loaded
export default class SoundHandler {
    constructor() {
        this.audioContext = new AudioContext();
        this.music = {
            menu: "./js/sounds/music/menu.mp3",
            game: "./js/sounds/music/game.mp3",
            victory: "./js/sounds/music/victory.mp3",
            defeat: "./js/sounds/music/defeat.mp3",
        };
        this.effects = {
            explosion1: "./js/sounds/effects/explosion1.mp3",
            explosion2: "./js/sounds/effects/explosion2.mp3",
            explosion3: "./js/sounds/effects/explosion3.mp3",
            blockTakesDamage1: "./js/sounds/effects/blockTakesDamage1.mp3",
            blockTakesDamage2: "./js/sounds/effects/blockTakesDamage2.mp3",
            blockTakesDamage3: "./js/sounds/effects/blockTakesDamage3.mp3",
            rocketFlame: "./js/sounds/effects/rocketFlame.mp3",
            disconnect: "./js/sounds/effects/disconnect.mp3",
            electricMotor: "./js/sounds/effects/electricMotor.mp3",
            grappleFire: "./js/sounds/effects/grappleFire.mp3",
            grappleReel: "./js/sounds/effects/grappleReel.mp3",
        };
        this.loadedSongs = {};
        this.loadedSounds = {};
        this.playingSounds = {};
        this.loadMusic();
        this.loadEffects();
    }
    async init () { // call the loadMusic and loadEffects functions, then return a promise that resolves when they are done
        return new Promise((resolve, reject) => {
            Promise.all([
                this.loadMusic(),
                this.loadEffects()
            ]).then(() => {
                resolve();
            });
        });
    }
    async loadSound(url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            return await this.audioContext.decodeAudioData(arrayBuffer);
        } catch (error) {
            console.error("Error loading sound:", error);
        }
    }
    loadMusic() {
        Promise.all(Object.entries(this.music).map(async ([name, url]) => {
            this.loadedSongs[name] = await this.loadSound(url);
        })).then(() => {
            console.log("Music loaded");
        });
    }
    loadEffects() {
        Promise.all(Object.entries(this.effects).map(async ([name, url]) => {
            this.loadedSounds[name] = await this.loadSound(url);
        })).then(() => {
            console.log("Effects loaded");
        });
    }
}