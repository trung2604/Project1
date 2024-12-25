document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
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
            // Lưu thông tin người dùng vào localStorage và đợi cho đến khi lưu xong
            await new Promise(resolve => {
                localStorage.setItem('user', JSON.stringify(data));
                resolve();
            });

            successMessage.textContent = 'Login successful!';
            errorMessage.textContent = '';

            // Chuyển hướng đến trang home
            window.location.href = '/api/admin';
        } else {
            errorMessage.textContent = data.message || 'Invalid username or password!';
            successMessage.textContent = '';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'An error occurred during login. Please try again.';
        successMessage.textContent = '';
    }
});