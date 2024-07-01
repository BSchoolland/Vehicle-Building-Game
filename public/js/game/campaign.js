import Building from "./building.js";
import { Camera } from "./camera.js";import LevelManager from "../level/LevelManager.js";
import { setSong, setMusicVolume, setSoundEffectVolume } from "../sounds/playSound.js";
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
  document.addEventListener(
    "touchend",
    function (event) {
      var now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    },
    false
  );
}
// get the orientation of the screen
let landscape = !window.screen.orientation.type.includes("portrait");
if (!landscape) {
  document.getElementById("game-container").style.display = "none";
  document.getElementById("landscape-warning").style.display = "block";
} else {
  document.getElementById("game-container").style.display = "block";
  document.getElementById("landscape-warning").style.display = "none";
}
// constantly check the orientation of the screen
window.screen.orientation.addEventListener("change", () => {
  if (window.screen.orientation.type.includes("portrait")) {
    document.getElementById("game-container").style.display = "none";
    document.getElementById("landscape-warning").style.display = "block";
    landscape = false;
  } else {
    document.getElementById("game-container").style.display = "block";
    document.getElementById("landscape-warning").style.display = "none";
    landscape = true;
  }
});

let musicPlaying = false;
function clickHandler(event) {
  if (!event.isTrusted) {
    return;
  }
  console.log('clickHandler')
  if (musicPlaying) {
    return;
  }
  // remove the event listener
  document.removeEventListener("click", clickHandler);
  // play the music
  setSong("mainTheme");

  console.log("Music playing");
}

function createHTML() {
  const container = document.getElementById("container");
  // clear the container
  container.innerHTML = "";
}

// create a progress bar
let barContainer = document.getElementById("progress-bar-container");
const steps = [
  "Loading Contraptions",
  "Loading Music",
  "Loading World 1",
  "Loading World 2",
  "Loading World 3",
  "Requesting account data",
];
let progressBar = new ProgressBar(steps, barContainer);

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
startGame();

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

function setFullScreenCanvas() {
  let canvas = render.canvas;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  render.options.width = window.innerWidth;
  render.options.height = window.innerHeight;
  render.bounds.max.x = window.innerWidth;
  render.bounds.max.y = window.innerHeight;
}

function startGame() {
  // wait until loading is done
  if (!progressBar.loaded) {
    setTimeout(startGame, 100);
    return;
  }
  // play the sound
  setSong("mainTheme");

  // Update the UI as necessary
  document.body.style.background = "linear-gradient(0deg, rgba(115,128,142,1) 0%, rgba(84,199,255,1) 100%)";

  createHTML();
  if (landscape) {
    container.style.display = "block";
  }
  render.options.background = "rgba(255, 255, 255, 0)";

  // Fullscreen and render setup
  setFullScreenCanvas();
  window.addEventListener("resize", function () {
    setFullScreenCanvas();
  });

  // Gravity and initial music
  engine.world.gravity.y = 1;
  setSong("mainTheme");

  // Start rendering
  Matter.Render.run(render);

  // Fixed timestep for consistent engine updates
  const fixedDeltaTime = 1000 / 55; // milliseconds, approximately 60Hz
  setInterval(() => {
    Matter.Engine.update(engine, fixedDeltaTime);
  }, fixedDeltaTime);

  // Camera and level update handling
  Matter.Events.on(engine, "beforeUpdate", () => {
    camera.smoothUpdate();
  });
  Matter.Events.on(engine, "afterUpdate", () => {
    levelObject.GameplayHandler.update();
  });

  // Load the initial level selector screen
  levelObject.LevelUI.loadLevelSelector();
}


// handle popups 
// if close settings is pressed, close the settings popuop
let closeSettings = document.getElementById("close-settings");
closeSettings.addEventListener("click", () => {
  let settingsPopup = document.getElementById("settings-popup");
  settingsPopup.classList.add("hidden");
});
// watch for the "music" slider to change
let musicSlider = document.getElementById("music-slider");
// set the music slider to the current volume in local storage
try {
  musicSlider.value = parseFloat(localStorage.getItem("musicVolume")) * musicSlider.max
}
catch {
  musicSlider.value = 0.5 * musicSlider.max;
}
musicSlider.addEventListener("input", () => {
  let volume = musicSlider.value / musicSlider.max;
  console.log("Music volume:", volume);
  // set the volume of the music
  setMusicVolume(volume);
});
// watch for the "sound" slider to change
let soundSlider = document.getElementById("sound-slider");
// set the sound slider to the current volume in local storage
try {
  soundSlider.value = parseFloat(localStorage.getItem("soundEffectVolume")) * soundSlider.max;
} catch {
  soundSlider.value = 0.5 * soundSlider.max;
}soundSlider.addEventListener("input", () => {
  let volume = soundSlider.value / soundSlider.max;
  console.log("Sound volume:", volume);
  
  setSoundEffectVolume(volume);
});

// if the help button is pressed, show the help popup
let helpButton = document.getElementById("help-button");

helpButton.addEventListener("click", () => {
  let helpPopup = document.getElementById("help-popup");
  helpPopup.classList.remove("hidden");
});

// if the close help button is pressed, close the help popup
let closeHelp = document.getElementById("close-help");
closeHelp.addEventListener("click", () => {
  let helpPopup = document.getElementById("help-popup");
  helpPopup.classList.add("hidden");
});