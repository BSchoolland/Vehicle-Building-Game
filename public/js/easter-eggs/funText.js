function displayIgnoreButton(warningDiv, time = 0) {
        // after 3 seconds, create a button to dismiss the warning
        setTimeout(function() {
            var button = document.createElement('button');
            button.textContent = "I'm not in portrait mode!";
            button.style.margin = "auto";
            button.style.display = "block";
            button.style.width = "auto";
            button.style.height = "50px";
            button.style.fontSize = "16px";
            button.style.cursor = "pointer";
            button.style.backgroundColor = "#4CAF50";
            button.style.color = "white";
            button.style.border = "none";
            button.style.borderRadius = "5px";
            button.style.outline = "none";
            button.style.textAlign = "center";
            button.style.lineHeight = "50px";
            button.style.textDecoration = "none";
            button.style.textTransform = "uppercase";
            button.style.boxShadow = "0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2)";
            button.style.transition = "box-shadow 0.2s";
            button.onclick = function() {
                warningDiv.style.display = "none";
                document.getElementById("game-container").style.display = "block";
                try {
                    document.getElementById("main-container").style.display = "block";
                } catch (e) {
                    console.log("No main-container found");
                }
                clearTimeout(timeoutId);
            };
            warningDiv.appendChild(button);
        }
        , time);
    }

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

    displayIgnoreButton(warningDiv, 3000);

    var index = 0;

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
            // remove the button if it exists
            var existingButton = warningDiv.querySelector('button');
            if (existingButton) {
                warningDiv.removeChild(existingButton);
            }
            // re add the button
            displayIgnoreButton();
            warningDiv.appendChild(p);
            index++;
            // if the div is not being displayed, clear the timeout
            if (window.getComputedStyle(warningDiv).display !== "block") {
                index = 0;
            }
            timeoutId = setTimeout(displayNextParagraph, 12000); // Delay between paragraphs in milliseconds
        }
    }

    // Debounce function
    function debounce(func, wait) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === "attributes" && mutation.attributeName === "style") {
                var displayStyle = window.getComputedStyle(mutation.target).display;
                if (displayStyle === "block" && index === 0) {
                    // Call the debounced version of displayNextParagraph
                    debouncedDisplayNextParagraph();
                }
            }
        });
    });

    // Start observing changes in style attribute
    observer.observe(warningDiv, { attributes: true });

    // Debounced version of displayNextParagraph with a 250ms wait
    var debouncedDisplayNextParagraph = debounce(displayNextParagraph, 250);

    // Check initial state and act accordingly
    if (window.getComputedStyle(warningDiv).display === "block") {
        displayNextParagraph();
    }
});
