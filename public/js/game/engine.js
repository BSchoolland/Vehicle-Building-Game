import Building from './building.js';
import { Camera } from './camera.js';
import { LevelManager } from '../world/level.js';
import { playSound } from '../sounds/playSound.js';

let gameStarted = false;
function clickHandler() {
    if (gameStarted) {
        return;
    }
    gameStarted = true;
    // play the sound
    playSound('mainTheme', true);
    // remove the event listener
    document.removeEventListener('click', clickHandler);
    // start the game
    startGame();
}

function createHTML() {
    const container = document.getElementById('container');
    // clear the container
    container.innerHTML = '';
}



document.addEventListener('click', clickHandler);
function startGame() {
createHTML();
// Create an engine
var engine = Matter.Engine.create();

// Create a renderer
var container = document.getElementById('game-container');
var render = Matter.Render.create({
    element: container,
    engine: engine,
    options: {
        wireframes: false // Set wireframes to false to show styles
    }
});
var mouse = Matter.Mouse.create(render.canvas);
// create the camera
var camera = new Camera(render, mouse, render.canvas);
// play the background music
playSound('mainTheme', true);

// allow the player to build blocks
let building = new Building(engine, camera);
building.init();
// fullscren
function setFullScreenCanvas() {
    let canvas = render.canvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render.options.width = window.innerWidth;
    render.options.height = window.innerHeight;
    render.bounds.max.x = window.innerWidth;
    render.bounds.max.y = window.innerHeight;
}

window.addEventListener('resize', function() {
    setFullScreenCanvas();
});
setFullScreenCanvas();

// Run the engine and the renderer
Matter.Runner.run(engine);
Matter.Render.run(render);

// run the camera
Matter.Events.on(engine, 'beforeUpdate', () => {
    camera.smoothUpdate();
});

console.log(building.contraption)

const levelObject = new LevelManager(engine, building);
levelObject.init();
// load the level selector screen
// after a short delay to allow the levels to load
setTimeout(() => {
    levelObject.loadLevelSelector();
}, 1000);
}