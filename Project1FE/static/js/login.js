document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    const errorMessage = document.getElementById("errorMessage");
    const successMessage = document.getElementById("successMessage");

    if (response.ok) {
      // Lưu id và role của user vào localStorage
      const user = { id: data.id, role: data.role, username: data.username };
      localStorage.setItem("user", JSON.stringify(user));

      successMessage.textContent = "Login successful!";
      errorMessage.textContent = "";

      // Kiểm tra role và chuyển hướng đến trang tương ứng
      if (data.role === "Admin") {
        window.location.href = "admin.html";
      } else if (data.role === "User") {
        window.location.href = "home.html";
      } else {
        errorMessage.textContent = "Invalid user role!";
        successMessage.textContent = "";
      }
    } else {
      errorMessage.textContent =
        data.message || "Invalid username or password!";
      successMessage.textContent = "";
    }
  } catch (error) {
    console.error("Login error:", error);
    errorMessage.textContent =
      "An error occurred during login. Please try again.";
    successMessage.textContent = "";
  }
});
