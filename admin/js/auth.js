// admin/js/auth.js

// Define the base URL for your API.
// !!! IMPORTANT: Replace with your ACTUAL backend URL !!!
// const API_BASE_URL = 'YOUR_RENDER_BACKEND_URL_HERE'; // e.g., 'https://tinkerhub-nssce-api.onrender.com'
const API_BASE_URL = 'http://localhost:5000'; // For local testing

const form = document.getElementById('login-form');
const errorDisplay = document.getElementById('login-error');
const emailInput = document.getElementById('email'); // Get email input
const passwordInput = document.getElementById('password'); // Get password input

// --- Check if elements exist ---
if (!form || !errorDisplay || !emailInput || !passwordInput) {
    console.error('Login form essential elements not found! Check IDs: login-form, login-error, email, password.');
    // Optionally display an error on the page if possible
    if(errorDisplay) errorDisplay.textContent = "Page loading error.";
} else {
    // --- Form Submission Listener ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default browser submission
        errorDisplay.textContent = ''; // Clear previous errors
        errorDisplay.style.display = 'none'; // Hide error display

        const email = emailInput.value.trim();
        const pwd = passwordInput.value; // Don't trim password
        const loginButton = form.querySelector('button[type="submit"]');

        // Client-side validation
        if (!email || !pwd) {
            errorDisplay.textContent = 'Please enter both email and password.';
            errorDisplay.style.display = 'block';
            return;
        }
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            errorDisplay.textContent = 'Please enter a valid email address.';
            errorDisplay.style.display = 'block';
            return;
        }
        // Note: Password length validation isn't strictly needed here,
        // as the backend handles incorrect password attempts.

        try {
            // Disable button and show loading state
            loginButton.disabled = true;
            loginButton.textContent = 'Logging in...';

            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: pwd }) // Send email and password
            });

            const data = await res.json(); // Attempt to parse JSON response

            if (!res.ok) {
                // Throw an error using the message from the API if available
                throw new Error(data.message || `Login failed (Status: ${res.status})`);
            }

            // --- SUCCESS ---
            // Login successful, backend returned token and role

            // Validate data received
            if (!data.token || !data.role) {
                 throw new Error('Login successful, but server response missing token or role.');
            }

            // Save token & role
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            console.log(`Login successful. Role: ${data.role}`); // Log role

            // --- ** REDIRECT BASED ON ROLE ** ---
            if (data.role === 'admin') {
                console.log('Redirecting admin to dashboard...');
                window.location.href = 'dashboard.html'; // Admin dashboard path (relative)
            } else { // Assume 'student' or any other non-admin role
                console.log('Redirecting student to profile...');
                window.location.href = '../profile.html'; // Student profile page path (relative)
                // Alternatively, redirect students to the homepage:
                // window.location.href = '../index.html';
            }

        } catch (err) {
            console.error('Login Attempt Error:', err);
            errorDisplay.textContent = err.message || 'An unexpected error occurred.';
            errorDisplay.style.display = 'block'; // Show error
            // Clear potentially stored invalid items if login fails
            localStorage.removeItem('token');
            localStorage.removeItem('role');
        } finally {
            // Re-enable button only if it still exists
            if (loginButton && loginButton.isConnected) {
                loginButton.disabled = false;
                loginButton.textContent = 'Login';
            }
        }
    });
} // End if (form && errorDisplay) check