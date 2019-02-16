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
]

function loadImage(name) {
    let img = new Image();
    img.src = 'images/' + name;
    return img;
}

var images = {
    map: loadImage('betafield2.png'),
    robot: loadImage('betarobot.png')
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