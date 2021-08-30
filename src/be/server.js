const express = require('express');
const app = express();
const server = require('http').createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 8888;

app.use(express.static('src/fe'))

const updates = {};

io.on('connection', (socket) => {
    console.log('a user connected with id: ', socket.id);
    updates[socket.id] = [];
    const getroom = () => {
        console.assert(socket.rooms.size == 1);
        for(const roomname of socket.rooms) {
            return roomname;
        }
    };
    socket.on('set-roomname', roomname => {
        socket.leave(getroom());
        socket.join(roomname)
        if(!(roomname in updates)) updates[roomname] = [];
        socket.emit('updates', updates[roomname]);
    });
    socket.on('new-update', payload => {
        const room = getroom();
        const update = payload.update;
        updates[room].push(update);
        socket.broadcast.to(room).emit('update', update);
    });
});

server.listen(port, () => {
    console.log(`listening on *:${port}`);
});
