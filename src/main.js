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

    Engine.setMaximized(Settings.loadValue("maximized", false));

    Engine.setTitle("Mandin");
}

function projectSetup() {
    Util.textInput("Hey! type in ur favorite project path here", Settings.loadValue("projectPath", ""), (value) => {
        Settings.saveValue("projectPath", value);
        location.reload();
    });
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
                projectSetup();         
            } else {
                loadProject(data.projectPath);
            }
        });

        addEventListener("keydown", (e) => {
            if (e.key == "z" && e.ctrlKey) {
                Undo.undo();
                e.preventDefault();
            }
        })

        document.querySelector("#btn_project_setup").addEventListener("click", projectSetup);
    });

    window.addEventListener("resize", () => {
        Settings.saveWindowWH(
            "window",
            Math.floor(window.visualViewport.width),
            Math.floor(window.visualViewport.height)
        );

        Engine.isMaximized((isMaximized) => {
            Settings.saveValue("maximized", isMaximized);
        });
    });

    window.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });
}