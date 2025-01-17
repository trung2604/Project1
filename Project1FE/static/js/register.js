document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        document.getElementById('errorMessage').innerText = "Passwords do not match!";
        return;
    }

    // Nếu mật khẩu khớp, gửi form
    const formData = {
        username: document.getElementById('username').value,
        password: password
    };

    fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Registration successful! Redirecting to login...');
                window.location.href = "login.html"; // Chuyển hướng sang trang login khi đăng ký thành công
            } else {
                document.getElementById('errorMessage').innerText = data.message; // Hiển thị lỗi từ API
            }
        })
        .catch(error => {
            document.getElementById('errorMessage').innerText = "An error occurred. Please try again later.";
        });
});
