// Newsletter form submission handler with Mailchimp API integration
// Handles form submission, loading states, and success/error messages

(function () {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function () {
        const form = document.getElementById('newsletterForm');
        const successMessage = document.getElementById('newsletterSuccess');
        const emailInput = document.getElementById('newsletter-email');
        const submitButton = form?.querySelector('.newsletter-submit');

        if (!form) return;

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = emailInput.value.trim();

            // Basic validation
            if (!email || !email.includes('@')) {
                showError('Please enter a valid email address');
                return;
            }

            // Disable form during submission
            submitButton.disabled = true;
            submitButton.textContent = 'Subscribing...';
            emailInput.disabled = true;

            try {
                // Send request to serverless function
                const response = await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    // Success - hide form and show success message
                    form.style.display = 'none';
                    successMessage.style.display = 'block';

                    // Reset form after delay (in case user wants to subscribe another email)
                    setTimeout(() => {
                        form.reset();
                    }, 1000);
                } else {
                    // Show error message
                    showError(data.error || 'Something went wrong. Please try again.');
                    resetForm();
                }
            } catch (error) {
                console.error('Subscription error:', error);
                showError('Network error. Please check your connection and try again.');
                resetForm();
            }
        });

        function showError(message) {
            // Create or update error message element
            let errorEl = form.querySelector('.newsletter-error');

            if (!errorEl) {
                errorEl = document.createElement('p');
                errorEl.className = 'newsletter-error';
                errorEl.style.color = '#ff4444';
                errorEl.style.fontSize = '14px';
                errorEl.style.marginTop = '10px';
                form.appendChild(errorEl);
            }

            errorEl.textContent = message;
            errorEl.style.display = 'block';

            // Hide error after 5 seconds
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, 5000);
        }

        function resetForm() {
            submitButton.disabled = false;
            submitButton.textContent = 'Subscribe';
            emailInput.disabled = false;
        }
    });
})();
