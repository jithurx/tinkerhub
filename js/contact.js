document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = '';
  
      const formData = new FormData(form);
      try {
        const response = await fetch(form.action, {
          method: form.method,
          headers: { 'Accept': 'application/json' },
          body: formData
        });
        if (response.ok) {
          status.textContent = 'Thank you! Your message has been sent.';
          status.classList.add('success');
          form.reset();
        } else {
          const data = await response.json();
          status.textContent = data.error || 'Oops! There was a problem.';
          status.classList.add('error');
        }
      } catch (err) {
        status.textContent = 'Network error. Please try again later.';
        status.classList.add('error');
      }
    });
  });