import { World } from './world.js';
import Building from './building_refactor.js';
import { Camera } from './camera.js';
// Create an engine
var engine = Matter.Engine.create();

// Create a renderer
var render = Matter.Render.create({
    element: document.body,
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

// get the JSON data for the terrain
var terrainJson = await (await fetch('json-levels/level1.json')).json();

var gameWorld = new World(engine, terrainJson);
gameWorld.loadTerrain();
// gameWorld.LoadEnemyContraption();