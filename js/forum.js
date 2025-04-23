document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('message-form');
    const messageList = document.getElementById('message-list');
  
    // Load existing messages from LocalStorage
    const loadMessages = () => {
      messageList.innerHTML = '';
      const messages = JSON.parse(localStorage.getItem('forumMessages') || '[]');
      messages.forEach(msg => {
        const item = document.createElement('div');
        item.classList.add('message-item');
        item.innerHTML = `
          <div class="meta"><strong>${msg.user}</strong> • ${new Date(msg.time).toLocaleString()}</div>
          <div class="text">${msg.text}</div>
        `;
        messageList.appendChild(item);
      });
      messageList.scrollTop = messageList.scrollHeight;
    };
  
    loadMessages();
  
    // Handle new message submission
    form.addEventListener('submit', e => {
      e.preventDefault();
      const user = document.getElementById('username').value.trim();
      const text = document.getElementById('message-input').value.trim();
      if (!user || !text) return;
  
      const newMsg = { user, text, time: Date.now() };
      const messages = JSON.parse(localStorage.getItem('forumMessages') || '[]');
      messages.push(newMsg);
      localStorage.setItem('forumMessages', JSON.stringify(messages));
  
      form.reset();
      loadMessages();
    });
  });