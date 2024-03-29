document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const messageBox = document.getElementById("message");

    registerForm.addEventListener("submit", function(e) {
        e.preventDefault(); // Prevent default form submission

        const formData = new FormData(registerForm);
        const username = formData.get("username");
        const email = formData.get("email");
        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");

        // Simple client-side check for matching passwords
        if (password !== confirmPassword) {
            messageBox.textContent = "Passwords do not match.";
            return;
        }
        // require a somewhat secure password
        if (password.length < 8) {
            messageBox.textContent = "Password must be at least 8 characters long.";
            return;
        }

        // send the registration request to the server
        fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, email, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Registration was successful
                messageBox.textContent = "Registration successful!";
                // Redirect to the login page
                window.location.href = '/login';
            } else {
                // Check for specific errors like duplicate email or username
                if (data.errorCode === "DUPLICATE_EMAIL") {
                    messageBox.textContent = "The email address " + email + " is already in use.";
                } else if (data.errorCode === "DUPLICATE_USERNAME") {
                    messageBox.textContent = "The username" + username + " is already taken.";
                } else {
                    // Handle other registration failures not specified above
                    messageBox.textContent = "Registration failed: " + data.message;
                }
            }
        })
        .catch(error => {
            console.error("Error during registration:", error);
            messageBox.textContent = "Registration error, please try again later.";
        });
    });
});
