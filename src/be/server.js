const express = require('express');
const app = express();
const server = require('http').createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 8888;

app.use(express.static('src/fe'))

const updates = [];

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('updates', updates);
  socket.on('new-update', update => {
    updates.push(update);
    socket.broadcast.emit('update', update);
  });
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
