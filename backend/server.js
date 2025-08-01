const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json()); // Add this line to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

const authRouter = require('./routes/auth');
const materialsRouter = require('./routes/materials');
const roomsRouter = require('./routes/rooms');
const reservationsRouter = require('./routes/reservations')

app.use('/auth', authRouter);

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // No token

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user;
    next();
  });
};

app.use('/materials', authenticateToken, materialsRouter);
app.use('/rooms', authenticateToken, roomsRouter);
app.use('/reservations', authenticateToken, reservationsRouter);


app.listen(port, () => {
  console.log(`Backend app listening at http://localhost:${port}`);
});
