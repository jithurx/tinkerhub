const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

const WEB3_FORMS_URL = 'https://api.web3forms.com/submit';
const ACCESS_KEY = 'c4cbbcfc-5e9b-4dab-a16e-2cd3a7e88ebc'; // <-- Replace with your real access key

if (form && formStatus) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');

        // Append access_key required by Web3Forms
        formData.append('access_key', ACCESS_KEY);

        // Optional: You can also append a redirect URL if you want
        // formData.append('redirect', 'https://yourwebsite.com/thank-you.html');

        // Show loading state
        formStatus.textContent = 'Sending...';
        formStatus.className = 'form-status';
        submitButton.disabled = true;

        try {
            const response = await fetch(WEB3_FORMS_URL, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                formStatus.textContent = 'Thanks! Your message was sent successfully.';
                formStatus.classList.add('success');
                form.reset();
            } else {
                const data = await response.json();
                if (data && data.message) {
                    throw new Error(data.message);
                } else {
                    throw new Error('Oops! There was a problem submitting your form.');
                }
            }
        } catch (error) {
            console.error('Contact form submission error:', error);
            formStatus.textContent = error.message || 'Oops! There was a problem submitting your form.';
            formStatus.classList.add('error');
        } finally {
            submitButton.disabled = false;
        }
    });
} else {
    if (!form) console.error("Contact form not found!");
    if (!formStatus) console.error("Form status element not found!");
}
