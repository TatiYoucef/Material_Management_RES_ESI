const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const authenticateToken = require('./middleware/auth');

// Enable CORS for all routes
app.use(cors());
app.use(express.json()); // Add this line to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

const authRouter = require('./routes/auth');
const materialsRouter = require('./routes/materials');
const roomsRouter = require('./routes/rooms');
const reservationsRouter = require('./routes/reservations');
const filesRouter = require('./routes/files');

app.use('/auth', authRouter);

app.use('/materials', authenticateToken, materialsRouter);
app.use('/rooms', authenticateToken, roomsRouter);
app.use('/reservations', authenticateToken, reservationsRouter);
app.use('/files', authenticateToken, filesRouter);


app.listen(port, () => {
  console.log(`Backend app listening at http://localhost:${port}`);
});
