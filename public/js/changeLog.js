document.addEventListener('DOMContentLoaded', function() {
    const suggestionForm = document.getElementById('suggesions');
    const voteButtons = document.querySelectorAll('.vote-button');

    suggestionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const suggestion = document.getElementById('suggestion').value;

        fetch('/api/submitSuggestion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Cookie is automatically included with the request due to the "credentials: include"
            },
            credentials: 'include', // Ensures cookies are sent with the request
            body: JSON.stringify({ suggestion: suggestion })
        })
        .then(response => {
            if(response.ok) {
                return response.json();
            }
            throw new Error('Failed to submit suggestion');
        })
        .then(data => {
            alert('Suggestion submitted successfully');
            // Clear the form or update the UI as needed
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    voteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const featureId = this.getAttribute('data-feature-id');

            fetch('/api/voteFeature', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Ensures cookies are sent with the request
                body: JSON.stringify({ featureId: featureId })
            })
            .then(response => {
                if(response.ok) {
                    return response.json();
                }
                throw new Error('Failed to register vote');
            })
            .then(data => {
                alert('Vote registered successfully');
                // Update the UI to reflect the vote
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });
});