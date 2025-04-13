document.addEventListener('DOMContentLoaded', () => {
    fetch('data/announcements.json')
      .then(response => response.json())
      .then(data => {
        const container = document.getElementById('announcement-list');
        data.forEach(announcement => {
          const card = document.createElement('div');
          card.classList.add('announcement-card');
          card.innerHTML = `
            <img src="${announcement.image}" alt="${announcement.title}" class="announcement-img">
            <div class="announcement-content">
              <h2>${announcement.title}</h2>
              <small>${announcement.date}</small>
              <p>${announcement.content}</p>
              <a href="${announcement.link}" class="btn">🔗</a>
            </div>
          `;
          container.appendChild(card);
        });
      })
      .catch(error => {
        console.error('Error loading announcements:', error);
      });
  });
  