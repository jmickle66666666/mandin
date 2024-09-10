Engine.setIcon("assets/icon.png");

function loadProject(projectPath) {
    GMF.setProjectPath(projectPath);
        
    if (Settings.getWindowOpen("objectpicker")) setTimeout(() => { ObjectPicker.openWindow(); }, 50 + Math.random() * 200);
    if (Settings.getWindowOpen("roompicker")) setTimeout(() => { RoomPicker.openWindow(); }, 50 + Math.random() * 200);
    if (Settings.getWindowOpen("log")) setTimeout(() => { openLog(); }, 50 + Math.random() * 200);

    let lastRoom = Settings.loadValue("lastLoadedRoom", "");
    if (lastRoom != "") {
        setTimeout(() => {
            RoomPicker.loadRoom(lastRoom);
        }, 260);
    }

    let windowSize = Settings.getWindowSize("window", -1, -1, window.visualViewport.width, window.visualViewport.height);
    if (window.visualViewport.width != windowSize.w || window.visualViewport.height != windowSize.h) {
        Engine.setSize(Math.floor(windowSize.w), Math.floor(windowSize.h));
    }
}

window.onload = () => {
    
    Engine.fileExists("settings.cfg", (exists) => {
        if (!exists) {
            Engine.fileWriteText("settings.cfg", "{}");
        }

        Engine.fileReadText("settings.cfg", (data) => {
            data = JSON.parse(data);
            Settings.loadData(data);
            if (data.projectPath == null) {
                Util.textInput("Hey! type in ur favorite project path here", (value) => {
                    data.projectPath = value;
                    Settings.saveValue("projectPath", value);
                    loadProject(data.projectPath);
                })
            } else {
                loadProject(data.projectPath);
            }
        });
    });

    Engine.setTitle("Mandin");

    window.addEventListener("resize", () => {
        Settings.saveWindowWH(
            "window",
            Math.floor(window.visualViewport.width),
            Math.floor(window.visualViewport.height)
        );
    });

    window.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });
}