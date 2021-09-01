const options = {
  darkmode: false,
  canvasBackgroundColor: '#ffffff',
}

const enterOpMode = () => {

  options.darkmode = true;
  options.canvasBackgroundColor = '#040404';
  document.getElementById("color").value = "#bbbbbb";
  document.getElementById("top-panel").className = "darkmode";
  document.getElementById("insert-circle").style.display = "inline-block";
  document.getElementById("insert-line").style.display = "inline-block";

  let circleMode = false;
  let lineMode = false, linePos = { x: -1, y: -1 };

  const toggleCircleMode = () => {
    circleMode = !circleMode;
    if (circleMode) {
      canvas.disableDrawing();
      if (lineMode) toggleLineMode();
      document.getElementById("insert-circle").innerHTML = "inserting circle";
    } else {
      document.getElementById("insert-circle").innerHTML = "insert circle";
    }
    if (!lineMode && !circleMode) {
      canvas.enableDrawing();
    }
  }

  const toggleLineMode = () => {
    lineMode = !lineMode;
    if (lineMode) {
      canvas.disableDrawing();
      if (circleMode) toggleCircleMode();
      document.getElementById("insert-line").innerHTML = "inserting line";
    } else {
      document.getElementById("insert-line").innerHTML = "insert line";
    }
    if (!lineMode && !circleMode) {
      canvas.enableDrawing();
    }
  }

  document.getElementById("insert-circle").addEventListener('click', toggleCircleMode);
  document.getElementById("insert-line").addEventListener('click', toggleLineMode);

  const canvasElement = document.getElementById("can");
  const getPos = e => {
    const x = e.clientX - canvasElement.offsetLeft;
    const y = e.clientY - canvasElement.offsetTop;
    return { x, y };
  };

  canvasElement.addEventListener('click', e => {
    const pos = getPos(e);
    if (circleMode) {
      canvas.addNewUpdate(new Circle(pos.x, pos.y, 30));
    }
    if (lineMode) {
      if (linePos.x != -1 && linePos.y != -1) {
        canvas.addNewUpdate(new Line(linePos.x, linePos.y, pos.x, pos.y));
        linePos = { x: -1, y: -1 };
      } else {
        linePos = pos;
      }
    }
  });

  window.onload();
}
