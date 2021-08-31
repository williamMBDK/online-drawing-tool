const getRandomColor = () => {
    const letters = '6789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}

let roomname;
let alias;
let cursorcolor = getRandomColor();
let socket;
let canvas;

const setalias = () => {
    const newalias = prompt("Enter your alias: ");
    if (newalias == null) return;
    alias = newalias;
    localStorage.setItem("alias", alias);
    socket.emit("set-alias", alias);
    cursorcolor = getRandomColor();
    return alias;
}

const setroomname = () => {
    const newname = prompt("Enter roomname: ");
    if (newname == null) return;
    roomname = newname;
    localStorage.setItem("roomname", roomname);
    socket.emit("set-roomname", roomname);
    return roomname;
}

const onload = () => {

    if(!canvas) canvas = new Canvas();
    if(socket) socket.disconnect();
    canvas.redraw();
    socket = io();

    alias = (() => {
        if (localStorage.getItem("alias")) {
            return localStorage.getItem("alias");
        } else {
            return setalias();
        }
    })();
    cursorcolor = getRandomColor();

    roomname = (() => {
        if (localStorage.getItem("roomname")) {
            return localStorage.getItem("roomname");
        } else {
            return setroomname();
        }
    })();

    document.getElementById('setalias').onclick = setalias;
    document.getElementById('setroomname').onclick = setroomname;
    document.getElementById('undobtn').onclick = () => {
        socket.emit('undo');
    };

    socket.on('update', update => {
        canvas.addUpdate(update);
    });

    socket.on('updates', updates => {
        canvas.setUpdates(updates);
    });

    socket.on('cursor-update', cursor => {
        canvas.updateCursor(cursor);
    });

    socket.on('cursor-updates', cursors => {
        canvas.setCursors(cursors);
    });

    socket.emit("set-alias", alias);
    socket.emit("set-roomname", roomname);

    canvas.setOnNewUpdate(update => {
        socket.emit('new-update', update);
    });

    canvas.setOnCursorMove(pos => {
        socket.emit("set-cursor", {
            pos,
            alias,
            color : cursorcolor
        });
    });
}

window.onload = onload;
window.onresize = onload;
