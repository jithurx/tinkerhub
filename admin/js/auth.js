// --- START OF FILE auth.js ---

const form = document.getElementById('login-form');
const errorDisplay = document.getElementById('login-error'); // Get error element

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorDisplay.textContent = ''; // Clear previous errors
    errorDisplay.style.display = 'none'; // Hide error display initially

    const email = form.email.value.trim();
    const pwd = form.password.value.trim();
    // const role = form.role.value; // Role is determined by backend based on credentials

    if (!email || !pwd) {
        errorDisplay.textContent = 'Please enter both email and password.';
        errorDisplay.style.display = 'block';
        return;
    }

    try {
      // Show loading state maybe? Add spinner or disable button
      form.querySelector('button[type="submit"]').disabled = true;
      form.querySelector('button[type="submit"]').textContent = 'Logging in...';

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send only email and password, backend determines role
        body: JSON.stringify({ email, password: pwd })
      });

      const data = await res.json();

      if (!res.ok) {
          // Use the message from the API response
          throw new Error(data.message || `Login failed (Status: ${res.status})`);
      }

      // Login successful
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role); // Store role received from backend

      // Redirect based on role (optional, dashboard might handle it)
      if (data.role === 'admin') {
          window.location.href = 'dashboard.html';
      } else {
          // Redirect students elsewhere, maybe back to homepage or a profile page
          window.location.href = '../index.html'; // Example redirect for students
      }

    } catch (err) {
      console.error('Login Error:', err);
      errorDisplay.textContent = err.message || 'An error occurred during login.';
      errorDisplay.style.display = 'block'; // Show error
    } finally {
        // Re-enable button regardless of outcome
        form.querySelector('button[type="submit"]').disabled = false;
        form.querySelector('button[type="submit"]').textContent = 'Login';
    }
  });
} else {
    console.error('Login form not found!');
}