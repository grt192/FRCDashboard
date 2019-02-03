ui.fieldmap = document.getElementById("fieldmap");

function loadImage(name) {
    let img = new Image();
    img.src = 'images/' + name;
    return img;
}

var images = {
    map: loadImage('testfield2.png'),
    robot: loadImage('robot.png')
};


var mapCtx = ui.fieldmap.getContext("2d");

function drawImageCentered(img) {
    mapCtx.drawImage(img, -img.width/2, -img.height/2);
}

function drawFieldMap() {
    mapCtx.drawImage(images.map, 0, 0);
    let x = NetworkTables.getValue('/PositionTracking/x', 0) * 2;
    let y = NetworkTables.getValue('/PositionTracking/y', 0) * 2;
    let angle = NetworkTables.getValue('/PositionTracking/angle', 0);
    let mode = NetworkTables.getValue('/Robot/mode', 0);
    if (mode != 0) {
        let path = NetworkTables.getValue('/Pathfinding/path', []);
        console.log(path);
        mapCtx.beginPath();
        mapCtx.moveTo(x, y);
        for (let i = 0; i < path.length; i += 2) {
            mapCtx.lineTo(path[i] * 2, path[i+1]*2);
        }
        mapCtx.stroke();
    }
    mapCtx.translate(x, y);
    mapCtx.rotate(angle);
    drawImageCentered(images.robot);
    mapCtx.setTransform(1, 0, 0, 1, 0, 0);
}

ui.fieldmap.toRelativeCoords = function(ev) { // stolen from https://stackoverflow.com/a/27204937
    let x,y;
    //This is the current screen rectangle of canvas
    let rect = this.getBoundingClientRect();
    let top = rect.top;
    let bottom = rect.bottom;
    let left = rect.left;
    let right = rect.right;
    //Recalculate mouse offsets to relative offsets
    x = ev.clientX - left;
    y = ev.clientY - top;
    //Also recalculate offsets of canvas is stretched
    let width = right - left;
    //I use this to reduce number of calculations for images that have normal size 
    if(this.width!=width) {
      var height = bottom - top;
      //changes coordinates by ratio
      x = x*(this.width/width);
      y = y*(this.height/height);
    } 
    //Return as an array
    return [x,y];
}


ui.fieldmap.onclick = (ev) => {
    let coords = ui.fieldmap.toRelativeCoords(ev);
    let x = coords[0]/2;
    let y = coords[1]/2;
    console.log(x);
    NetworkTables.putValue('/Pathfinding/target', x + " " + y);
    NetworkTables.putValue('/Robot/mode', 1);
};

NetworkTables.addKeyListener('/PositionTracking/x', drawFieldMap);
NetworkTables.addKeyListener('/PositionTracking/y', drawFieldMap);
NetworkTables.addKeyListener('/PositionTracking/angle', drawFieldMap);

drawFieldMap();