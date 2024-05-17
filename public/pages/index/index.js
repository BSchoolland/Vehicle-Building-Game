import Building from "../../js/game/building.js";
import { Camera } from "../../js/game/camera.js";
import LevelManager from "../../js/level/LevelManager.js";
import { setSong, setMusicVolume, setSoundEffectVolume } from "../../js/sounds/playSound.js";

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
// if the settings button is clicked, show the settings popup
let settingsButton = document.getElementById("settings-button");
settingsButton.addEventListener("click", () => {
  let settingsPopup = document.getElementById("settings-popup");
  settingsPopup.classList.remove("hidden");
});
// if close settings is pressed, close the settings popuop
let closeSettings = document.getElementById("close-settings");
closeSettings.addEventListener("click", () => {
  let settingsPopup = document.getElementById("settings-popup");
  settingsPopup.classList.add("hidden");
});

// watch for the "music" slider to change
let musicSlider = document.getElementById("music-slider");
// set the music slider to the current volume in local storage
musicSlider.value = localStorage.getItem("musicVolume") * musicSlider.max || 0.5 * musicSlider.max;
musicSlider.addEventListener("input", () => {
  let volume = musicSlider.value / musicSlider.max;
  console.log("Music volume:", volume);
  // set the volume of the music
  setMusicVolume(volume);
});
// watch for the "sound" slider to change
let soundSlider = document.getElementById("sound-slider");
// set the sound slider to the current volume in local storage
soundSlider.value = localStorage.getItem("soundEffectVolume") * soundSlider.max || 0.5 * soundSlider.max;
soundSlider.addEventListener("input", () => {
  let volume = soundSlider.value / soundSlider.max;
  console.log("Sound volume:", volume);
  
  setSoundEffectVolume(volume);
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

// play the sound as soon as the user interacts with anything
document.addEventListener("click", function playSound() {
  // play the sound
  setSong("mainTheme");

  // remove the event listener after it's triggered
  document.removeEventListener("click", playSound);
});

// set the background to fully transparent
render.options.background = "rgba(255, 255, 255, 0)";
// get rid of the border
render.canvas.style.border = "none";


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
Matter.Render.run(render);

// Fixed timestep for consistent engine updates
const fixedDeltaTime = 1000 / 60; // milliseconds, approximately 60Hz
setInterval(() => {
  Matter.Engine.update(engine, fixedDeltaTime);
}, fixedDeltaTime);

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

  function startInterval() {
    console.log("starting interval");
    intervalId = setInterval(() => {
      levelObject.LevelLoader.respawnEnemies(); // wait a random amount of time
    }, 9000);
  }

  startInterval(); // Start the interval when the page loads

  window.addEventListener("blur", (event) => {
    clearInterval(intervalId);
    console.log("cleared interval");
  });

  window.addEventListener("focus", startInterval);
}

import LevelHandler from "/js/loaders/levelHandler.js";
// start the level handler (required for syncing data with the server)
const levelHandler = new LevelHandler();

const loginForm = document.getElementById("login-form");
const messageBox = document.getElementById("message");
loginForm.addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent default form submission
  console.log("Login form submitted");

  const formData = new FormData(loginForm);
  const username = formData.get("username");
  const password = formData.get("password");

  // Example login request to the server
  fetch("api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // wait for the level handler to finish loading
        let checkInterval = setInterval(() => {
          console.log("Checking if levels are loaded");
          if (levelHandler.isLoaded) {
            console.log("Levels are loaded");
            // stop the interval
            clearInterval(checkInterval);
            // sync the levels with the server
            levelHandler.syncLevelsBeat();
            // Redirect to the home page
            window.location.href = "/";
          }
        }, 500);
      } else {
        // Handle login failure here
        messageBox.textContent = "Login failed: " + data.message;
      }
    })
    .catch((error) => {
      console.error("Error during login:", error);
      messageBox.textContent = "Login error, please try again later.";
    });
});

const registerForm = document.getElementById("register-form");
const messageBox2 = document.getElementById("message2");

registerForm.addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent default form submission

  const formData = new FormData(registerForm);
  const username = formData.get("username-create");
  const email = formData.get("email-create");
  const password = formData.get("password-create");
  const confirmPassword = formData.get("confirm-password-create");

  // Simple client-side check for matching passwords
  if (password !== confirmPassword) {
    messageBox2.textContent = "Passwords do not match.";
    return;
  }
  // require a somewhat secure password
  if (password.length < 8) {
    messageBox2.textContent = "Password must be at least 8 characters long.";
    return;
  }

  // send the registration request to the server
  fetch("api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "User registered successfully") {
        // Registration was successful
        alert("Registration successful! Please log in.");
        // open the login popup
        let loginPopup = document.getElementById("login-popup");
        loginPopup.classList.remove("hidden");
        // close the register popup
        let registerPopup = document.getElementById("register-popup");
        registerPopup.classList.add("hidden");
      } else {
        // Check for specific errors like duplicate email or username
        if (data.errorCode === "DUPLICATE_EMAIL") {
          messageBox2.textContent =
            "The email address " + email + " is already in use.";
        } else if (data.errorCode === "DUPLICATE_USERNAME") {
          messageBox2.textContent =
            "The username" + username + " is already taken.";
        } else {
          // Handle other registration failures not specified above
          messageBox2.textContent = "Registration failed: " + data.message;
        }
      }
    })
    .catch((error) => {
      console.error("Error during registration:", error);
      messageBox2.textContent = "Registration error, please try again later.";
    });
});
