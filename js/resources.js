document.addEventListener('DOMContentLoaded', () => {
    fetch('data/resources.json')
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('resource-list');
        data.forEach(item => {
          const card = document.createElement('div');
          card.classList.add('resource-card');
          card.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="resource-img">
            <div class="resource-content">
              <h2>${item.title}</h2>
              <small>${item.category}</small>
              <p>${item.description}</p>
              <a href="${item.link}" target="_blank" class="resource-link">View Resource</a>
            </div>
          `;
          container.appendChild(card);
        });
      })
      .catch(console.error);
  });