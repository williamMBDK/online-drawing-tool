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
    this.onPan = () => { }
    this.mousePosition = { x: -1, y: -1 };

    const drawState = {
      mousedown: false,
      prevpos: { x: -1, y: -1 },
      hasmoved: false
    };

    const panState = {
      mousedown: false,
      prevpos: { x: -1, y: -1 },
    };

    const getPos = e => {
      const x = e.clientX - element.offsetLeft;
      const y = e.clientY - element.offsetTop;
      return { x, y };
    };
    const isPanning = e => {
      return e.which == 1 && (e.altKey || e.ctrlKey || e.shiftKey);
    };
    const isDrawing = e => {
      return (!isPanning(e)) && e.which == 1;
    };
    element.addEventListener("mousemove", e => {
      const pos = getPos(e);

      // drawing
      if (drawState.mousedown) {
        this.onLineDrawn(new Line(drawState.prevpos.x, drawState.prevpos.y, pos.x, pos.y));
        drawState.prevpos = pos;
        drawState.hasmoved = true;
      }

      // panning
      if (panState.mousedown) {
        this.onPan(panState.prevpos, pos);
        panState.prevpos = pos;
      }

      // general mouse movement handler
      this.onCursorMove(pos);
      this.mousePosition = pos;
    }, false);
    element.addEventListener("mousedown", e => {
      const pos = getPos(e);
      if (isDrawing(e)) {
        drawState.hasmoved = false;
        drawState.mousedown = true;
        drawState.prevpos = pos;
      } else if (isPanning(e)) {
        panState.mousedown = true;
        panState.prevpos = pos;
      }
      this.mousePosition = pos;
    }, false);
    element.addEventListener("mouseup", e => {
      const pos = getPos(e);
      if (isDrawing(e) || isPanning(e)) {
        // drawing 
        if (drawState.mousedown) {
          if (!drawState.hasmoved) {
            this.onLineDrawn(new Line(pos.x - 1, pos.y - 1, pos.x + 1, pos.y + 1));
            this.onLineDrawn(new Line(pos.x - 1, pos.y + 1, pos.x + 1, pos.y - 1));
          }
          drawState.mousedown = false;
        }
        // panning
        if (panState.mousedown) {
          panState.mousedown = false;
        }
      }
      this.mousePosition = pos;
    }, false);
    element.addEventListener("mouseout", e => {
      drawState.mousedown = false;
      panState.mousedown = false;
      this.onCursorMove({ x: -1, y: -1 });
      this.mousePosition = { x: -1, y: -1 };
    }, false);
  }
  setOnLineDrawn(func) {
    this.onLineDrawn = func;
  }
  setOnCursorMove(func) {
    this.onCursorMove = func;
  }
  setOnPan(func) {
    this.onPan = func;
  }
  getMousePosition() {
    return this.mousePosition;
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
    this.element.innerHTML = cursor.alias.substring(0, Math.min(3, escapeXml(cursor.alias).length));
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

class ZoomManager {
  constructor() {
    console.assert(!window.onscroll);
    this.zoom = 6;
    this.onZoom = () => { };
    window.onwheel = e => {
      if (e.deltaY > 0) {
        this.zoom *= 1.1;
        if (this.zoom > 100) this.zoom = 100;
        this.onZoom();
      } else if (e.deltaY < 0) {
        this.zoom /= 1.1;
        if (this.zoom < 1) this.zoom = 1;
        this.onZoom();
      }
    }
  }
  reset() {
    this.zoom = 6;
  }
  getZoomFactor() {
    return this.zoom;
  }
  setOnZoom(func) {
    this.onZoom = func;
  }
}

class PanManager {
  constructor(mousehandler) {
    this.onPan = () => { };
    this.offset = {
      dx: 0,
      dy: 0,
    };
    this.zoomManager = new ZoomManager();
    let prevzoom = this.zoomManager.getZoomFactor();
    this.zoomManager.setOnZoom(() => {
      const mousePos = mousehandler.getMousePosition();
      if (mousePos.x != -1 && mousePos.y != -1) {
        const newMousePos = this.getCanvasPosition(this.getRealPosition(mousePos, prevzoom));
        const dx = newMousePos.x - mousePos.x;
        const dy = newMousePos.y - mousePos.y;
        this.offset.dx += dx;
        this.offset.dy += dy;
      }
      prevzoom = this.zoomManager.getZoomFactor();
      this.onPan();
    });
    mousehandler.setOnPan((p1, p2) => {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      this.offset.dx += dx;
      this.offset.dy += dy;
      this.onPan();
    });
    const resetElement = document.querySelector('#resetzoomoffset');
    resetElement.onclick = () => {
      this.offset = {
        dx: 0,
        dy: 0,
      }
      this.zoomManager.reset();
      prevzoom = this.zoomManager.getZoomFactor();
      this.onPan();
    }
  }
  setOnPan(func) {
    this.onPan = func;
  }
  getRealPosition(pos, zoomfactor = this.zoomManager.getZoomFactor()) {
    return { x: (pos.x + this.offset.dx) * zoomfactor, y: (pos.y + this.offset.dy) * zoomfactor };
  }
  getCanvasPosition(pos, zoomfactor = this.zoomManager.getZoomFactor()) {
    return { x: pos.x / zoomfactor - this.offset.dx, y: pos.y / zoomfactor - this.offset.dy };
  }
  getRealLength(len) {
    const zoomfactor = this.zoomManager.getZoomFactor();
    return len * zoomfactor;
  }
  getCanvasLength(len) {
    const zoomfactor = this.zoomManager.getZoomFactor();
    return len / zoomfactor;
  }
}

class Canvas {
  constructor() {
    this.canvas = document.querySelector("#can");
    this.setDimensions();
    this.ctx = this.canvas.getContext("2d");

    this.stylepicker = new StylePicker();

    this.updates = [];
    this.cursors = {};
    this.cursorElements = {};

    this.onNewUpdate = () => { }
    this.onCursorMove = () => { }

    this.mousehandler = new MouseHandler(this.canvas);
    this.mousehandler.setOnLineDrawn(this.addNewUpdate.bind(this));


    this.panManager = new PanManager(this.mousehandler); // also handles zoom
    this.panManager.setOnPan(this.redraw.bind(this));

    this.mousehandler.setOnCursorMove(pos => {
      if (pos.x == -1 || pos.y == -1) {
        this.onCursorMove(pos);
      } else {
        this.onCursorMove(this.panManager.getRealPosition(pos));
      }
    });
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
    for (const alias of Object.keys(this.cursorElements)) {
      if ((!(alias in this.cursors)) || this.cursors[alias].pos.x == -1 || this.cursors[alias].pos.y == -1) {
        this.cursorElements[alias].destroy();
        delete this.cursorElements[alias];
      }
    }
    for (const cursor of Object.values(this.cursors)) {
      if (cursor.pos.x == -1 || cursor.pos.y == -1) continue;
      if (cursor.alias == alias) continue;
      if (!(cursor.alias in this.cursorElements)) this.cursorElements[cursor.alias] = new CursorElement();
      console.log(cursor);
      this.cursorElements[cursor.alias].render({
        ...cursor,
        pos: this.panManager.getCanvasPosition(cursor.pos),
      });
    }
  }
  setDimensions() {
    const container = document.getElementById("container");
    const w = document.body.clientWidth;
    const h = document.body.clientHeight;
    container.style.width = w + "px";
    container.style.height = h + "px";
    this.canvas.width = w;
    this.canvas.height = h;
  }
  redraw() {
    this.setDimensions();
    this.setUpdates(this.updates);
    this.setCursors(this.cursors);
  }
  addNewUpdate(update) {
    if (update.type == "line") {
      const p1 = this.panManager.getRealPosition({ x: update.x1, y: update.y1 });
      const p2 = this.panManager.getRealPosition({ x: update.x2, y: update.y2 });
      update.x1 = p1.x, update.y1 = p1.y;
      update.x2 = p2.x, update.y2 = p2.y;
      update.color = this.stylepicker.getColor();
      update.linesize = this.panManager.getRealLength(this.stylepicker.getLineSize());
    }
    this.addUpdate(update);
    this.onNewUpdate(update);
  }
  setUpdates(updates) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.updates = [];
    for (const update of updates) this.addUpdate(update);
  }
  addUpdate(update) {
    this.updates.push(update)
    if (update.type == "line") {
      this.addLineToCanvas(update)
    }
  }
  addLineToCanvas(line) {
    this.ctx.beginPath();
    const p1 = this.panManager.getCanvasPosition({ x: line.x1, y: line.y1 });
    const p2 = this.panManager.getCanvasPosition({ x: line.x2, y: line.y2 });
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.strokeStyle = line.color;
    this.ctx.lineWidth = this.panManager.getCanvasLength(line.linesize);
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
