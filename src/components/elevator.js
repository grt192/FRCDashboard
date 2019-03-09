ui.elevatorButtons = [
    document.getElementById("button0"),
    document.getElementById("button1"),
    document.getElementById("button2"),
    document.getElementById("button3"),
    document.getElementById("button4")
]

ui.elevatorSetButtons = [
    document.getElementById("set1"),
    document.getElementById("set2"),
    document.getElementById("set3"),
    document.getElementById("set4")
]

ui.elevatorButtons.forEach(element => {
    element.onmouseover = ev => {
        if (NetworkTables.getValue('/Robot/Elevator/target', -2) != element.getAttribute("value"))
            element.style.background = "#900000";
    };
    element.onmouseout = ev => {
        if (NetworkTables.getValue('/Robot/Elevator/target', -2) != element.getAttribute("value"))
            element.style.background = "#505050";
    };
    element.onclick = ev => {
        NetworkTables.putValue('/Robot/Elevator/target', element.getAttribute("value"));
    };
});

NetworkTables.addKeyListener('/Robot/Elevator/target', (key, value) => {
    if (value < -1)
        return;
    ui.elevatorButtons.forEach(element => {
        if (NetworkTables.getValue('/Robot/Elevator/target', -2) == element.getAttribute("value"))
            element.style.background = "#FF0000"; 
        else
        element.style.background = "#505050";
    });
});

ui.elevatorSetButtons.forEach(element => {
    element.onclick = ev => {
        NetworkTables.putValue('/Robot/Elevator/set', element.getAttribute("value"));
    };
});