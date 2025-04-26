// js/forum.js
// const API_BASE_URL = 'https://tinkerhub-nssce-api.onrender.com'; // PRODUCTION URL
const API_BASE_URL = 'http://localhost:5000'; // LOCAL DEV URL (Example)

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('message-form');
    const messageList = document.getElementById('message-list');
    const textInput = document.getElementById('message-input'); // Get textarea
    const usernameInput = document.getElementById('username'); // Get username input field

    if (!form || !messageList || !textInput || !usernameInput) {
        console.error('Forum elements not found!');
        return;
    }

    let currentToken = localStorage.getItem('token'); // Get token initially

    const setupUIBasedOnLogin = () => {
        currentToken = localStorage.getItem('token'); // Refresh token status
        if (!currentToken) {
            messageList.innerHTML = '<p style="text-align: center; color: #777;">Please <a href="admin/login.html">log in</a> to view or post messages.</p>';
            form.querySelectorAll('textarea, button').forEach(el => el.disabled = true);
            usernameInput.style.display = 'block'; // Show username field if not logged in? Maybe hide form entirely.
            textInput.placeholder = "Log in to post messages...";
            usernameInput.placeholder = "Log in to post messages..."; // Or just hide it
            usernameInput.disabled = true;
        } else {
            form.querySelectorAll('textarea, button').forEach(el => el.disabled = false);
            usernameInput.style.display = 'none'; // Hide username field when logged in
            textInput.placeholder = "Type your message here...";
        }
    };

    const loadMessages = () => {
        setupUIBasedOnLogin(); // Check login status first
        if (!currentToken) return; // Don't fetch if not logged in

        messageList.innerHTML = '<p style="text-align: center; color: #999;">Loading messages...</p>';

        fetch(`${API_BASE_URL}/api/forum/messages`, { headers: { 'Authorization': `Bearer ${currentToken}` } })
            .then(res => {
                if (res.status === 401) {
                    localStorage.removeItem('token'); localStorage.removeItem('role');
                    setupUIBasedOnLogin(); // Update UI for logged out state
                    throw new Error('Unauthorized: Please log in again.');
                }
                if (!res.ok) { throw new Error(`HTTP error! status: ${res.status}`); }
                return res.json();
             })
            .then(messages => {
                messageList.innerHTML = '';
                if (!Array.isArray(messages) || messages.length === 0) {
                    messageList.innerHTML = '<p style="text-align: center; color: #777;">Be the first to post!</p>';
                    return;
                }
                messages.forEach(msg => {
                    const item = document.createElement('div'); item.classList.add('message-item');
                    const userName = msg.user?.name || 'User'; // Use populated name
                    const messageTime = msg.createdAt ? new Date(msg.createdAt).toLocaleString() : '';
                    item.innerHTML = `
                      <div class="meta"><strong>${userName}</strong> • ${messageTime}</div>
                      <div class="text">${escapeHTML(msg.text)}</div>`; // Escape HTML
                    messageList.appendChild(item);
                });
                messageList.scrollTop = messageList.scrollHeight;
             })
            .catch(error => {
                 console.error('Error loading forum messages:', error);
                 messageList.innerHTML = `<p style="color:red;">Could not load messages. ${error.message}</p>`;
                 if (error.message.includes('Unauthorized')) {
                      messageList.insertAdjacentHTML('beforeend', '<p>Please <a href="admin/login.html">log in</a> again.</p>');
                 }
            });
    };

    // Handle new message submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentSubmitToken = localStorage.getItem('token'); // Re-check token
        const text = textInput.value.trim();
        const submitButton = form.querySelector('button[type="submit"]');

        if (!currentSubmitToken) {
            alert('You must be logged in to post.');
            window.location.href = 'admin/login.html'; return;
        }
        if (!text) { alert('Message cannot be empty.'); return; }

        submitButton.disabled = true; submitButton.textContent = 'Posting...';
        try {
            const response = await fetch(`${API_BASE_URL}/api/forum/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentSubmitToken}` },
                body: JSON.stringify({ text: text })
            });
            if (response.status === 401) {
                 localStorage.removeItem('token'); localStorage.removeItem('role');
                 setupUIBasedOnLogin();
                 throw new Error('Unauthorized: Session expired.');
            }
            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({})); // Try to get JSON error msg
                 throw new Error(errorData.message || `Failed to post: ${response.statusText}`);
            }
            textInput.value = '';
            loadMessages(); // Refresh list
        } catch (error) {
            console.error('Error posting message:', error);
            alert(`Failed to post message: ${error.message}`);
            if (error.message.includes('Unauthorized')) { window.location.href = 'admin/login.html'; }
        } finally {
            submitButton.disabled = false; submitButton.textContent = 'Post Message';
        }
    });

    // Initial load
    loadMessages();

    // Helper to prevent basic HTML injection
    function escapeHTML(str) {
       const div = document.createElement('div');
       div.appendChild(document.createTextNode(str));
       return div.innerHTML;
    }
});