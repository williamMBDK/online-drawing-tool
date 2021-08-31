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

    let roomname = "freeforall";
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
        update.id = socket.id;
        updates[roomname].push(update);
        socket.to(roomname).emit('update', update);
    });

    socket.on('undo', () => {
        const upds = updates[roomname];
        let cntdeleted = 0;
        const newupdates = [];
        for(let i = upds.length - 1; i >= 0; i--) {
            if(cntdeleted <= 30 && upds[i].id == socket.id) {
                cntdeleted++;
            } else {
                newupdates.push(upds[i]);
            }
        }
        newupdates.reverse();
        updates[roomname] = newupdates;
        io.to(roomname).emit('updates', updates[roomname]);
    });

    socket.on('set-cursor', cursor => {
        cursors[roomname][cursor.alias] = cursor;
        socket.to(roomname).emit('cursor-update', cursor);
    });

    socket.on('set-alias', newalias => {
        if(alias in cursors[roomname]) {
            cursors[roomname][newalias] = cursors[roomname][alias];
            cursors[roomname][newalias].alias = newalias;
            delete cursors[roomname][alias];
        }
        alias = newalias;
        io.to(roomname).emit('cursor-updates', cursors[roomname]);
    });

    socket.on('disconnect', function() {
        console.log("disconnect");
        if(alias in cursors[roomname]) {
            delete cursors[roomname][alias];
        }
        io.to(roomname).emit('cursor-updates', cursors[roomname]);
    });

});

server.listen(port, () => {
    console.log(`listening on *:${port}`);
});
