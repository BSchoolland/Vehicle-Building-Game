let loginButton = document.getElementById('login');

if (document.cookie.includes('user')) {
    // switch the button to a logout button
    loginButton.innerHTML = 'Logout';
    loginButton.addEventListener('click', () => {
        // clear all local storage
        localStorage.clear();
        // log the user out
        document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        // reload the page
        location.reload();
        return;
    });
}
else {
    loginButton.addEventListener('click', () => {
        window.location.href = 'login.html';
    });
}