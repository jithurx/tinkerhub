// js/forum.js

// Define the base URL for your API.
// !!! IMPORTANT: Replace with your ACTUAL backend URL !!!
// const API_BASE_URL = 'YOUR_RENDER_BACKEND_URL_HERE'; // e.g., 'https://tinkerhub-nssce-api.onrender.com'
const API_BASE_URL = 'http://localhost:5000'; // For local testing

document.addEventListener('DOMContentLoaded', () => {
    // --- Get DOM Elements ---
    const form = document.getElementById('message-form');
    const messageList = document.getElementById('message-list');
    const textInput = document.getElementById('message-input'); // Get textarea
    const usernameInput = document.getElementById('username'); // Get username input field
    const submitButton = form ? form.querySelector('button[type="submit"]') : null; // Get submit button

    // Check for essential elements
    if (!form || !messageList || !textInput || !usernameInput || !submitButton) {
        console.error('Forum elements not found! Check IDs in forum.html (message-form, message-list, message-input, username).');
        if (messageList) messageList.innerHTML = '<p style="color:red; text-align:center;">Error: Forum page structure incorrect.</p>';
        return; // Stop if critical elements are missing
    }

    let currentToken = localStorage.getItem('token'); // Get token initially

    // --- Helper: Escape HTML ---
    function escapeHTML(str) {
       if (typeof str !== 'string') return str;
       return str.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, ',');
    }

    // --- UI State Update based on Login Status ---
    const setupUIBasedOnLogin = () => {
        currentToken = localStorage.getItem('token'); // Refresh token status
        if (!currentToken) {
            // --- Logged OUT state ---
            messageList.innerHTML = '<p style="text-align: center; color: #777;">Please <a href="admin/login.html">log in</a> to view or post messages.</p>';
            // Disable form elements
            textInput.disabled = true;
            submitButton.disabled = true;
            textInput.placeholder = "Log in to post messages...";
            // Hide username input AND ensure it's not required
            usernameInput.style.display = 'none';
            usernameInput.required = false;

        } else {
            // --- Logged IN state ---
            // Enable form elements
            textInput.disabled = false;
            submitButton.disabled = false;
            textInput.placeholder = "Type your message here...";
            // Hide username input AND ensure it's not required
            usernameInput.style.display = 'none';
            usernameInput.required = false; // *** FIX: Remove required attribute ***
        }
    };

    // --- Fetch and Render Messages ---
    const loadMessages = async () => {
        // UI state is set by setupUIBasedOnLogin called before this
        if (!currentToken) return; // Don't fetch if not logged in

        messageList.innerHTML = '<p style="text-align: center; color: #999;">Loading messages...</p>';

        try {
            const response = await fetch(`${API_BASE_URL}/api/forum/messages`, {
                headers: {
                    'Authorization': `Bearer ${currentToken}` // Send token
                }
            });

            if (response.status === 401) { // Handle unauthorized/expired token
                localStorage.removeItem('token'); localStorage.removeItem('role');
                setupUIBasedOnLogin(); // Update UI for logged out state
                throw new Error('Unauthorized: Please log in again.');
            }
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); // Try getting error message
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const messages = await response.json();

            messageList.innerHTML = ''; // Clear loading/error message
            if (!Array.isArray(messages) || messages.length === 0) {
                messageList.innerHTML = '<p style="text-align: center; color: #777;">Be the first to post!</p>';
                return;
            }

            // Render each message
            messages.forEach(msg => {
                const item = document.createElement('div');
                item.classList.add('message-item');
                // Use populated user name from API, provide fallback
                const userName = msg.user?.name ? escapeHTML(msg.user.name) : '[Deleted User]';
                // Format timestamp nicely
                const messageTime = msg.createdAt ? new Date(msg.createdAt).toLocaleString('en-US', {dateStyle: 'short', timeStyle: 'short'}) : '';
                // Escape text content and replace newlines with <br> for display
                const messageTextHtml = escapeHTML(msg.text).replace(/\n/g, '<br>');

                item.innerHTML = `
                  <div class="meta"><strong>${userName}</strong> • <span class="timestamp">${messageTime}</span></div>
                  <div class="text">${messageTextHtml}</div>
                `;
                messageList.appendChild(item);
            });

            // Scroll to the bottom after loading messages
            messageList.scrollTop = messageList.scrollHeight;

        } catch (error) {
            console.error('Error loading forum messages:', error);
            messageList.innerHTML = `<p style="color:red; text-align:center;">Could not load messages. ${escapeHTML(error.message)}</p>`;
             // If unauthorized, add login prompt
            if (error.message.includes('Unauthorized')) {
                 messageList.insertAdjacentHTML('beforeend', '<p style="text-align:center;">Please <a href="admin/login.html">log in</a> again.</p>');
            }
        }
    };

    // --- Handle New Message Submission ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default browser form submission
        console.log("Submit event fired"); // Debug log

        const currentSubmitToken = localStorage.getItem('token'); // Re-check token
        const text = textInput.value.trim();

        // Ensure button exists before trying to disable/enable
        if (!submitButton) {
            console.error("Submit button not found within the form handler!");
            return;
        }

        if (!currentSubmitToken) {
            alert('You must be logged in to post a message.');
            window.location.href = 'admin/login.html'; // Redirect to login
            return;
        }

        if (!text) {
            alert('Message cannot be empty.');
            return;
        }
        if (text.length > 500) { // Client-side length check (should match backend)
             alert('Message cannot exceed 500 characters.');
             return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Posting...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/forum/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentSubmitToken}` // Send token
                },
                body: JSON.stringify({ text: text }) // Send only text
            });

            // Try to parse JSON regardless of status code for potential error messages
            const result = await response.json().catch(e => {
                 console.error("Error parsing JSON response:", e);
                 // If JSON parsing fails, create a generic error based on status
                 throw new Error(`Failed to post: ${response.status} ${response.statusText}`);
            });


            if (response.status === 401) {
                 localStorage.removeItem('token'); localStorage.removeItem('role');
                 setupUIBasedOnLogin(); // Update UI to logged-out state
                 throw new Error('Unauthorized: Your session may have expired. Please log in again.');
            }
            if (!response.ok) {
                 // Use message from parsed JSON result if available
                 throw new Error(result.message || `Failed to post: ${response.statusText}`);
            }

            // Successfully posted
            textInput.value = ''; // Clear the textarea
            loadMessages(); // Refresh the list to show the new message

        } catch (error) {
            console.error('Error posting message:', error);
            alert(`Failed to post message: ${error.message}`); // Show error to user
            if (error.message.includes('Unauthorized')) {
                 window.location.href = 'admin/login.html'; // Redirect if unauthorized
            }
        } finally {
            // Re-enable button only if it's still in the DOM
            if (submitButton && submitButton.isConnected) {
                 submitButton.disabled = false;
                 submitButton.textContent = 'Post Message';
            }
        }
    });

    // --- Initial Setup ---
    setupUIBasedOnLogin(); // Set initial UI based on login status
    // Load messages only if logged in
    if (currentToken) {
        loadMessages();
    }

}); // End DOMContentLoaded