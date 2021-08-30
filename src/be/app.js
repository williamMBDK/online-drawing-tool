const port = 7777;
const server = require("http").createServer((req, res) => {
  req.setHeader('Access-Control-Allow-Headers', req.header.origin);
});

server.listen(port, "0.0.0.0", () => console.log(`listening for requests on port ${port}...`));

const wsserver = new (require("websocket")).server({
  httpServer: server,
  //autoAcceptConnections : true
});
let messages = [];
const connections = {};
const sendMessageToAllClients = (message) => {
  for (const id in connections) {
    connections[id].send(JSON.stringify([message]));
  }
};
wsserver.on("request", req => {
  const connection = req.accept(null, req.origin);
  const id = connection.remoteAddress + " " + (new Date()).getTime();

  connection.send(JSON.stringify(messages));

  connection.on("message", mes => {
    console.log(mes);
    if (mes.type == "utf8") {
      sendMessageToAllClients(mes.utf8Data);
    }
  });
  connection.on("close", (reasonCode, description) => {
    delete connections[id];
  });
});
