// js/profile.js

// Define the base URL for your API.
// !!! IMPORTANT: Replace with your ACTUAL backend URL !!!
// const API_BASE_URL = 'YOUR_RENDER_BACKEND_URL_HERE'; // e.g., 'https://tinkerhub-nssce-api.onrender.com'
const API_BASE_URL = 'http://localhost:5000'; // For local testing

document.addEventListener('DOMContentLoaded', () => {
    // --- Get DOM Elements ---
    const profileStatus = document.getElementById('profile-status');
    const profileContent = document.getElementById('profile-content');
    const profilePic = document.getElementById('profile-pic');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileSocials = document.getElementById('profile-socials');
    const profileAbout = document.getElementById('profile-about-text');
    const languageList = document.getElementById('language-list');
    const logoutBtn = document.getElementById('logout-btn');
    const editProfileBtn = document.getElementById('edit-profile-btn'); // Get the link/button element

    // --- Check if essential elements exist ---
    if (!profileStatus || !profileContent || !profilePic || !profileName || !profileEmail || !profileSocials || !profileAbout || !languageList || !logoutBtn || !editProfileBtn) {
        console.error("Profile page elements missing! Check IDs in profile.html.");
        if (profileStatus) {
            profileStatus.innerHTML = '<p class="error" style="color: red; text-align: center;">Error: Could not initialize profile page structure.</p>';
            profileStatus.style.display = 'block';
        }
        return; // Stop execution if page structure is broken
    }

    const token = localStorage.getItem('token');

    // --- Helper Functions ---
    function setStatus(message, isError = false) {
        profileStatus.innerHTML = `<p class="${isError ? 'error' : ''}" style="${isError ? 'color:red;' : ''}">${message}</p>`;
        profileStatus.style.display = 'block';
        profileContent.style.display = 'none'; // Hide main content when status is shown
    }

    function clearStatus() {
        profileStatus.innerHTML = '';
        profileStatus.style.display = 'none';
    }

    function escapeHTML(str) {
       if (!str) return '';
       const div = document.createElement('div');
       div.appendChild(document.createTextNode(str));
       return div.innerHTML;
    }

     function ensureHttps(url) {
        if (!url || typeof url !== 'string') return '#';
        // Check if protocol exists, if not, prepend https://
        if (!/^https?:\/\//i.test(url)) {
            // Basic check if it looks like a domain part, avoid prepending to invalid strings
             if (url.includes('.') && !url.includes(' ')) {
                 return 'https://' + url;
             } else {
                  return '#'; // Return '#' or original string if it doesn't look like a URL
             }
        }
        return url; // Already has http or https
    }

    // --- Fetch User Data ---
    const loadProfileData = async () => {
        clearStatus();
        profileContent.style.display = 'none'; // Hide content initially

        if (!token) {
            setStatus('You need to be logged in to view your profile. Redirecting to login...', true);
            setTimeout(() => { window.location.href = 'admin/login.html'; }, 2500);
            return;
        }

        setStatus('Loading profile data...');

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                throw new Error('Unauthorized: Session expired or invalid. Please log in again.');
            }
            if (!response.ok) {
                // Try to get error message from API response body
                 const errorData = await response.json().catch(() => ({})); // Catch if body isn't JSON
                 throw new Error(errorData.message || `Failed to fetch profile data: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();

            if (!result.success || !result.data) {
                 throw new Error(result.message || 'Failed to get profile data from API response.');
            }

            // Successfully fetched data
            populateProfile(result.data);
            clearStatus(); // Hide loading message
            profileContent.style.display = 'block'; // Show content block

        } catch (error) {
            console.error("Error loading profile:", error);
            setStatus(`Could not load profile: ${error.message}`, true);
             // Redirect on critical errors like unauthorized
             if (error.message.includes('Unauthorized')) {
                 setTimeout(() => { window.location.href = 'admin/login.html'; }, 2500);
             }
        }
    };

    // --- Populate Page with Data ---
    const populateProfile = (userData) => {
        // Basic Info
        profileName.textContent = escapeHTML(userData.name || 'N/A');
        profileEmail.textContent = escapeHTML(userData.email || 'N/A');
        // Use default image path if URL is missing or invalid
        profilePic.src = (userData.profilePictureUrl && userData.profilePictureUrl.startsWith('http'))
                         ? userData.profilePictureUrl
                         : 'images/default-avatar.png';
        profilePic.alt = `${escapeHTML(userData.name || 'User')}'s profile picture`;
        profilePic.onerror = () => { // Fallback if provided URL fails to load
             console.warn(`Failed to load profile picture: ${userData.profilePictureUrl}. Using default.`);
             profilePic.src = 'images/default-avatar.png';
             profilePic.onerror = null; // Prevent infinite loop if default is also missing
         };


        // About Section
        profileAbout.textContent = escapeHTML(userData.about || 'No bio provided yet.');

        // Social Links
        profileSocials.innerHTML = ''; // Clear existing icons
        const socials = userData.socials || {};
        const socialPlatforms = {
             github: { icon: 'fab fa-github', label: 'GitHub Profile' },
             linkedin: { icon: 'fab fa-linkedin-in', label: 'LinkedIn Profile' },
             instagram: { icon: 'fab fa-instagram', label: 'Instagram Profile' }
             // Add more platforms here if needed
         };

        for (const platform in socialPlatforms) {
             if (socials[platform]) {
                 const url = ensureHttps(socials[platform]);
                 const { icon, label } = socialPlatforms[platform];
                 profileSocials.innerHTML += `
                     <a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${label}" title="${label}">
                         <i class="${icon}"></i>
                     </a>`;
             }
        }
        if (profileSocials.innerHTML === '') {
             profileSocials.innerHTML = '<span style="font-size: 0.9em; color: #777;">No social links added.</span>';
        }


        // Programming Languages
        languageList.innerHTML = ''; // Clear existing
        const languages = userData.programmingLanguages || [];
        if (languages.length > 0) {
            // Optional: Sort languages alphabetically or by proficiency
            languages.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

            languages.forEach(lang => {
                if (lang.name) { // Only display if language has a name
                    const li = document.createElement('li');
                    const proficiency = Math.max(0, Math.min(100, lang.proficiency || 0)); // Ensure 0-100
                    li.innerHTML = `
                        <div class="language-info">
                            <span class="language-name">${escapeHTML(lang.name)}</span>
                            <span class="language-proficiency">${proficiency}%</span>
                        </div>
                        <div class="progress-bar-container" title="${proficiency}% Proficient">
                            <div class="progress-bar" style="width: ${proficiency}%;"
                                 aria-valuenow="${proficiency}" aria-valuemin="0" aria-valuemax="100">
                                 ${proficiency > 15 ? proficiency+'%' : ''} <!-- Show % text if bar is wide enough -->
                            </div>
                        </div>
                    `;
                    languageList.appendChild(li);
                }
            });
        } else {
            languageList.innerHTML = '<li>No programming languages listed yet.</li>';
        }

         // Show edit button now that content is loaded
         editProfileBtn.style.display = 'inline-block';

    };

    // --- Logout Button ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            console.log('User logged out.');
            window.location.replace('index.html'); // Redirect to homepage after logout
        });
    }

    // --- Edit Button ---
    // The edit button in profile.html is now an <a> link pointing to edit-profile.html,
    // so no complex JS is needed here for it, unless you wanted to dynamically show/hide it.
    // The check in loadProfileData() handles showing it after load.


    // --- Initial Load ---
    loadProfileData();

});