// js/signup.js

// Define the base URL for your API.
// !!! IMPORTANT: Replace with your ACTUAL backend URL !!!
const API_BASE_URL = 'https://tinkerhub-0pse.onrender.com'; // e.g., 'https://tinkerhub-nssce-api.onrender.com'
// const API_BASE_URL = 'http://localhost:5000'; // For local testing

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const nameInput = document.getElementById('signup-name');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const confirmPasswordInput = document.getElementById('signup-confirm-password');
    const statusDiv = document.getElementById('signup-status');
    const submitButton = signupForm ? signupForm.querySelector('button[type="submit"]') : null;

    if (!signupForm || !nameInput || !emailInput || !passwordInput || !confirmPasswordInput || !statusDiv || !submitButton) {
        console.error("Signup form elements missing! Check IDs in signup.html.");
        if (statusDiv) statusDiv.innerHTML = '<p class="error" style="color:red;">Page loading error.</p>';
        return;
    }

    const setStatus = (message, isError = false) => {
        statusDiv.innerHTML = `<p class="${isError ? 'error' : 'success'}">${message}</p>`;
        statusDiv.style.display = 'block';
    };

    const clearStatus = () => {
        statusDiv.innerHTML = '';
        statusDiv.style.display = 'none';
    };

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission
        clearStatus(); // Clear previous messages

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value; // Don't trim password
        const confirmPassword = confirmPasswordInput.value;

        // --- Client-side Validation ---
        if (!name || !email || !password || !confirmPassword) {
            setStatus('Please fill in all fields.', true);
            return;
        }
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
             setStatus('Please enter a valid email address.', true);
             return;
        }
        if (password.length < 6) {
            setStatus('Password must be at least 6 characters long.', true);
            return;
        }
        if (password !== confirmPassword) {
            setStatus('Passwords do not match.', true);
            return;
        }
        // --- End Validation ---

        submitButton.disabled = true;
        submitButton.textContent = 'Signing Up...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/signup`, { // Use the new signup route
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                    // No need to send role, backend defaults to 'student'
                })
            });

            const result = await response.json();

            if (!response.ok) {
                // Use message from backend response if available
                throw new Error(result.message || `Registration failed: ${response.statusText}`);
            }

            // SUCCESS
            setStatus('Registration successful! You can now <a href="admin/login.html">log in</a>.', false); // Use success class styling
            signupForm.reset(); // Clear the form

        } catch (error) {
            console.error('Signup Error:', error);
            setStatus(error.message || 'An unexpected error occurred during signup.', true);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Sign Up';
        }
    });

});