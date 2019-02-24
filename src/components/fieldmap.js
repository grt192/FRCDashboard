ui.fieldmap = document.getElementById("fieldmap");
ui.overrideButton = document.getElementById("override");
ui.scoreButton = document.getElementById("score");

ui.overrideButton.onclick = (ev) => {
    NetworkTables.putValue('/Robot/mode', 0);
}

ui.scoreButton.onclick = (ev) => {
    NetworkTables.putValue('/Robot/mode', 2);
}

function createVisionTarget(id, x, y) {
    return {
        id: id,
        x: x,
        y: y
    };
}

var VISION_RADIUS = 7.5;

var visionTargets = [
    createVisionTarget(0, 0, 29.75),
    createVisionTarget(1, 134.5, 165.25),
    createVisionTarget(2, 148.25, 156)
//     createVisionTarget(0, 0.0, 25.715),
// createVisionTarget(1, 0.0, 296.285),
// createVisionTarget(2, 214.626, 18.116),
// createVisionTarget(3, 229.26, 27.474),
// createVisionTarget(4, 243.894, 18.116),
// createVisionTarget(5, 243.894, 305.884),
// createVisionTarget(6, 229.26, 296.526),
// createVisionTarget(7, 214.626, 305.884),
// createVisionTarget(8, 220.25, 150.125),
// createVisionTarget(9, 220.25, 171.875),
// createVisionTarget(10, 304.385, 188.875),
// createVisionTarget(11, 264.885, 188.875),
// createVisionTarget(12, 282.635, 188.875),
// createVisionTarget(13, 304.385, 133.125),
// createVisionTarget(14, 264.885, 133.125),
// createVisionTarget(15, 282.635, 133.125),
// createVisionTarget(16, 648.0, 25.715),
// createVisionTarget(17, 648.0, 296.285),
// createVisionTarget(18, 433.374, 18.116),
// createVisionTarget(19, 418.74, 27.474),
// createVisionTarget(20, 404.106, 18.116),
// createVisionTarget(21, 404.106, 305.884),
// createVisionTarget(22, 418.74, 296.526),
// createVisionTarget(23, 433.374, 305.884),
// createVisionTarget(24, 427.75, 150.125),
// createVisionTarget(25, 427.75, 171.875),
// createVisionTarget(26, 343.615, 188.875),
// createVisionTarget(27, 383.115, 188.875),
// createVisionTarget(28, 365.365, 188.875),
// createVisionTarget(29, 343.615, 133.125),
// createVisionTarget(30, 383.115, 133.125),
// createVisionTarget(31, 365.365, 133.125)
]

function loadImage(name) {
    let img = new Image();
    img.src = 'images/' + name;
    return img;
}

var images = {
    map: loadImage('betafield2.png'),
    robot: loadImage('omegarobot.png')
};


var mapCtx = ui.fieldmap.getContext("2d");

function drawImageCentered(img) {
    mapCtx.drawImage(img, -img.width/2, -img.height/2);
}

function drawCircle(x, y, radius) {
    mapCtx.beginPath();
    mapCtx.arc(x, y, radius, 0, 2 * Math.PI);
    mapCtx.stroke();
}

function drawFieldMap() {
    mapCtx.drawImage(images.map, 0, 0);
    let x = NetworkTables.getValue('/PositionTracking/x', 0) * 2;
    let y = NetworkTables.getValue('/PositionTracking/y', 0) * 2;
    let angle = NetworkTables.getValue('/PositionTracking/angle', 0);

    let selectedTarget = NetworkTables.getValue('/Pathfinding/visionTarget', -1);
    console.log(selectedTarget);
    for (let i = 0; i < visionTargets.length; ++i) {
        let vt = visionTargets[i];
        if (vt.id == selectedTarget)
            mapCtx.strokeStyle = "#FF0000";
        else
            mapCtx.strokeStyle = "#0000FF";
        drawCircle(vt.x * 2, vt.y * 2, VISION_RADIUS * 2);
    }

    let mode = NetworkTables.getValue('/Robot/mode', 0);
    if (mode != 0) {
        let path = NetworkTables.getValue('/Pathfinding/path', []);
        mapCtx.strokeStyle = "#000000";
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
    let id = -1;
    let r2 = VISION_RADIUS * VISION_RADIUS;
    for (let i = 0; i < visionTargets.length; ++i) {
        let vt = visionTargets[i];
        let dx = x - vt.x;
        let dy = y - vt.y;
        if (dx * dx + dy * dy < r2) {
            id = vt.id;
            break;
        }
    }
    if (id == -1) {
        NetworkTables.putValue('/Pathfinding/target', x + " " + y);
        NetworkTables.putValue('/Robot/mode', 1);
    } else {
        NetworkTables.putValue('/Pathfinding/visionTarget', id);
    }
    drawFieldMap();
};

NetworkTables.addKeyListener('/PositionTracking/x', drawFieldMap);
NetworkTables.addKeyListener('/PositionTracking/y', drawFieldMap);
NetworkTables.addKeyListener('/PositionTracking/angle', drawFieldMap);

drawFieldMap();