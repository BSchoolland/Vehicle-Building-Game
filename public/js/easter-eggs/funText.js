document.addEventListener("DOMContentLoaded", function() {
    var paragraphsText = [
        "The game will not display properly in portrait mode.",
        "Some may say this is because the developer is lazy... and they would be right.",
        "But it's also because the game is just better in landscape mode.",
        "I mean, who would even want to play a game in portrait mode?",
        "It's just not right.",
        "I guess if it's like clash royale or something, but this is not clash royale.",
        "This is Wrecking Wheels.",
        "And Wrecking Wheels is a landscape game.",
        "So please, stop reading this text and rotate your device.",
        "Why didn't you rotate your device yet?",
        "Do you not want to play Wrecking Wheels?",
        "Do you not want to have fun?",
        "Fine, I guess you just want to sit here and read pointless text.",
        "Maybe if I stop typing, you'll rotate your device.",
        "I'm going to stop typing now.",
        "",
        "",
        "",
        "",
        "WHY ARE YOU STILL HERE?",
        "GO PLAY THE GAME!",
        "IT'S FUN!",
        "I PROMISE!",
        "...",
        "I... I spent a lot of time on this game.",
        "Please play it.",
        "Please.",
        "Rotate your device.",
        "Okay now I'm done typing for real.",
        "Goodbye."
    ];

    var warningDiv = document.getElementById('landscape-warning');
    var header = document.createElement('h1');
    header.style.textAlign = "center";
    header.textContent = "Please rotate your device to landscape mode to play Wrecking Wheels.";
    warningDiv.appendChild(header);

    var index = 0;
    var timeoutId;

    function displayNextParagraph() {
        // Remove the previous paragraph if it exists
        var existingParagraph = warningDiv.querySelector('p');
        if (existingParagraph) {
            warningDiv.removeChild(existingParagraph);
        }

        // Add the next paragraph if any are left
        if (index < paragraphsText.length) {
            var p = document.createElement('p');
            // display the p centered
            p.style.textAlign = "center";
            p.textContent = paragraphsText[index];
            warningDiv.appendChild(p);
            index++;
            // if the div is not being displayed, clear the timeout
            if (window.getComputedStyle(warningDiv).display !== "block") {
                index = 0;
            }
            timeoutId = setTimeout(displayNextParagraph, 12000); // Delay between paragraphs in milliseconds
        }
    }

    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === "attributes" && mutation.attributeName === "style") {
                var displayStyle = window.getComputedStyle(mutation.target).display;
                if (displayStyle === "block" && index === 0) {
                    displayNextParagraph();
                }
            }
        });
    });

    // Start observing changes in style attribute
    observer.observe(warningDiv, { attributes: true });

    // Check initial state and act accordingly
    if (window.getComputedStyle(warningDiv).display === "block") {
        displayNextParagraph();
    }
});
