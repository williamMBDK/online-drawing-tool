const alias = (() => {
  if (localStorage.getItem("alias")) {
    return localStorage.getItem("alias");
  } else {
    const alias = prompt("Enter your alias: ");
    localStorage.setItem("alias", alias);
    return alias;
  }
})();

const socket = io();
const canvas = new Canvas();

class Payload {
  constructor(update) {
    this.alias = alias;
    this.update = update;
  }
};

const sendUpdate = update => socket.emit('new-update', new Payload(update))

const receiveUpdates = updates => {
  updates.forEach(update => canvas.addUpdate(update.update));
}

socket.on('update', update => receiveUpdates([update]))
socket.on('updates', receiveUpdates)

canvas.setOnNewUpdate(sendUpdate.bind(this))
