// Path: public/js/sounds/playSound.js
let audioContext = new (window.AudioContext || window.webkitAudioContext)();

// music
let mainTheme, buildTheme, levelTheme

async function loadSound(url) {
    try {
        const response = await fetch('./js/sounds/music/mainTheme.mp3');
        const arrayBuffer = await response.arrayBuffer();
        return await audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
        console.error('Error loading sound:', error);
    }
}

// Load the sounds
Promise.all([
    loadSound('./public/js/sounds/music/mainTheme.mp3'
    ).then(buffer => mainTheme = buffer),
    loadSound('./music/buildTheme.mp3').then(buffer => buildTheme = buffer),
    loadSound('./music/mainTheme.mp3').then(buffer => levelTheme = buffer)
  ]).then(() => {
    console.log("All sounds loaded");
    // Now you can play these sounds whenever you need
  });




function playSound(SoundName, looped = false) {
    // get the buffer
    let audioBuffer;
    if (SoundName === 'mainTheme') {
        audioBuffer = mainTheme;
    } else if (SoundName === 'buildTheme') {
        audioBuffer = buildTheme;
    } else if (SoundName === 'levelTheme') {
        audioBuffer = levelTheme;
    }

    let source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
    if (looped) {
        source.loop = true;
    }
}


export {
    playSound
}