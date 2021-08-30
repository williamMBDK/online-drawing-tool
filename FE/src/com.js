const backend = "127.0.0.1:7777";

const alias = (() => {
    if(localStorage.getItem("alias")){
        return localStorage.getItem("alias");
    }else{
        const alias = prompt("Enter your alias: ");
        localStorage.setItem("alias", alias);
        return alias;
    }
})();

const socket = new WebSocket(`ws://${backend}`);
const canvas = new Canvas();

function Payload(update){
    this.alias = alias;
    this.update = update;
};

const sendUpdate = update => {
    socket.send(JSON.stringify(new Payload(update)));
}

const receiveUpdates = data => {
    if(mes.data == "") {
        assert(false);
        return;
    }
    const updates = JSON.parse(data.updates);
    updates.forEach(update => canvas.addUpdate(update));
}

socket.addEventListener("open", () => {
    console.log("socket successfully opened");
});

socket.addEventListener("updates", updates => handleRecievedMessages(updates));

canvas.setOnNewUpdate(sendUpdate.bind(this))
