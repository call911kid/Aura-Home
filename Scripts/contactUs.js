        const contactForm = document.getElementById('jsContactForm');

        if (contactForm) {
            contactForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                event.stopPropagation();

                if (!contactForm.checkValidity()) {
                    contactForm.classList.add('was-validated');
                    return;
                }

                const submitBtn = contactForm.querySelector('.btn-send');
                const originalText = submitBtn.innerText;

                const formData = {
                    firstName: document.getElementById('fName').value.trim(),
                    lastName: document.getElementById('lName').value.trim(),
                    email: document.getElementById('userEmail').value.trim(),
                    phone: document.getElementById('userPhone').value.trim(),
                    message: document.getElementById('userMsg').value.trim(),
                    timestamp: new Date().toISOString()
                };

                try {
                    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Sending...`;
                    submitBtn.disabled = true;

                    console.log("Success! Data collected:", formData);
                    alert('Thank you! Your message has been sent successfully.');

                    contactForm.reset();
                    contactForm.classList.remove('was-validated');
                } catch (error) {
                    alert('Error sending message.');
                } finally {
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;
                }
            }, false);
        }

