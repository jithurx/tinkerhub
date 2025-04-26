// admin/js/auth.js

// Define the base URL for your API.
// !!! IMPORTANT: Replace with your ACTUAL backend URL !!!
// const API_BASE_URL = 'YOUR_RENDER_BACKEND_URL_HERE'; // e.g., 'https://tinkerhub-nssce-api.onrender.com'
const API_BASE_URL = 'http://localhost:5000'; // For local testing

const form = document.getElementById('login-form');
const errorDisplay = document.getElementById('login-error');

// Redirect if already logged in as admin (optional convenience)
// const existingToken = localStorage.getItem('token');
// const existingRole = localStorage.getItem('role');
// if (existingToken && existingRole === 'admin') {
//    console.log('Already logged in as admin, redirecting to dashboard...');
//    window.location.href = 'dashboard.html';
// }


if (!form) {
    console.error('Login form element (#login-form) not found!');
}
if (!errorDisplay) {
    console.error('Login error display element (#login-error) not found!');
}

if (form && errorDisplay) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorDisplay.textContent = ''; // Clear previous errors
        errorDisplay.style.display = 'none'; // Hide error display

        const email = form.email.value.trim();
        const pwd = form.password.value.trim();
        const loginButton = form.querySelector('button[type="submit"]');

        if (!email || !pwd) {
            errorDisplay.textContent = 'Please enter both email and password.';
            errorDisplay.style.display = 'block';
            return;
        }

        // Basic email format check (client-side)
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            errorDisplay.textContent = 'Please enter a valid email address.';
            errorDisplay.style.display = 'block';
            return;
        }


        try {
            // Disable button and show loading state
            loginButton.disabled = true;
            loginButton.textContent = 'Logging in...';

            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pwd })
            });

            const data = await res.json(); // Attempt to parse JSON response

            if (!res.ok) {
                // Throw an error using the message from the API if available
                throw new Error(data.message || `Login failed (Status: ${res.status})`);
            }

            // SUCCESS: Verify role before redirecting
            if (data.role !== 'admin') {
                // If backend confirms login but user isn't admin
                throw new Error('Access Denied: Admin privileges required.');
            }

            // Save token & role for admin
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);

            // Redirect ONLY admins to the dashboard
            window.location.href = 'dashboard.html';

        } catch (err) {
            console.error('Login Attempt Error:', err);
            errorDisplay.textContent = err.message || 'An unexpected error occurred.';
            errorDisplay.style.display = 'block'; // Show error
            // Clear potentially stored invalid items if login fails after trying
            localStorage.removeItem('token');
            localStorage.removeItem('role');
        } finally {
            // Re-enable button regardless of outcome
            if (loginButton) {
                loginButton.disabled = false;
                loginButton.textContent = 'Login';
            }
        }
    });
}