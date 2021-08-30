let roomname;
let alias;
const socket = io();
const canvas = new Canvas();

const setalias = () => {
    const newalias = prompt("Enter your alias: ");
    if (newalias == null) return;
    alias = newalias;
    localStorage.setItem("alias", alias);
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

class Payload {
    constructor(update) {
        this.alias = alias;
        this.update = update;
    }
};

const sendUpdate = update => socket.emit('new-update', new Payload(update))

const receiveUpdates = updates => {
    console.log(updates);
    for(update of updates) canvas.addUpdate(update.update);
}

const onload = () => {

    document.getElementById('setalias').onclick = setalias;
    document.getElementById('setroomname').onclick = setroomname;

    alias = (() => {
        if (localStorage.getItem("alias")) {
            return localStorage.getItem("alias");
        } else {
            return setalias();
        }
    });

    roomname = (() => {
        if (localStorage.getItem("roomname")) {
            return localStorage.getItem("roomname");
        } else {
            return setroomname();
        }
    });

    socket.on('update', update => receiveUpdates([update]))
    socket.on('updates', receiveUpdates)

    socket.emit("set-roomname", roomname);

    canvas.setOnNewUpdate(sendUpdate.bind(this))
}

window.onload = onload;
