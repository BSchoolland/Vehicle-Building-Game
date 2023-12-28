import Building from './building.js';
import { Camera } from './camera.js';
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
// create the world
import { Level } from '../world/level.js';
const LoadLevel = new Level(engine, building.contraption);
const LevelJson = await (await fetch('json-levels/level0.json')).json();
LoadLevel.load(LevelJson);