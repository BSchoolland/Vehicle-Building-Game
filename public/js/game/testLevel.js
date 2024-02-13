import Building from "./building.js";
import { Camera } from "./camera.js";
import { LevelManager } from "../world/level.js";
import { setSong } from "../sounds/playSound.js";

let gameStarted = false;
function clickHandler() {
  if (gameStarted) {
    return;
  }
  gameStarted = true;
  // play the sound
  setSong("mainTheme");
  // remove the event listener
  document.removeEventListener("click", clickHandler);
  // start the game
  startGame();
  // get rid of the body background
document.body.style.background = 'none';
}

function createHTML() {
  const container = document.getElementById("container");
  // clear the container
  container.innerHTML = "";
}
// Create an engine
var engine = Matter.Engine.create();

// Create a renderer
var container = document.getElementById("game-container");
// hide the container until the game starts
container.style.display = "none";
var render = Matter.Render.create({
  element: container,
  engine: engine,
  options: {
    wireframes: false, // Set wireframes to false to show styles
  },
});

var mouse = Matter.Mouse.create(render.canvas);
// create the camera
var camera = new Camera(render, mouse, render.canvas);
// allow the player to build blocks
let building = new Building(engine, camera);
building.init();
const levelObject = new LevelManager(engine, building);
levelObject.init('testLevel');
document.addEventListener("click", clickHandler);

function startGame() {
  createHTML();
  // show the container
  container.style.display = "block";

  // set the background to a gradient
  render.options.background =
    "linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0, 0.5) 50%, rgba(135, 206, 235) 100%)";

  // play the background music
  setSong("mainTheme");

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

  window.addEventListener("resize", function () {
    setFullScreenCanvas();
  });
  setFullScreenCanvas();

  // Run the engine and the renderer
  Matter.Runner.run(engine);
  Matter.Render.run(render);

  // run the camera
  Matter.Events.on(engine, "beforeUpdate", () => {
    camera.smoothUpdate();
  });

  // update the level object every 10 frames
  Matter.Events.on(engine, "afterUpdate", () => {
    levelObject.update();
  });
  // load the level selector screen
  // after a short delay to allow the levels to load
  const localJSON = localStorage.getItem("level");
//   console.log(localJSON);
  levelObject.load(-1, localJSON);
}
