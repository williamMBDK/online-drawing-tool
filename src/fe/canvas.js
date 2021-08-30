class Update {
    constructor(type) {
        this.type = type
    }
}
class Line extends Update {
    constructor(x1, y1, x2, y2) {
        super("line")
        this.x1 = x1
        this.y1 = y1
        this.x2 = x2
        this.y2 = y2
    }
}

class MouseHandler {
    constructor(element) {
        this.onLineDrawn = () => { }
        this.mousedown = false
        this.prevpos = { x: -1, y: -1 }
        const getPos = e => {
            const x = e.clientX - element.offsetLeft;
            const y = e.clientY - element.offsetTop;
            return { x, y };
        }
        element.addEventListener("mousemove", e => {
            if (this.mousedown) {
                const pos = getPos(e);
                this.onLineDrawn(new Line(this.prevpos.x, this.prevpos.y, pos.x, pos.y));
                this.prevpos = pos;
            }
        }, false);
        element.addEventListener("mousedown", e => {
            this.mousedown = true;
            this.prevpos = getPos(e);
        }, false);
        element.addEventListener("mouseup", e => {
            this.mousedown = false;
        }, false);
        element.addEventListener("mouseout", e => {
            this.mousedown = false;
        }, false);
    }
    setOnLineDrawn(func) {
        this.onLineDrawn = func
    }
}

class Canvas {
    constructor() {
        this.canvas = document.querySelector("#can");
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
        this.ctx = this.canvas.getContext("2d");

        this.mousehandler = new MouseHandler(this.canvas);
        this.mousehandler.setOnLineDrawn(this.addNewUpdate.bind(this));

        this.updates = []

        this.onNewUpdate = () => { }
    }
    addNewUpdate(update) {
        this.addUpdate(update);
        this.onNewUpdate(update);
    }
    setUpdates(updates) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updates = [];
        for(const update of updates) this.addUpdate(update);
    }
    addUpdate(update) {
        this.updates.push(update)
        if (update.type == "line") {
            this.addLineToCanvas(update)
        }
    }
    addLineToCanvas(line) {
        this.ctx.beginPath();
        this.ctx.moveTo(line.x1, line.y1);
        this.ctx.lineTo(line.x2, line.y2);
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.closePath();
    }
    setOnNewUpdate(func) {
        this.onNewUpdate = func;
    }
}
