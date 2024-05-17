document.addEventListener('DOMContentLoaded', function() {
    // Handle suggestion form submission
    const suggestionForm = document.getElementById('suggestions'); // Check the ID, it might be a typo ('suggesions' -> 'suggestions')
    suggestionForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way

        const formData = new FormData(suggestionForm);
        const suggestionData = Object.fromEntries(formData.entries());

        // Example of sending the suggestion data to a server
        fetch('/submitSuggestion', { // Replace '/submitSuggestion' with your actual endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(suggestionData),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            // You might want to display a success message or clear the form here
        })
        .catch((error) => {
            console.error('Error:', error);
            // Handle errors here, such as displaying an error message to the user
        });
    });

    // Handle votes on future features
    document.querySelectorAll('.vote .feature button').forEach(button => {
        button.addEventListener('click', function() {
            const featureName = this.previousElementSibling.previousElementSibling.textContent; // Assuming the structure doesn't change
            console.log(`Voting for feature: ${featureName}`); // For debugging purposes
            
            // Example of sending the vote to a server
            fetch('YOUR_ENDPOINT_HERE', { // Replace 'YOUR_ENDPOINT_HERE' with your voting endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ feature: featureName }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Vote successful:', data);
                // Update the UI to reflect the vote, like disabling the button or showing a vote count
            })
            .catch(error => {
                console.error('Error voting:', error);
                // Handle errors here
            });
        });
    });
});
