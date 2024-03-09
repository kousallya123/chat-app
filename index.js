// app.js (or whatever your main file is named)
const express = require('express');
const http = require('http');
const path = require('path');
const { configureWebSocket } = require('./socket');
const routes = require('./routes/routes');

const app = express();
const server = http.createServer(app);


// Configure WebSocket and use routes
configureWebSocket(server);
app.use(routes);

// Serve static files
app.use(express.static('public'));

// JSON parsing middleware
app.use(express.json());

// Serve HTML files based on the route
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
