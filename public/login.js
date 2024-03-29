document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const messageBox = document.getElementById("message");

    loginForm.addEventListener("submit", function(e) {
        e.preventDefault(); // Prevent default form submission

        const formData = new FormData(loginForm);
        const username = formData.get("username");
        const password = formData.get("password");

        // Example login request to the server
        fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Handle successful login here
                messageBox.textContent = "Login successful!";
                // Redirect to another page or update the UI accordingly
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
