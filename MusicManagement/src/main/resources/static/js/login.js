document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    if (response.ok) {
        successMessage.textContent = 'Login successful!';
        errorMessage.textContent = '';
        // Redirect to dashboard after successful login
        setTimeout(() => {
            window.location.href = '/api/songs';  // Chuyển đến trang dashboard (hoặc trang cần thiết)
        }, 1000);
    } else {
        errorMessage.textContent = data.message || 'Invalid username or password!';
        successMessage.textContent = '';
    }
});
