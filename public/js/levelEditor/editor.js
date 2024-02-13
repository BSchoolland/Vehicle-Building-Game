import Building from './mapbuilding.js';
import { Camera } from '../game/camera.js';
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
// remove the image background
document.body.style.background = 'none';

// set the background to a gradient
render.options.background = 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0, 0.5) 50%, rgba(135, 206, 235) 100%)';
var mouse = Matter.Mouse.create(render.canvas);
// create the camera
var camera = new Camera(render, mouse, render.canvas);
camera.size = { x: 800*3, y: 600 *3 };

// allow the player to build blocks
let building = new Building(engine, camera);
building.init();
// building.buildArea = { x: 0, y: 0, width: 800*3, height: 900 };
building.grid = 100;
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
