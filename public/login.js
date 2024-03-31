import LevelHandler from "./js/loaders/levelHandler.js";
// start the level handler (required for syncing data with the server)
const levelHandler = new LevelHandler();

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const messageBox = document.getElementById("message");

    loginForm.addEventListener("submit", function(e) {
        e.preventDefault(); // Prevent default form submission

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
        .then(response => response.json())
        .then(data => {
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
                        window.location.href = '/';
                    }
                }, 500);

            } else {
                // Handle login failure here
                messageBox.textContent = "Login failed: " + data.message;
            }
        })
        .catch(error => {
            console.error("Error during login:", error);
            messageBox.textContent = "Login error, please try again later.";
        });
    });
});
