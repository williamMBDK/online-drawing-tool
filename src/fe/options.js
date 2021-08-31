const options = {
  darkmode: false,
  canvasBackgroundColor : '#ffffff',
}

const enterOpMode = () => {
  options.darkmode = true;
  options.canvasBackgroundColor = '#040404';
  document.getElementById("color").value = "#bbbbbb";
  document.getElementById("top-panel").className = "darkmode";
  document.getElementById("insert-circle").style.display = "inline-block";

  let circleMode = false;
  document.getElementById("insert-circle").addEventListener('click', e => {
    circleMode = !circleMode;
    if(circleMode) {
      document.getElementById("insert-circle").innerHTML = "inserting node";
    } else {
      document.getElementById("insert-circle").innerHTML = "insert node";
    }
  })
  document.getElementById("can").addEventListener('click', e => {
    if(!circleMode) return;
    const element = document.getElementById("can");
    const getPos = e => {
      const x = e.clientX - element.offsetLeft;
      const y = e.clientY - element.offsetTop;
      return { x, y };
    };
    const pos = getPos(e);
    canvas.addNewUpdate(new Circle(pos.x, pos.y, 30));
  })
  window.onload();
}
