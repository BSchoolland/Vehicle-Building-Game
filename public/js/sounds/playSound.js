// Path: public/js/sounds/playSound.js
let audioContext = new (window.AudioContext || window.webkitAudioContext)();

// music
const music = {
  mainTheme: "./js/sounds/music/mainTheme.mp3",
  buildTheme: "./js/sounds/music/buildTheme.mp3",
  levelTheme: "./js/sounds/music/mainTheme.mp3", // FIXME: make a level theme
};
// sound effects
const effects = {
  explosion1: "./js/sounds/effects/explosion1.mp3",
  explosion2: "./js/sounds/effects/explosion2.mp3",
  explosion3: "./js/sounds/effects/explosion3.mp3",
  blockTakesDamage1: "./js/sounds/effects/blockTakesDamage1.mp3",
  blockTakesDamage2: "./js/sounds/effects/blockTakesDamage2.mp3",
  blockTakesDamage3: "./js/sounds/effects/blockTakesDamage3.mp3",
  rocketFlame: "./js/sounds/effects/rocketFlame.mp3",
  // disconnect: "./js/sounds/effects/disconnect.mp3",
  // electricMotor: "./js/sounds/effects/electricMotor.mp3",
  grappleFire: "./js/sounds/effects/grappleFire.mp3",
  grappleReel: "./js/sounds/effects/grappleReel.mp3",
  coin: "./js/sounds/level/coin.mp3",
  win: "./js/sounds/longEffects/win.mp3",
  error: "./js/sounds/level/error.mp3",
  placeBlock: "./js/sounds/level/placeBlock.mp3",
  removeBlock: "./js/sounds/level/removeBlock.mp3",
  rotateBlock: "./js/sounds/level/rotateBlock.mp3",
  selectBlock: "./js/sounds/level/selectBlock.mp3",
  selectLevel: "./js/sounds/level/selectLevel.mp3",
};

const unlimitedSounds = ["coin", "win", "error", "placeBlock", "removeBlock", "rotateBlock", "selectBlock", "selectLevel"];

async function loadSound(url) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await audioContext.decodeAudioData(arrayBuffer);
  } catch (error) {
    console.error("Error loading sound:", error);
  }
}
// pre-load the music
let loadedSongs = {};
Promise.all(
  Object.entries(music).map(async ([name, url]) => {
    loadedSongs[name] = await loadSound(url);
  })
).then(() => {
  console.log("Music loaded");
});
// pre-load the sound effects
let loadedSounds = {};
Promise.all(
  Object.entries(effects).map(async ([name, url]) => {
    loadedSounds[name] = await loadSound(url);
  })
).then(() => {
  console.log("Effects loaded");
});

let playingSounds = {}; // track the sounds that are currently playing, so that the same sound can't be played twice at the same time

const soundGainNode = audioContext.createGain();
soundGainNode.gain.value = localStorage.getItem("soundEffectVolume") / 2 || 0.25;
soundGainNode.connect(audioContext.destination);

function playSound(name) {
    // if the sound is already playing x times, don't play it again
    if (playingSounds[name] >= 2) {
      if (!unlimitedSounds.includes(name)){
        return;
      }
    }
    // add the sound to the playingSounds object
    playingSounds[name] = (playingSounds[name] || 0) + 1;
      // if the name is 'explosion', play a random explosion sound
    if (name === 'explosion') {
        let random = Math.floor(Math.random() * 3) + 1;
        name = `explosion${random}`;
    }
    // if the name is 'blockTakesDamage', play a random blockTakesDamage sound
    if (name === 'blockTakesDamage') {
        let random = Math.floor(Math.random() * 3) + 1;
        name = `blockTakesDamage${random}`;
    }
  let buffer = loadedSounds[name];
  if (!buffer) {
    console.error("Sound not found:", name);
    return false;
  }
  let source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(soundGainNode);
  source.start();
  // get the duration of the sound
    let duration = buffer.duration;
    // remove the sound from the playingSounds object after the sound has finished playing
    setTimeout(() => {
        //if the name ends with a number, remove the number
        if (name.match(/\d+$/)) {
            name = name.replace(/\d+$/, '');
        }
        playingSounds[name] -= 1;
        if (playingSounds[name] <= 0) {
            delete playingSounds[name];
        }
    }, duration * 1000);
}

let currentSong = null;
const musicGainNode = audioContext.createGain();
musicGainNode.gain.value = localStorage.getItem("musicVolume") || 0.5;
musicGainNode.connect(audioContext.destination);

function setSong(songName) {
  // If there is already a song playing, stop it
  if (currentSong) {
    currentSong.stop();
    currentSong = null;
  }
  // Get the buffer for the song
  let songBuffer = loadedSongs[songName];
  if (!songBuffer) {
    // console.error("Song not found:", songName);
    return false;
  }

  // If a valid song name was provided, play the song
  if (songBuffer) {
    currentSong = audioContext.createBufferSource();
    currentSong.buffer = songBuffer;
    currentSong.connect(musicGainNode);
    currentSong.start();
    // loop the song
    currentSong.loop = true;
  }
  return true;
}


function setMusicVolume(volume) {
  // save the new volume to local storage
  localStorage.setItem("musicVolume", volume);
  // update the gain node
  musicGainNode.gain.value = volume;
}

function setSoundEffectVolume(volume) {
  // save the new volume to local storage
  localStorage.setItem("soundEffectVolume", volume);
  // update the gain node
  soundGainNode.gain.value = volume / 2; // sound effects are too loud, so divide by 2
}

export { setSong, playSound, setMusicVolume, setSoundEffectVolume };