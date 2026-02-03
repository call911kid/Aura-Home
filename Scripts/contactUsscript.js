
            document.addEventListener('DOMContentLoaded', function () {
                const form = document.getElementById('jsContactForm');

                form.addEventListener('submit', function (event) {

                    if (!form.checkValidity()) {
                        event.preventDefault();
                        event.stopPropagation();
                    } else {
                        event.preventDefault();
                        handleFormSubmission();
                    }

                    // 
                    form.classList.add('was-validated');
                }, false);

                function handleFormSubmission() {
                    const formData = {
                        firstName: document.getElementById('fName').value,
                        lastName: document.getElementById('lName').value,
                        email: document.getElementById('userEmail').value,
                        phone: document.getElementById('userPhone').value,
                        message: document.getElementById('userMsg').value,
                        date: new Date().toLocaleString()
                    };

                    console.log("Saving Contact Data:", formData);
                    alert("Thank you! Your message has been sent successfully.");

                    form.reset();
                }
            });
