// js/announcements.js
// const API_BASE_URL = 'https://tinkerhub-nssce-api.onrender.com'; // PRODUCTION URL
const API_BASE_URL = 'http://localhost:5000'; // LOCAL DEV URL (Example)

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('announcement-list');
    if (!container) {
        console.error('Announcement list container not found!');
        return;
    }

    container.innerHTML = '<p style="text-align: center; color: #777;">Loading announcements...</p>';

    fetch(`${API_BASE_URL}/api/announcements`)
      .then(response => {
          if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
          return response.json();
      })
      .then(data => {
          container.innerHTML = '';
          if (!Array.isArray(data) || data.length === 0) { // Check if data is an array
              container.innerHTML = '<p style="text-align: center; color: #777;">No announcements yet.</p>';
              return;
          }
          data.forEach(announcement => {
              const card = document.createElement('div');
              card.classList.add('announcement-card');
              const formattedDate = announcement.date ? new Date(announcement.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date(announcement.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); // Fallback to createdAt
              card.innerHTML = `
                  ${announcement.image ? `<div class="announcement-img-container"><img src="${announcement.image}" alt="${announcement.title || 'Announcement image'}" class="announcement-img"></div>` : ''}
                  <div class="announcement-content">
                      <h2>${announcement.title || 'No Title'}</h2>
                      <small>Posted: ${formattedDate}</small>
                      <p>${announcement.content || ''}</p>
                      ${announcement.link ? `<a href="${announcement.link}" class="btn tinker-button" target="_blank" rel="noopener noreferrer">Learn More</a>` : ''}
                  </div>
              `;
              container.appendChild(card);
          });
      })
      .catch(error => {
          console.error('Error loading announcements:', error);
          container.innerHTML = '<p style="text-align: center; color: red;">Could not load announcements. Please try again later.</p>';
      });
});