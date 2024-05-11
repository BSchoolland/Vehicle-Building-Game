import Building from "./building.js";
import { Camera } from "./camera.js";
// import { LevelManager } from "../world/level.js";
import LevelManager from "../level/LevelManager.js";
import { setSong } from "../sounds/playSound.js";
import ProgressBar from "../loaders/progressBar.js";

// if the user is on mobile, warn them that the game may not work well
if (window.innerWidth < 800 || window.innerHeight < 600) {
  // alert("Again, I really do suggest you play on a computer.  The experience is much better.  If you choose to ignore me, be ready for unbeatable levels, and more bugs than a termite farm.  You have been warned.");
  // if the user is on mobile, disable zooming
  document.addEventListener("gesturestart", function (e) {
    e.preventDefault();
  });
  // if the user is on mobile, disable zooming
  document.addEventListener("touchmove", function (e) {
    e.preventDefault();
  });
  // if the user is on mobile, disable zooming
  var lastTouchEnd = 0;
  document.addEventListener('touchend', function(event) {
    var now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

}
// get the orientation of the screen
let landscape = !window.screen.orientation.type.includes('portrait');
if (!landscape) {
  document.getElementById("game-container").style.display = "none";
  document.getElementById("landscape-warning").style.display = "block";
}
else {
  document.getElementById("game-container").style.display = "block";
  document.getElementById("landscape-warning").style.display = "none";
}
// constantly check the orientation of the screen
window.screen.orientation.addEventListener("change", () => {
  if (window.screen.orientation.type.includes('portrait')) {
    document.getElementById("game-container").style.display = "none";
    document.getElementById("landscape-warning").style.display = "block";
    landscape = false;
  }
  else {
    document.getElementById("game-container").style.display = "block";
    document.getElementById("landscape-warning").style.display = "none";
    landscape = true;
  }
});

let gameStarted = false;
function clickHandler() {
  if (gameStarted) {
    return;
  }
  gameStarted = true;
  // remove the event listener
  document.removeEventListener("click", clickHandler);
  // start the game
  startGame();
}

function createHTML() {
  const container = document.getElementById("container");
  // clear the container
  container.innerHTML = "";
}

// create a progress bar
let barContainer = document.getElementById("progress-bar-container");
const steps = ["Loading Contraptions", "Loading Music", "Loading World 1", "Loading World 2", "Loading World 3", "Requesting account data"];
let progressBar = new ProgressBar(steps, barContainer );

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
const levelObject = new LevelManager(engine, building, progressBar);
levelObject.init();
document.addEventListener("click", clickHandler);

function checkMusicLoaded() {
  // try to play the music
  let success = setSong("mainTheme");
  if (success) {
    musicLoaded = true;
  }
  if (musicLoaded) {
    progressBar.update();
  } else {
    setTimeout(checkMusicLoaded, 100);
  }
}


// create a loop to update the progress bar
let musicLoaded = false;
checkMusicLoaded();


function startGame() {
  // wait until loading is done
  if (!progressBar.loaded) {
    setTimeout(startGame, 100);
    return;
  }
  // play the sound
  setSong("mainTheme");
  // make the background a gradient
  document.body.style.background = "linear-gradient(0deg, rgba(115,128,142,1) 0%, rgba(84,199,255,1) 100%)";
  // // make the body white
  // document.body.style.backgroundColor = "white";
  createHTML();
  // show the container
  if (landscape) {
    container.style.display = "block";
  }

  

  // set the background to fully transparent
  render.options.background =
    "rgba(255, 255, 255, 0)";

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

// Set the time scale to real-time
engine.timing.timeScale = 1;
// Set gravity
engine.world.gravity.y = 1;


// Create a circle at a more practical location
let circle = Matter.Bodies.circle(10000, 10000, 10, {
  isStatic: false
});

// remove air resistance from the circle
circle.frictionAir = 0;

// Set initial velocity, assuming horizontal motion
const initialVelocity = 10; // distance per frame (likely in cm)
Matter.Body.setVelocity(circle, { x: initialVelocity, y: 0 });

// Add the circle to the world
Matter.World.add(engine.world, circle);

// Initial setup for measurement
let counter = 0;
const framesPerSecond = 60; // Adjust based on your expected frame rate
const durationInSeconds = 1; // We want to measure the distance after one second
const desiredFrames = framesPerSecond * durationInSeconds;
let firstX = circle.position.x; // Start position for distance measurement
let firstY = circle.position.y;
let startTime = Date.now();

// Define the event listener as a named function
const afterUpdateListener = () => {
  counter++;
  if (counter >= desiredFrames) {
    let endTime = Date.now();
    let elapsedSeconds = (endTime - startTime) / 1000; // time elapsed in seconds
    let x = circle.position.x;
    let distance = x - firstX; // distance traveled
    console.log("<--- DEBUG FOR GRAVITY --->")
    console.log(`Time elapsed (should be ~1): ${elapsedSeconds.toFixed(2)} s, Frames watched: ${counter}`);
    console.log("Desired time: ", durationInSeconds, "s", "Actual gravity: ", engine.world.gravity.y);
    console.log(`X Distance traveled (should be ~600): ${distance}`);
    console.log(`Y Distance traveled (should be ~525): ${circle.position.y - firstY}`);
    // log the measured frame rate
    console.log(`Measured frame rate (should be ~60): ${counter / elapsedSeconds}`);
    // calculate the Measured gravity based on the y distance traveled
    let MeasuredGravity = 2 * (circle.position.y - firstY) / (elapsedSeconds * elapsedSeconds);
    console.log(`Measured gravity (should be ~1000): ${MeasuredGravity.toFixed(2)}`);
    // Clean-up and remove event listener
    Matter.World.remove(engine.world, circle);
    Matter.Events.off(engine, "afterUpdate", afterUpdateListener);
    console.log("<--- END DEBUG FOR GRAVITY --->")
  }
};

// Add the event listener to the engine
Matter.Events.on(engine, "afterUpdate", afterUpdateListener);
  // run the camera
  Matter.Events.on(engine, "beforeUpdate", () => {
    camera.smoothUpdate();
  });

  // update the level object every 10 frames
  Matter.Events.on(engine, "afterUpdate", () => {
    levelObject.GameplayHandler.update();
  });
  // load the level selector screen
  // after a short delay to allow the levels to load

  levelObject.LevelUI.loadLevelSelector();
}
