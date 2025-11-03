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
        authSection.classList.add('hidden');
        protectedSection.classList.remove('hidden');
        errorMessage.textContent = '';
    } else {
        // User is logged out
        authSection.classList.remove('hidden');
        protectedSection.classList.add('hidden');
    }
}

// Event Listener for the Login Form
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    const { error } = await signInUser(email, password);

    if (error) {
        errorMessage.textContent = `Error: ${error.message}`;
    } else {
        errorMessage.textContent = '';
        // The onAuthStateChange listener will handle the UI update
    }
});

// Event Listener for the Logout Button
logoutButton.addEventListener('click', async () => {
    await signOutUser();
    // The onAuthStateChange listener will handle the UI update
});

// Initial check and listener for authentication state changes
onAuthStateChange(user => {
    updateUserInterface(user);
});
