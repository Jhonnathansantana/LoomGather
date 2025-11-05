// app.js
import { signInUser, signOutUser, onAuthStateChange } from './src/auth.js';

// DOM Elements
const authSection = document.getElementById('auth-section');
const protectedSection = document.getElementById('protected-section');
const loginForm = document.getElementById('login-form');
const logoutButton = document.getElementById('logout-button');
const errorMessage = document.getElementById('error-message');

/**
 * Updates the UI based on the user's authentication state.
 * @param {object|null} user - The user object or null if not logged in.
 */
function updateUserInterface(user) {
    if (user) {
        // User is logged in
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } else {
        // User is logged out
        if (authSection) authSection.classList.remove('hidden');
        if (protectedSection) protectedSection.classList.add('hidden');
    }
}

// Event Listener for the Login Form
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = event.target.email.value;
        const password = event.target.password.value;

        const { error } = await signInUser(email, password);

        if (error) {
            if (errorMessage) errorMessage.textContent = `Error: ${error.message}`;
        } else {
            if (errorMessage) errorMessage.textContent = '';
            // The onAuthStateChange listener will handle the UI update
        }
    });
}

// Event Listener for the Logout Button
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        await signOutUser();
        window.location.href = 'index.html';
    });
}

// Initial check and listener for authentication state changes
onAuthStateChange(user => {
    // This logic needs to be smart about which page we are on.
    const currentPage = window.location.pathname.split('/').pop();

    if (user) {
        // If the user is logged in, they should not be on the login page.
        if (currentPage === 'index.html' || currentPage === '') {
            window.location.href = 'dashboard.html';
        }
    } else {
        // If the user is not logged in, they should be on the login page.
        if (currentPage !== 'index.html' && currentPage !== '') {
            window.location.href = 'index.html';
        }
    }
});
