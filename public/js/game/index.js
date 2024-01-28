import Building from './building.js';
import { Camera } from './camera.js';
import { LevelManager } from '../world/level.js';
import { setSong } from '../sounds/playSound.js';
// wait to do everything until the user clicks
let gameStarted = false;
function clickHandler() {
    if (gameStarted) {
        return;
    }
    gameStarted = true;
    // play the sound
    setSong('mainTheme');
    // remove the event listener
    document.removeEventListener('click', clickHandler);
    // start the game
    startGame();
}

function createHTML() {
    const container = document.getElementById('container');
    // clear the container
    container.innerHTML = '';
    // Create elements
    const h1 = document.createElement('h1');
    const editorLink = document.createElement('a');
    const campaignLink = document.createElement('a');

    // Set attributes and content
    container.className = 'container';
    h1.textContent = 'Welcome to Wrecking Wheels!';
    editorLink.href = 'editor.html';
    editorLink.className = 'button';
    editorLink.textContent = 'Level Editor';
    campaignLink.href = 'campaign.html';
    campaignLink.className = 'button';
    campaignLink.textContent = 'Campaign';

    // Append elements
    container.appendChild(h1);
    container.appendChild(editorLink);
    container.appendChild(campaignLink);

    // Append the container to the body (or another parent element)
    document.body.appendChild(container);
}



document.addEventListener('click', clickHandler);

async function startGame() {
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
// set the background to a gradient
render.options.background = 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0, 0.5) 50%, rgba(135, 206, 235) 100%)';

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

    // Add the event listener
    document.addEventListener('click', clickHandler);

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
    }, 53000);
}
