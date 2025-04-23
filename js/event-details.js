function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const id = getParam('id');
    fetch('data/events.json')
      .then(res => res.json())
      .then(events => {
        const event = events.find(e => e.id === id);
        if (!event) return;
        const detail = document.getElementById('event-detail');
        detail.innerHTML = `
          <h1>${event.title}</h1>
          <img src="${event.image}" alt="${event.title}" class="banner-img">
          <p><strong>Date:</strong> ${event.date}</p>
          <p>${event.description}</p>
        `;
        return fetch(`data/moments/${id}.json`);
      })
      .then(res => res.json())
      .then(images => {
        const gallery = document.getElementById('event-moments');
        images.forEach(src => {
          const img = document.createElement('img');
          img.src = src;
          gallery.appendChild(img);
        });
      })
      .catch(console.error);
  });