const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersPath));
  console.log('Login request received:', req.body); // Add this

  const user = users.find(u => u.username === username && u.password === password);

  // In backend route
  if (user) {
    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token }); // Good: returns JSON
  } else {
    res.status(401).json({ error: 'Invalid credentials' }); // Changed to JSON
  }
});

module.exports = router;
