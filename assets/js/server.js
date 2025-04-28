// SERVER-SIDE CODE (Node.js with Express)
// ----------------------------------------
// Save this as server.js

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public')); // Serve static files

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/profitX', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// User Schema
const userSchema = new mongoose.Schema({
  accountCode: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

// Generate a cryptographically secure account code
app.get('/api/generate-account', (req, res) => {
  const accountCode = crypto.randomBytes(16).toString('hex');
  res.json({ accountCode });
});

// Register a new account
app.post('/api/register', async (req, res) => {
  try {
    const { accountCode, password } = req.body;
    
    // Check if account code already exists
    const existingUser = await User.findOne({ accountCode });
    if (existingUser) {
      return res.status(400).json({ error: 'Account code already in use' });
    }
    
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Create new user
    const newUser = new User({
      accountCode,
      passwordHash
    });
    
    await newUser.save();
    res.status(201).json({ success: true, message: 'Account created successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { accountCode, password } = req.body;
    
    // Find user
    const user = await User.findOne({ accountCode });
    if (!user) {
      return res.status(401).json({ error: 'Invalid account code or password' });
    }
    
    // Check password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid account code or password' });
    }
    
    // Generate JWT token for authentication (in a real implementation)
    // const token = jwt.sign({ accountCode: user.accountCode }, 'your-secret-key', { expiresIn: '1h' });
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      // token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// CLIENT-SIDE CODE
// ----------------------------------------
// Save this as public/assets/js/accountSystem.js

// Function to generate an account code
async function generateAccount() {
  try {
    const response = await fetch('/api/generate-account');
    const data = await response.json();
    
    document.getElementById('newCode').textContent = data.accountCode;
    document.getElementById('accountDetails').style.display = 'block';
  } catch (error) {
    console.error('Error generating account:', error);
    document.getElementById('registerMsg').textContent = 'Error generating account. Please try again.';
  }
}

// Function to register a new account
async function registerAccount() {
  const accountCode = document.getElementById('newCode').textContent;
  const password = document.getElementById('newPassword').value;
  const registerMsg = document.getElementById('registerMsg');
  
  if (!password) {
    registerMsg.textContent = 'Please enter a password';
    return;
  }
  
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ accountCode, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      registerMsg.textContent = 'Account registered successfully! You can now log in.';
      registerMsg.style.color = 'green';
    } else {
      registerMsg.textContent = data.error || 'Registration failed. Please try again.';
      registerMsg.style.color = 'red';
    }
  } catch (error) {
    console.error('Registration error:', error);
    registerMsg.textContent = 'Server error. Please try again later.';
    registerMsg.style.color = 'red';
  }
}

// Function to log in
async function login() {
  const accountCode = document.getElementById('loginCode').value;
  const password = document.getElementById('loginPassword').value;
  const loginMsg = document.getElementById('loginMsg');
  
  if (!accountCode || !password) {
    loginMsg.textContent = 'Please enter both account code and password';
    loginMsg.style.color = 'red';
    return;
  }
  
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ accountCode, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      loginMsg.textContent = 'Login successful! Redirecting...';
      loginMsg.style.color = 'green';
      
      // Store token in localStorage (in a real implementation)
      // localStorage.setItem('token', data.token);
      
      // Redirect to user dashboard
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1500);
    } else {
      loginMsg.textContent = data.error || 'Login failed. Please check your credentials.';
      loginMsg.style.color = 'red';
    }
  } catch (error) {
    console.error('Login error:', error);
    loginMsg.textContent = 'Server error. Please try again later.';
    loginMsg.style.color = 'red';
  }
}