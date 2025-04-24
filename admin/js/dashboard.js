const token = localStorage.getItem('token');
if (!token) return window.location.href = 'login.html';

const sections = {
  announcements: { url: '/api/announcements', fields: ['title','content','date','image'] },
  events:        { url: '/api/events',        fields: ['title','description','date','image'] },
  resources:     { url: '/api/resources',     fields: ['title','link','description','image'] }
};

const navButtons = document.querySelectorAll('nav button');
const container  = document.getElementById('section-container');

navButtons.forEach(btn => {
  btn.onclick = () => loadSection(btn.dataset.section);
});

async function loadSection(name) {
  container.innerHTML = `<h2>Loading ${name}…</h2>`;
  const { url, fields } = sections[name];
  // Fetch existing items
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }});
  const items = await res.json();
  // Build HTML
  let html = `
    <h2>${name.charAt(0).toUpperCase()+name.slice(1)}</h2>
    <form id="create-form">
      ${fields.map(f => `<input name="${f}" placeholder="${f}" required/>`).join('')}
      <button type="submit">Add New</button>
    </form>
    <ul>${items.map(i =>
      `<li>
         ${fields.map(f => `<strong>${f}:</strong> ${i[f]}`).join(' | ')}
         <button data-id="${i._id}" class="delete">Delete</button>
       </li>`
    ).join('')}</ul>
  `;
  container.innerHTML = html;

  // Handle creation
  document.getElementById('create-form').onsubmit = async e => {
    e.preventDefault();
    const body = {};
    fields.forEach(f => body[f] = e.target[f].value);
    const cr = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body)
    });
    if (cr.ok) loadSection(name);
  };

  // Handle deletion
  container.querySelectorAll('.delete').forEach(btn => {
    btn.onclick = async () => {
      await fetch(`${url}/${btn.dataset.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadSection(name);
    };
  });
}

// Initialize
loadSection('announcements');
