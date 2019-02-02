ui.fieldmap = document.getElementById("fieldmap");

function loadImage(name) {
    let img = new Image();
    img.src = 'images/' + name;
    return img;
}

var images = {
    map: loadImage('fieldmap.jpg'),
    robot: loadImage('robot.png')
};


var mapCtx = ui.fieldmap.getContext("2d");

function drawImageCentered(img) {
    mapCtx.drawImage(img, -img.width/2, -img.height/2);
}

function drawFieldMap() {
    mapCtx.drawImage(images.map, 0, 0);
    mapCtx.translate(robotX * 2, robotY * 2);
    mapCtx.rotate(robotAngle);
    drawImageCentered(images.robot);
    mapCtx.setTransform(1, 0, 0, 1, 0, 0);
}

var robotX, robotY, robotAngle;
NetworkTables.addKeyListener('/PositionTracking/x', (key, value) => {
    robotX = value;
    drawFieldMap();
});

NetworkTables.addKeyListener('/PositionTracking/y', (key, value) => {
    robotY = value;
    drawFieldMap();
});

NetworkTables.addKeyListener('/PositionTracking/angle', (key, value) => {
    robotAngle = value;
    drawFieldMap();
});
drawFieldMap();