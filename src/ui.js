// Define UI elements
let ui = {
    robotState: document.getElementById('robot-state').firstChild,
    currentMode: document.getElementById('current-mode')
};

// Key Listeners
NetworkTables.addKeyListener('/Robot/mode', (key, value) => {
    ui.currentMode.innerHTML = "Current Mode: " + value;
});


addEventListener('error',(ev)=>{
    ipc.send('windowError',{mesg:ev.message,file:ev.filename,lineNumber:ev.lineno})
})