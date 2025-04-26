// js/edit-profile.js

// Define the base URL for your API.
// !!! IMPORTANT: Replace with your ACTUAL backend URL !!!
const API_BASE_URL = 'https://tinkerhub-0pse.onrender.com'; // e.g., 'https://tinkerhub-nssce-api.onrender.com'
// const API_BASE_URL = 'http://localhost:5000'; // For local testing

document.addEventListener('DOMContentLoaded', () => {
    // --- Get DOM Elements ---
    const form = document.getElementById('edit-profile-form');
    const statusDiv = document.getElementById('edit-profile-status');
    const nameInput = document.getElementById('edit-name');
    const emailInput = document.getElementById('edit-email');
    const picUrlInput = document.getElementById('edit-profilePictureUrl');
    const aboutTextarea = document.getElementById('edit-about');
    const githubInput = document.getElementById('edit-social-github');
    const linkedinInput = document.getElementById('edit-social-linkedin');
    const instagramInput = document.getElementById('edit-social-instagram');
    const languageListDiv = document.getElementById('edit-language-list');
    const addLangBtn = document.getElementById('add-language-btn');

    // Check if essential elements exist
    if (!form || !statusDiv || !languageListDiv || !addLangBtn) {
        console.error("Essential edit profile elements missing!");
        setStatus('Error: Page structure incorrect. Cannot load editor.', true);
        return;
    }

    const token = localStorage.getItem('token');

    // --- Helper Functions ---
    function setStatus(message, isError = false) {
        statusDiv.innerHTML = `<p class="${isError ? 'error' : 'success'}">${message}</p>`;
        statusDiv.style.display = 'block';
    }

    function clearStatus() {
        statusDiv.innerHTML = '';
        statusDiv.style.display = 'none';
    }

    // Function to fetch current data and populate form
    const loadCurrentProfile = async () => {
        clearStatus();
        if (!token) {
            setStatus('You must be logged in to edit your profile. Redirecting...', true);
            setTimeout(() => { window.location.href = 'admin/login.html'; }, 2000);
            return;
        }

        setStatus('Loading current profile...');
        form.style.display = 'none'; // Hide form while loading

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                localStorage.removeItem('token'); localStorage.removeItem('role');
                throw new Error('Unauthorized: Session expired or invalid. Please log in again.');
            }
            if (!response.ok) { throw new Error(`Failed to fetch profile: ${response.statusText}`); }

            const result = await response.json();
            if (!result.success || !result.data) { throw new Error('Failed to get profile data.'); }

            // Populate form fields
            const user = result.data;
            if (nameInput) nameInput.value = user.name || '';
            if (emailInput) emailInput.value = user.email || ''; // Keep disabled
            if (picUrlInput) picUrlInput.value = user.profilePictureUrl || '';
            if (aboutTextarea) aboutTextarea.value = user.about || '';

            // Populate socials
            if (githubInput && user.socials) githubInput.value = user.socials.github || '';
            if (linkedinInput && user.socials) linkedinInput.value = user.socials.linkedin || '';
            if (instagramInput && user.socials) instagramInput.value = user.socials.instagram || '';

            // Populate languages
            renderLanguageInputs(user.programmingLanguages || []);

            clearStatus(); // Clear loading message
            form.style.display = 'flex'; // Show form

        } catch (error) {
            console.error("Error loading profile for edit:", error);
            setStatus(`Error loading profile: ${error.message}`, true);
             if (error.message.includes('Unauthorized')) {
                 setTimeout(() => { window.location.href = 'admin/login.html'; }, 2500);
             }
        }
    };

    // Function to render language input fields
    const renderLanguageInputs = (languages = []) => {
        languageListDiv.innerHTML = ''; // Clear previous
        if (languages.length === 0) {
            // Add one empty row if none exist
            addLanguageInputRow();
        } else {
            languages.forEach((lang, index) => addLanguageInputRow(lang, index));
        }
    };

    // Function to add a single language input row
    const addLanguageInputRow = (lang = { name: '', proficiency: 0 }, index = -1) => {
        const div = document.createElement('div');
        div.classList.add('language-item');
        // Use index in name attributes to help backend identify them if needed,
        // although we'll collect them into an array anyway.
        div.innerHTML = `
            <input type="text" name="langName_${index}" placeholder="Language (e.g., Python)" value="${escapeHTML(lang.name || '')}" required>
            <input type="number" name="langProficiency_${index}" placeholder="%" min="0" max="100" value="${lang.proficiency || 0}" required>
            <button type="button" class="remove-lang-btn" aria-label="Remove language">X</button>
        `;
        // Add event listener to the remove button
        div.querySelector('.remove-lang-btn').addEventListener('click', () => {
            div.remove();
             // If removing the last one, add a blank row back? Optional.
             if (languageListDiv.children.length === 0) {
                  addLanguageInputRow();
             }
        });
        languageListDiv.appendChild(div);
    };

    // Add Language Button Handler
    addLangBtn.addEventListener('click', () => addLanguageInputRow());

    // --- Form Submission Handler ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearStatus();
        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Saving...';

        // Collect data from form fields
        const updatedProfileData = {
            name: nameInput.value.trim(),
            profilePictureUrl: picUrlInput.value.trim(),
            about: aboutTextarea.value.trim(),
            socials: {
                github: githubInput.value.trim(),
                linkedin: linkedinInput.value.trim(),
                instagram: instagramInput.value.trim()
                // Add others if implemented
            },
            programmingLanguages: []
        };

        // Collect language data
        const languageItems = languageListDiv.querySelectorAll('.language-item');
        languageItems.forEach((item, index) => {
            const nameInput = item.querySelector(`input[name^="langName_"]`);
            const proficiencyInput = item.querySelector(`input[name^="langProficiency_"]`);
            const name = nameInput?.value.trim();
            const proficiency = parseInt(proficiencyInput?.value, 10) || 0;

            // Only add if name is provided
            if (name) {
                updatedProfileData.programmingLanguages.push({
                    name: name,
                    proficiency: Math.max(0, Math.min(100, proficiency)) // Clamp between 0-100
                });
            }
        });

        console.log('Sending Update:', updatedProfileData); // Debug: Check payload

        try {
             if (!token) { throw new Error("Authentication token missing. Please log in."); }

             const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedProfileData)
             });

             if (response.status === 401) {
                  localStorage.removeItem('token'); localStorage.removeItem('role');
                  throw new Error('Unauthorized: Session expired. Please log in again.');
             }

             const result = await response.json();

             if (!response.ok) {
                 throw new Error(result.message || `Failed to update profile: ${response.statusText}`);
             }

             if (!result.success) {
                 throw new Error(result.message || 'API reported failure, but no specific message.');
             }

             // Success!
             setStatus('Profile updated successfully! Redirecting...', false);
             setTimeout(() => { window.location.href = 'profile.html'; }, 1500); // Redirect back to profile page

        } catch (error) {
            console.error("Error updating profile:", error);
            setStatus(`Error updating profile: ${error.message}`, true);
             if (error.message.includes('Unauthorized')) {
                 setTimeout(() => { window.location.href = 'admin/login.html'; }, 2500);
             }
        } finally {
             submitButton.disabled = false;
             submitButton.textContent = 'Save Changes';
        }
    });


    // --- Initial Load ---
    loadCurrentProfile();

     // Helper function (duplicate from profile.js, consider moving to main.js or utils.js)
     function escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

});