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
            location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    // make the buton the user has already voted on goldenrod
    const myVote = localStorage.getItem('myVote');
    if (myVote !== null) {
        console.log('myVote:', myVote);
        const myVoteButton = document.querySelector(`.vote-button[data-feature-id="${myVote}"]`);
        if (myVoteButton !== null) { 
            myVoteButton.style.backgroundColor = 'goldenrod';
        }
    }

    voteButtons.forEach(button => {
        button.addEventListener('click', function() {
            // if the user is not logged in, redirect to the login page
            if (!document.cookie.includes('user')) {
                window.location.href = '/login.html';
            }
            const featureId = this.getAttribute('data-feature-id');
            // set the local myVote variable to the value of the data-vote attribute
            localStorage.setItem('myVote', this.getAttribute('data-feature-id'));
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
                // reload the page
                location.reload();
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });
});


// Check if the user is logged in
if (document.cookie.includes('user')) {
    console.log('logged in!')
    // change the text in all vote-button classes to "vote"
    const voteButtons = document.querySelectorAll('.vote-button');
    voteButtons.forEach(button => {
        button.innerHTML = 'Vote';
    });
    // remove any logged-out-only classes
    const loggedOutOnly = document.querySelectorAll('.logged-out-only');
    loggedOutOnly.forEach(element => {
        element.remove();
    });
}
else {
    
}