const loginForm = document.getElementById('login-form');
        const loginError = document.getElementById('login-error');

        // Hardcoded login credentials (replace these with a secure method in a real-world scenario)
        const validUsername = 'vortex';
        const validPassword = 'naruto';

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const enteredUsername = document.getElementById('username').value;
            const enteredPassword = document.getElementById('password').value;

            // Validate the login credentials
            if (enteredUsername === validUsername && enteredPassword === validPassword) {
                // Successful login, redirect to the encryption/decryption tool page
                window.location.href = 'tool.html';
            } else {
                // Show error message for invalid credentials
                loginError.style.display = 'block';
            }
        });