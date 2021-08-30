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
        this.color = "unset";
        this.linesize = -1;
    }
}

class MouseHandler {
    constructor(element) {
        this.onLineDrawn = () => { }
        this.onCursorMove = () => { }
        this.mousedown = false
        this.prevpos = { x: -1, y: -1 }

        let hasmoved = false;

        const getPos = e => {
            const x = e.clientX - element.offsetLeft;
            const y = e.clientY - element.offsetTop;
            return { x, y };
        }
        element.addEventListener("mousemove", e => {
            const pos = getPos(e);
            if (this.mousedown) {
                this.onLineDrawn(new Line(this.prevpos.x, this.prevpos.y, pos.x, pos.y));
                this.prevpos = pos;
            }
            this.onCursorMove(pos);
            hasmoved = true;
        }, false);
        element.addEventListener("mousedown", e => {
            hasmoved = false;
            this.mousedown = true;
            this.prevpos = getPos(e);
        }, false);
        element.addEventListener("mouseup", e => {
            const pos = getPos(e);
            if(!hasmoved) {
                this.onLineDrawn(new Line(pos.x - 1, pos.y - 1, pos.x + 1, pos.y + 1));
            }
            this.mousedown = false;
        }, false);
        element.addEventListener("mouseout", e => {
            this.mousedown = false;
            this.onCursorMove({x : -1, y : -1});
        }, false);
    }
    setOnLineDrawn(func) {
        this.onLineDrawn = func;
    }
    setOnCursorMove(func) {
        this.onCursorMove = func;
    }
}

class CursorElement {
    
    constructor() {
        const container = document.getElementById("container");
        this.element = document.createElement("div");
        this.element.className = "cursor";
        container.appendChild(this.element);
    }
    render(cursor) {
        this.element.innerHTML = cursor.alias.substring(0, Math.min(3, cursor.alias.length));
        this.element.style.backgroundColor = cursor.color;
        this.element.style.left = cursor.pos.x + "px";
        this.element.style.top = cursor.pos.y + "px";
    }
    destroy() {
        this.element.remove();
    }
}

class StylePicker {
    constructor() {
        this.colorelement = document.querySelector('#color');
        this.sizeelement = document.querySelector('#linesize');
    }
    getColor() {
        return this.colorelement.value;
    }
    getLineSize() {
        return Number(this.sizeelement.value);
    }
}

class Canvas {
    constructor() {
        const container = document.getElementById("container");
        const w = document.body.clientWidth;
        const h = document.body.clientHeight;
        container.style.width = w + "px";
        container.style.height = h + "px";
        this.canvas = document.querySelector("#can");
        this.canvas.width = w;
        this.canvas.height = h;
        this.ctx = this.canvas.getContext("2d");

        this.stylepicker = new StylePicker();

        this.updates = [];
        this.cursors = {};
        this.cursorElements = {};

        this.onNewUpdate = () => { }
        this.onCursorMove = () => { }

        this.mousehandler = new MouseHandler(this.canvas);
        this.mousehandler.setOnLineDrawn(this.addNewUpdate.bind(this));
        this.mousehandler.setOnCursorMove(pos => this.onCursorMove(pos));
    }
    updateCursor(cursor) {
        this.cursors[cursor.alias] = cursor;
        this.renderCursors();
    }
    setCursors(cursors) {
        this.cursors = cursors;
        this.renderCursors();
    }
    renderCursors() {
        for(const alias of Object.keys(this.cursorElements)) {
            if((!(alias in this.cursors)) || this.cursors[alias].pos.x == -1 || this.cursors[alias].pos.y == -1) {
                this.cursorElements[alias].destroy();
                delete this.cursorElements[alias];
            }
        }
        for(const cursor of Object.values(this.cursors)) {
            if(cursor.pos.x == -1 || cursor.pos.y == -1) continue;
            if(cursor.alias == alias) continue;
            if(!(cursor.alias in this.cursorElements)) this.cursorElements[cursor.alias] = new CursorElement();
            this.cursorElements[cursor.alias].render(cursor);
        }
    }
    addNewUpdate(update) {
        if(update.type == "line") {
            update.color = this.stylepicker.getColor();
            update.linesize = this.stylepicker.getLineSize();
        }
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
        this.ctx.strokeStyle = line.color;
        this.ctx.lineWidth = line.linesize;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
        this.ctx.closePath();
    }
    setOnNewUpdate(func) {
        this.onNewUpdate = func;
    }
    setOnCursorMove(func) {
        this.onCursorMove = func;
    }
}
