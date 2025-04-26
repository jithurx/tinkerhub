// js/resources.js
const API_BASE_URL = 'https://tinkerhub-0pse.onrender.com'; // PRODUCTION URL
// const API_BASE_URL = 'http://localhost:5000'; // LOCAL DEV URL (Example)

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('resource-list');
    if (!container) {
        console.error('Resource list container not found!');
        return;
    }

    container.innerHTML = '<p style="text-align: center; color: #777; grid-column: 1 / -1;">Loading resources...</p>';

    fetch(`${API_BASE_URL}/api/resources`)
        .then(res => {
            if (!res.ok) { throw new Error(`HTTP error! status: ${res.status}`); }
            return res.json();
        })
        .then(data => {
            container.innerHTML = '';
            if (!Array.isArray(data) || data.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #777; grid-column: 1 / -1;">No resources shared yet.</p>';
                return;
            }
            data.forEach(item => {
                const card = document.createElement('div');
                card.classList.add('resource-card', 'tinker-card');
                card.innerHTML = `
                    ${item.image ? `<img src="${item.image}" alt="${item.title || 'Resource image'}" class="resource-img">` : '<div class="resource-img-placeholder" style="height: 160px; background: #eee;"></div>'}
                    <div class="resource-content">
                        <h2>${item.title || 'No Title'}</h2>
                        ${item.category ? `<small>${item.category}</small>` : ''}
                        <p>${item.description || 'No description.'}</p>
                        <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="resource-link tinker-button">View Resource</a>
                    </div>
                `;
                container.appendChild(card);
            });
        })
        .catch(error => {
             console.error('Error loading resources:', error);
             container.innerHTML = '<p style="text-align: center; color: red; grid-column: 1 / -1;">Could not load resources.</p>';
        });
});