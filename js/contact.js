// js/contact.js
// This script assumes you are using a service like Formspree
// which handles the backend submission via the form's 'action' attribute.
// It only provides frontend feedback.

const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

if (form && formStatus) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop default form submission

        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');

        // Show loading state
        formStatus.textContent = 'Sending...';
        formStatus.className = 'form-status'; // Reset classes
        submitButton.disabled = true;

        try {
            const response = await fetch(form.action, {
                method: form.method,
                body: formData,
                headers: {
                    'Accept': 'application/json' // Formspree needs this header
                }
            });

            if (response.ok) {
                formStatus.textContent = 'Thanks! Your message was sent successfully.';
                formStatus.classList.add('success');
                form.reset(); // Clear the form
            } else {
                // Try to get error message from Formspree response
                const data = await response.json();
                if (Object.hasOwnProperty.call(data, 'errors')) {
                    throw new Error(data["errors"].map(error => error["message"]).join(", "));
                } else {
                    throw new Error('Oops! There was a problem submitting your form.');
                }
            }
        } catch (error) {
            console.error('Contact form submission error:', error);
            formStatus.textContent = error.message || 'Oops! There was a problem submitting your form.';
            formStatus.classList.add('error');
        } finally {
            // Re-enable button
            submitButton.disabled = false;
        }
    });
} else {
     if(!form) console.error("Contact form not found!");
     if(!formStatus) console.error("Form status element not found!");
}