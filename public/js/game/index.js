import Building from './building.js';
import { Camera } from './camera.js';
import { LevelManager } from '../world/level.js';
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

// allow the player to build blocks
let building = new Building(engine, camera, false);
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
// load a specific level (from index.json)
const indexLevelJSON = await (await fetch('js/game/index.json')).json();
levelObject.load(1, indexLevelJSON);
// toggle build mode twice to fix the camera
building.toggleBuildingMode();
building.toggleBuildingMode();
building.buildMenu.hide();

// set the camera to a wide view
camera.setViewport(1650, 1000);
camera.setPosition(300, -100)

// to fix the random bug where the camera is not set correctly
setTimeout(() => {
    camera.setViewport(1650, 1000);
    camera.setPosition(300, -100)
}, 1000);

// log hello world every 5 seconds
setInterval(() => {
    building.toggleBuildingMode();
    building.toggleBuildingMode();
    camera.setViewport(1650, 1000);
    camera.setPosition(300, -100)

    // to fix the random bug where the camera is not set correctly
    setTimeout(() => {
        camera.setViewport(1650, 1000);
        camera.setPosition(300, -100)
    }, 1000);
}, 60000);

