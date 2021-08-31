const getRandomColor = () => {
  const letters = '6789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}

const escapeXml = unsafe => {
  if (unsafe == null) return null;
  return unsafe.replace(/[<>&'"]/g, function(c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

let roomname;
let alias;
let cursorcolor = getRandomColor();
let socket;
let canvas;
let statusbarUpdater;

const updateStatusBar = () => {
  document.getElementById("alias-p").innerHTML = `Alias: ${escapeXml(alias.substr(0, alias.length - 14))}`;
  document.getElementById("room-p").innerHTML = `Room: ${escapeXml(roomname)}`;
  if (socket.connected) {
    document.getElementById("status-p").innerHTML = "Status: connected";
    document.getElementById("status-p").style.backgroundColor = "#59cf44";
  } else {
    document.getElementById("status-p").innerHTML = "Status: disconnected";
    document.getElementById("status-p").style.backgroundColor = "#bf564e";
  }
}

const getQueryVariable = variable => {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    if (decodeURIComponent(pair[0]) == variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  return null;
}

const setalias = forceprompt => {
  let newalias = null;
  if (!forceprompt) newalias = localStorage.getItem("alias");
  while (newalias == null || (!newalias.replace(/\s/g, '').length)) {
    newalias = prompt("Enter your alias: ");
  }
  alias = newalias;
  localStorage.setItem("alias", alias);
  alias += "    " + randomstring(10);
  socket.emit("set-alias", alias);
  cursorcolor = getRandomColor();
  socket.emit("set-cursor", {
    pos: { x: -1, y: -1 },
    alias,
    color: cursorcolor
  });
  updateStatusBar();
}

const randomstring = length => {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const setroomname = forceprompt => {
  let newroomname = getQueryVariable("room");
  if (newroomname == null || (!newroomname.replace(/\s/g, '').length) || forceprompt) {
    newroomname = null;
    while (newroomname == null || (!newroomname.replace(/\s/g, '').length)) {
      newroomname = prompt("Enter roomname (random for random roomname): ");
    }
    if (newroomname == "random") {
      newroomname = randomstring(30);
    }
    window.location.search = `?room=${newroomname}`;
  }
  roomname = newroomname;
  socket.emit("set-roomname", roomname);
  updateStatusBar();
}

const onload = () => {

  if (!canvas) canvas = new Canvas();
  if (!socket) socket = io();
  canvas.redraw();

  cursorcolor = getRandomColor();
  setalias(false);
  setroomname(false);

  socket.on('update', update => {
    canvas.addUpdate(update);
  });

  socket.on('updates', updates => {
    canvas.setUpdates(updates);
    canvas.redraw(); // here we are redrawing twice, not necessary
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
