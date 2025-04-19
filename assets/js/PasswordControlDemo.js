// Generate a pseudo-random account code
function generateAccount() {
  const code = "0x" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  document.getElementById("newCode").innerText = code;
  localStorage.setItem("tempCode", code);
  document.getElementById("accountDetails").style.display = "block"; // Show the rest
}

  
  // Register the account
  function registerAccount() {
    const code = localStorage.getItem("tempCode");
    const password = document.getElementById("newPassword").value;
    if (!code || !password) {
      document.getElementById("registerMsg").innerText = "Please generate an account code and enter a password.";
      return;
    }
    const accountData = {
      password: password
    };
    localStorage.setItem("account_" + code, JSON.stringify(accountData));
    document.getElementById("registerMsg").innerText = "Account registered! Make sure to save your code: " + code;
    document.getElementById("newPassword").value = "";
  }
  
  // Login
  function login() {
    const code = document.getElementById("loginCode").value;
    const password = document.getElementById("loginPassword").value;
    const data = localStorage.getItem("account_" + code);
    if (!data) {
      document.getElementById("loginMsg").innerText = "Account not found.";
      return;
    }
    const account = JSON.parse(data);
    if (account.password === password) {
      document.getElementById("loginMsg").innerText = "Login successful! Welcome back.";
    } else {
      document.getElementById("loginMsg").innerText = "Incorrect password.";
    }
  }
  