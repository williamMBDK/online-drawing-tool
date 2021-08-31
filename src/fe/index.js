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
let statusbarUpdater;

const updateStatusBar = () => {
  document.getElementById("alias-p").innerHTML = `Alias: ${alias}`;
  document.getElementById("room-p").innerHTML = `Room: ${roomname}`;
  if (socket.connected) {
    document.getElementById("status-p").innerHTML = "Status: connected";
    document.getElementById("status-p").style.backgroundColor = "#59cf44";
  } else {
    document.getElementById("status-p").innerHTML = "Status: disconnected";
    document.getElementById("status-p").style.backgroundColor = "#bf564e";
  }
}

const setalias = forceprompt => {
  let newalias = null;
  if (!forceprompt) newalias = localStorage.getItem("alias");
  while (newalias == null || (!newalias.replace(/\s/g, '').length)) {
    newalias = prompt("Enter your alias: ");
  }
  alias = newalias;
  localStorage.setItem("alias", alias);
  socket.emit("set-alias", alias);
  cursorcolor = getRandomColor();
  socket.emit("set-cursor", {
    pos: { x: -1, y: -1 },
    alias,
    color: cursorcolor
  });
  updateStatusBar();
}

const setroomname = forceprompt => {
  let newroomname = null;
  if (!forceprompt) newroomname = localStorage.getItem("roomname");
  while (newroomname == null || (!newroomname.replace(/\s/g, '').length)) {
    newroomname = prompt("Enter roomname: ");
  }
  roomname = newroomname;
  localStorage.setItem("roomname", roomname);
  socket.emit("set-roomname", roomname);
  updateStatusBar();
}

const onload = () => {

  if (!canvas) canvas = new Canvas();
  if (socket) socket.disconnect();
  canvas.redraw();
  socket = io();

  cursorcolor = getRandomColor();
  setalias(false);
  setroomname(false);

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
      color: cursorcolor
    });
  });

  document.getElementById('setalias').onclick = () => setalias(true);
  document.getElementById('setroomname').onclick = () => setroomname(true);
  document.getElementById('undobtn').onclick = () => {
    socket.emit('undo');
  };
  document.getElementById('resetroomcontent').onclick = () => {
    if (window.confirm("Are you sure you want to clear the contents of this room?")) {
      socket.emit("reset-room-content");
    }
  };

  if (statusbarUpdater) clearInterval(statusbarUpdater);
  statusbarUpdater = setInterval(updateStatusBar, 1000);
}

window.onload = onload;
window.onresize = onload;
