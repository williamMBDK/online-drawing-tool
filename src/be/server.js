const express = require('express');
const app = express();
const server = require('http').createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 8888;

app.use(express.static('src/fe'))

const updates = {};
const cursors = {};

io.on('connection', socket => {

    console.log('a user connected with id: ', socket.id);

    let roomname = socket.id;
    let alias = "unset";
    updates[roomname] = [];
    cursors[roomname] = {};

    socket.on('set-roomname', newroomname => {
        if(roomname != socket.id) socket.leave(roomname);
        roomname = newroomname;
        socket.join(roomname)

        if(!(roomname in updates)) updates[roomname] = [];
        if(!(roomname in cursors)) cursors[roomname] = {};

        socket.emit('updates', updates[roomname]);
        socket.emit('cursor-updates', cursors[roomname]);
    });

    socket.on('new-update', update => {
        updates[roomname].push(update);
        socket.to(roomname).emit('update', update);
    });

    socket.on('set-cursor', cursor => {
        cursors[roomname][cursor.alias] = cursor;
        socket.to(roomname).emit('cursor-update', cursor);
    });

    socket.on('set-alias', newalias => {
        console.log(cursors[roomname]);
        if(alias in cursors[roomname]) {
            cursors[roomname][newalias] = cursors[roomname][alias];
            cursors[roomname][newalias].alias = newalias;
            delete cursors[roomname][alias];
        }
        console.log(cursors[roomname]);
        alias = newalias;
        io.to(roomname).emit('cursor-updates', cursors[roomname]);
    });
});

server.listen(port, () => {
    console.log(`listening on *:${port}`);
});
