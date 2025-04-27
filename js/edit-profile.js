// js/edit-profile.js

// Define the base URL for your API.
// !!! IMPORTANT: Replace with your ACTUAL backend URL !!!
const API_BASE_URL = 'https://tinkerhub-0pse.onrender.com'; // e.g., 'https://tinkerhub-nssce-api.onrender.com'
// const API_BASE_URL = 'http://localhost:5000'; // For local testing

// --- Cloudinary Credentials (Replace with YOUR details) ---
const CLOUDINARY_CLOUD_NAME = 'dyvwqbyxl';
const CLOUDINARY_UPLOAD_PRESET = 'tinkerhub_unsigned_preset'; // Use the same or a different preset


// --- Cloudinary Upload Helper ---
async function uploadToCloudinary(file, uploadPreset, cloudName, statusElement = null) {
     if (!cloudName || !uploadPreset || cloudName === 'YOUR_CLOUD_NAME_HERE') {
        console.error("Cloudinary credentials are not configured in edit-profile.js!");
        if (statusElement) statusElement.textContent = 'Upload Error: Config missing.';
        if (statusElement) statusElement.className = 'upload-status error';
        throw new Error('Cloudinary configuration missing.');
    }
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    if (statusElement) statusElement.textContent = 'Uploading...';
    if (statusElement) statusElement.className = 'upload-status uploading';
    try {
        const response = await fetch(url, { method: 'POST', body: formData });
        const data = await response.json();
        if (!response.ok) { throw new Error(data.error?.message || `Upload failed: ${response.statusText}`); }
        if (!data.secure_url) { throw new Error('Cloudinary response missing secure_url.'); }
        console.log('Cloudinary Upload Success:', data.secure_url);
        if (statusElement) statusElement.textContent = 'Upload complete!';
        if (statusElement) statusElement.className = 'upload-status success';
        setTimeout(() => { if (statusElement && statusElement.textContent === 'Upload complete!') statusElement.textContent = ''; }, 2500);
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        if (statusElement) statusElement.textContent = `Upload failed: ${error.message}`;
        if (statusElement) statusElement.className = 'upload-status error';
        throw error;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // --- Get DOM Elements ---
    const form = document.getElementById('edit-profile-form');
    const statusDiv = document.getElementById('edit-profile-status');
    const nameInput = document.getElementById('edit-name');
    const emailInput = document.getElementById('edit-email');
    // Profile Picture elements
    const profilePicFileInput = document.getElementById('edit-profilePicFile');
    const profilePicPreview = document.getElementById('profile-pic-preview');
    const profilePicUrlHiddenInput = document.getElementById('edit-profilePictureUrl');
    const profilePicUploadStatus = document.getElementById('profile-pic-upload-status');
    // Other fields
    const aboutTextarea = document.getElementById('edit-about');
    const githubInput = document.getElementById('edit-social-github');
    const linkedinInput = document.getElementById('edit-social-linkedin');
    const instagramInput = document.getElementById('edit-social-instagram');
    const languageListDiv = document.getElementById('edit-language-list');
    const addLangBtn = document.getElementById('add-language-btn');
    const saveButton = form ? form.querySelector('button[type="submit"]') : null;

    // Check element existence
    const essentialElements = [form, statusDiv, nameInput, emailInput, profilePicFileInput, profilePicPreview, profilePicUrlHiddenInput, profilePicUploadStatus, aboutTextarea, githubInput, linkedinInput, instagramInput, languageListDiv, addLangBtn, saveButton];
    if (essentialElements.some(el => !el)) {
        console.error("Essential edit profile elements missing! Check IDs in edit-profile.html.");
        if(statusDiv) setStatus('Error: Page structure incorrect.', true);
        return;
    }

    const token = localStorage.getItem('token');

    // --- Helper Functions ---
    function setStatus(message, isError = false, isSuccess = false) {
        statusDiv.innerHTML = `<p class="${isError ? 'error' : (isSuccess ? 'success' : '')}">${message}</p>`;
        statusDiv.style.display = 'block';
    }
    function clearStatus() { statusDiv.innerHTML = ''; statusDiv.style.display = 'none'; }
    function escapeHTML(str) { /* ... keep implementation ... */ }
    function ensureHttps(url) { /* ... keep implementation ... */ }


    // --- Load Current Profile ---
    const loadCurrentProfile = async () => {
        clearStatus();
        if (!token) { setStatus('Redirecting to login...', true); setTimeout(() => { window.location.href = 'admin/login.html'; }, 1500); return; }
        setStatus('Loading current profile...');
        form.style.display = 'none';

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.status === 401) { localStorage.removeItem('token'); localStorage.removeItem('role'); throw new Error('Unauthorized: Session expired.'); }
            if (!response.ok) { throw new Error(`Failed to fetch profile: ${response.statusText}`); }
            const result = await response.json();
            if (!result.success || !result.data) { throw new Error('Failed to get profile data.'); }

            // Populate form fields
            const user = result.data;
            nameInput.value = user.name || '';
            emailInput.value = user.email || ''; // Keep disabled
            aboutTextarea.value = user.about || '';
            githubInput.value = user.socials?.github || ''; // Use optional chaining
            linkedinInput.value = user.socials?.linkedin || '';
            instagramInput.value = user.socials?.instagram || '';

            // Populate Profile Picture Preview AND Hidden Input
            const currentPicUrl = user.profilePictureUrl || '';
            profilePicPreview.src = currentPicUrl || '../images/default-avatar.png'; // Use correct default path
            profilePicUrlHiddenInput.value = currentPicUrl;
            profilePicPreview.onerror = () => { profilePicPreview.src = '../images/default-avatar.png'; }; // Fallback

            renderLanguageInputs(user.programmingLanguages || []); // Populate languages

            clearStatus(); form.style.display = 'flex'; // Show form
        } catch (error) {
            console.error("Error loading profile for edit:", error);
            setStatus(`Error loading profile: ${error.message}`, true);
            if (error.message.includes('Unauthorized')) { setTimeout(() => { window.location.href = 'admin/login.html'; }, 2500); }
        }
    };

    // --- Profile Picture File Input Change Handler ---
    profilePicFileInput.addEventListener('change', async (event) => {
         const file = event.target.files?.[0];
         profilePicUploadStatus.textContent = ''; // Clear previous status
         profilePicUploadStatus.className = 'upload-status';
         if (!file) return;

         // Validation
         const maxSizeMB = 2;
         if (file.size > maxSizeMB * 1024 * 1024) { profilePicUploadStatus.textContent = `Max ${maxSizeMB}MB.`; profilePicUploadStatus.className = 'upload-status error'; profilePicFileInput.value = ''; return; }
         if (!file.type.startsWith('image/')) { profilePicUploadStatus.textContent = `Image only.`; profilePicUploadStatus.className = 'upload-status error'; profilePicFileInput.value = ''; return; }

         // Local Preview
         const reader = new FileReader();
         reader.onload = (e) => { profilePicPreview.src = e.target.result; }
         reader.readAsDataURL(file);

         // Upload to Cloudinary
         try {
             const uploadedUrl = await uploadToCloudinary(file, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_CLOUD_NAME, profilePicUploadStatus);
             profilePicUrlHiddenInput.value = uploadedUrl; // Update hidden input
             profilePicPreview.src = uploadedUrl; // Update preview to final URL
         } catch (error) {
              profilePicPreview.src = profilePicUrlHiddenInput.value || '../images/default-avatar.png'; // Revert preview
              profilePicFileInput.value = ''; // Clear selection
         }
    });


    // --- Language Input Functions ---
    function renderLanguageInputs(languages = []) { /* ... keep implementation ... */ }
    function addLanguageInputRow(lang = { name: '', proficiency: 0 }, index = -1) { /* ... keep implementation ... */ }
    addLangBtn.addEventListener('click', () => addLanguageInputRow()); // Keep listener


    // --- Form Submission Handler ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearStatus();
        saveButton.disabled = true; saveButton.textContent = 'Saving...';

        // Collect data - reads from hidden profile pic URL input now
        const updatedProfileData = {
            name: nameInput.value.trim(),
            profilePictureUrl: profilePicUrlHiddenInput.value.trim(), // Read from hidden input
            about: aboutTextarea.value.trim(),
            socials: {
                github: githubInput.value.trim(),
                linkedin: linkedinInput.value.trim(),
                instagram: instagramInput.value.trim()
            },
            programmingLanguages: []
        };

        // Collect language data
        const languageItems = languageListDiv.querySelectorAll('.language-item');
        let langValidationOk = true;
        languageItems.forEach((item) => {
             const nameInput = item.querySelector(`input[name^="langName_"]`);
             const proficiencyInput = item.querySelector(`input[name^="langProficiency_"]`);
             const name = nameInput?.value.trim();
             const proficiency = parseInt(proficiencyInput?.value, 10); // Allow 0

             // Validate proficiency (0-100) if name is entered
             if (name && (isNaN(proficiency) || proficiency < 0 || proficiency > 100)) {
                 setStatus(`Invalid proficiency for ${name} (must be 0-100).`, true);
                 proficiencyInput.style.border = '1px solid red'; // Highlight error
                 langValidationOk = false;
             } else if (name) { // Only add if name is provided and proficiency is valid
                 proficiencyInput.style.border = ''; // Clear error style
                 updatedProfileData.programmingLanguages.push({ name: name, proficiency: proficiency });
             } else {
                  // Clear error style if name is empty
                  if(proficiencyInput) proficiencyInput.style.border = '';
             }
        });

         if (!langValidationOk) {
            saveButton.disabled = false; saveButton.textContent = 'Save Changes';
            return; // Stop submission if language validation failed
        }

        console.log('Sending Update:', updatedProfileData);

        try {
             if (!token) { throw new Error("Authentication token missing. Please log in."); }
             const response = await fetch(`${API_BASE_URL}/api/auth/me`, { /* ... PUT options ... */
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(updatedProfileData)
             });
             const result = await response.json();
             if (response.status === 401) { localStorage.removeItem('token'); localStorage.removeItem('role'); throw new Error('Unauthorized: Session expired.'); }
             if (!response.ok) { throw new Error(result.message || `Update failed: ${response.statusText}`); }
             if (!result.success) { throw new Error(result.message || 'API reported failure.'); }

             // Success
             setStatus('Profile updated successfully! Redirecting...', false, true); // Use success class
             setTimeout(() => { window.location.href = 'profile.html'; }, 1500);
        } catch (error) {
            console.error("Error updating profile:", error);
            setStatus(`Error updating profile: ${error.message}`, true);
            if (error.message.includes('Unauthorized')) { setTimeout(() => { window.location.href = 'admin/login.html'; }, 2500); }
        } finally {
             if(saveButton.isConnected) { saveButton.disabled = false; saveButton.textContent = 'Save Changes'; }
        }
    });

    // --- Initial Load ---
    loadCurrentProfile();

    // --- Escape HTML Helper ---
    // (Ensure this function is defined either here or globally)
    // function escapeHTML(str) { ... }

}); // End DOMContentLoaded