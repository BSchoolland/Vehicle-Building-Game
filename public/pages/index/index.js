import Building from "../../js/game/building.js";
import { Camera } from "../../js/game/camera.js";
import LevelManager from "../../js/level/LevelManager.js";
import { setSong } from "../../js/sounds/playSound.js";

let loginButton = document.getElementById("login");

if (document.cookie.includes("user")) {
  // switch the button to a logout button
  loginButton.innerHTML = "Logout";
  loginButton.addEventListener("click", () => {
    // clear all local storage
    localStorage.clear();
    // log the user out
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // reload the page
    location.reload();
    return;
  });
} else {
  loginButton.addEventListener("click", () => {
    // remove the hidden class from the login popup
    let loginPopup = document.getElementById("login-popup");
    loginPopup.classList.remove("hidden");
  });
}

// if the close button is clicked, hide the popup
let closeButton = document.getElementById("close-login");
closeButton.addEventListener("click", () => {
  let loginPopup = document.getElementById("login-popup");
  loginPopup.classList.add("hidden");
});
// if the register close button is clicked, hide the popup
let registerCloseButton = document.getElementById("close-register");
registerCloseButton.addEventListener("click", () => {
  let registerPopup = document.getElementById("register-popup");
  registerPopup.classList.add("hidden");
});
// if the register button is clicked, show the register popup
let registerButton = document.getElementById("register-button");
registerButton.addEventListener("click", () => {
  let registerPopup = document.getElementById("register-popup");
  registerPopup.classList.remove("hidden");
  // hide the login popup
  let loginPopup = document.getElementById("login-popup");
  loginPopup.classList.add("hidden");
});
// if the login button is clicked, show the login popup
let loginButton2 = document.getElementById("login-button");
loginButton2.addEventListener("click", () => {
  let loginPopup = document.getElementById("login-popup");
  loginPopup.classList.remove("hidden");
  // hide the register popup
  let registerPopup = document.getElementById("register-popup");
  registerPopup.classList.add("hidden");
});

// Create an engine
var engine = Matter.Engine.create();

// Create a renderer
var container = document.getElementById("game-container");

container.style.position = "absolute";
// translate the container left and up half the width and height of the screen
container.style.transform = "translate(-10px, 10px)";

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
levelObject.init();

// play the sound
setSong("mainTheme");

// set the background to fully transparent
render.options.background = "rgba(255, 255, 255, 0)";
// get rid of the border
render.canvas.style.border = "none";

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
  levelObject.GameplayHandler.update();
});
// fetch the level json from a file
let path = "../../json-levels/title/index.json";
let response = await fetch(path);
if (response.ok) {
    const levelData = JSON.stringify(await response.json());
    // load the level
    levelObject.LevelLoader.load(0, levelData, false);
    levelObject.GameplayHandler.startLevel();
    // run the camera
  Matter.Events.on(engine, "beforeUpdate", () => {
    camera.smoothUpdate();
  });

  // update the level object every 10 frames
  Matter.Events.on(engine, "afterUpdate", () => {
    levelObject.GameplayHandler.update();
  });
  let intervalId;

  // function startInterval() {
  //   console.log("starting interval");
  //   intervalId = setInterval(() => {
  //     levelObject.LevelLoader.respawnEnemies(); // wait a random amount of time 
  //   }, 9000);
  // }
  
  startInterval(); // Start the interval when the page loads

  window.addEventListener('blur', (event) => {
    clearInterval(intervalId);
    console.log("cleared interval");
  });

  window.addEventListener('focus', startInterval);
} 
