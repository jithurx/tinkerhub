document.addEventListener('DOMContentLoaded', () => {
    fetch('data/events.json')
      .then(res => res.json())
      .then(data => {
        const now = new Date();
        const upcoming = document.getElementById('upcoming-events');
        const past = document.getElementById('past-events');
  
        data.forEach(event => {
          const eventDate = new Date(event.date);
          const card = document.createElement('div');
          card.classList.add('event-card');
          card.innerHTML = `
            <img src="${event.image}" alt="${event.title}" class="event-img">
            <div class="event-content">
              <h2>${event.title}</h2>
              <small>${event.date}</small>
              <p>${event.description}</p>
            </div>
          `;
  
          if (eventDate >= now) {
            upcoming.appendChild(card);
          } else {
            // Wrap past events in link to details
            const link = document.createElement('a');
            link.href = `event-details.html?id=${event.id}`;
            link.appendChild(card);
            past.appendChild(link);
          }
        });
      })
      .catch(console.error);
  
    // Toggle Past Events
    const btn = document.getElementById('toggle-past-btn');
    const pastSection = document.getElementById('past-events');
    let shown = false;
    btn.addEventListener('click', () => {
      shown = !shown;
      pastSection.classList.toggle('hidden');
      btn.textContent = shown ? 'Hide Past Events' : 'Show Past Events';
    });
  });