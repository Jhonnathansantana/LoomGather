// src/auth.js
import { supabase } from './supabaseClient.js';

/**
 * Signs in the user using email and password.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<{session: object, error: object}>}
 */
export async function signInUser(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });
    return { data, error };
}

/**
 * Signs out the current user.
 * @returns {Promise<{error: object}>}
 */
export async function signOutUser() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

/**
 * Checks the current session to see if a user is logged in.
 * @returns {Promise<object|null>} The user object if logged in, otherwise null.
 */
export async function getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    return session ? session.user : null;
}

/**
 * Listens for changes in the authentication state.
 * @param {function} callback - The function to call when the auth state changes.
 */
export function onAuthStateChange(callback) {
    supabase.auth.onAuthStateChange((event, session) => {
        callback(session ? session.user : null);
    });
}
