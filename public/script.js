document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const voteForm = document.getElementById("vote-form");
    const loginSection = document.getElementById("login-section");
    const registerSection = document.getElementById("register-section");
    const voteSection = document.getElementById("vote-section");
    const loginMessage = document.getElementById("login-message");
    const registerMessage = document.getElementById("register-message");
    const voteMessage = document.getElementById("vote-message");

    let token = ''; // Store the JWT token here after login

    // Handle login form submission
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const data = {
            username: formData.get("username"),
            password: formData.get("password")
        };

        fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(response => {
            if (response.success) {
                token = response.token; // Store the token
                loginMessage.textContent = '';
                // Check registration status
                checkRegistrationStatus();
            } else {
                loginMessage.textContent = response.message;
            }
        })
        .catch(error => {
            console.error("Error logging in:", error);
        });
    });

    // Check if the user is registered
    function checkRegistrationStatus() {
        fetch("/is-registered", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(response => {
            if (response.isRegistered) {
                showVoteForm(); // User is registered, show voting form
            } else {
                showRegistrationForm(); // User is not registered, show registration form
            }
        })
        .catch(error => {
            console.error("Error checking registration status:", error);
        });
    }

    // Handle registration form submission
    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(registerForm);
        const data = {
            username: formData.get("username"),
            email: formData.get("email"),
            password: formData.get("password")
        };

        fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(response => {
            if (response.success) {
                registerMessage.textContent = '';
                showVoteForm(); // Show voting form after successful registration
            } else {
                registerMessage.textContent = response.message;
            }
        })
        .catch(error => {
            console.error("Error registering:", error);
        });
    });

    // Handle vote form submission
    voteForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(voteForm);
        const data = {
            candidate: formData.get("candidate")
        };

        fetch("/vote", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(response => {
            voteMessage.textContent = response.message;
        })
        .catch(error => {
            console.error("Error submitting vote:", error);
        });
    });

    // Helper functions to toggle sections
    function showRegistrationForm() {
        loginSection.style.display = 'none';
        registerSection.style.display = 'block';
        voteSection.style.display = 'none';
    }

    function showVoteForm() {
        loginSection.style.display = 'none';
        registerSection.style.display = 'none';
        voteSection.style.display = 'block';
    }
});
