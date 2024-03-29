
// when the button is clicked, start the game
let button = document.getElementById('start-game');
button.addEventListener('click', () => {
    // if the user is on mobile, warn them that the game may not work well
    if (window.innerWidth < 800 || window.innerHeight < 600) {
        alert("WAIT! This game is not optomized for mobile! PLEASE play on a computer.  I can't stop you though, any more than I can stop you from just using a seat and a rocket booster to beat my most complicated levels. :(");
    }
    window.location.href = 'levels.html';
});
// when the other button is clicked, go to the change log
let changeButton = document.getElementById('change-log');
changeButton.addEventListener('click', () => {
    window.location.href = 'changeLog.html';
});