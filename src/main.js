Engine.setIcon("assets/icon.png");

window.onload = () => {
    
    
    Engine.fileReadText("settings.cfg", (data) => {
        data = JSON.parse(data);
        Settings.loadData(data);
        GMF.setProjectPath(data.projectPath);
        
        if (Settings.getWindowOpen("objectpicker")) setTimeout(() => { ObjectPicker.openWindow(); }, 50 + Math.random() * 200);
        if (Settings.getWindowOpen("roompicker")) setTimeout(() => { RoomPicker.openWindow(); }, 50 + Math.random() * 200);
        if (Settings.getWindowOpen("log")) setTimeout(() => { openLog(); }, 50 + Math.random() * 200);

        let lastRoom = Settings.loadValue("lastLoadedRoom", "");
        if (lastRoom != "") {
            setTimeout(() => {
                RoomPicker.loadRoom(lastRoom);
            }, 260);
        }

        let windowSize = Settings.getWindowSize("window", -1, -1, 800, 600);
        if (window.visualViewport.width != windowSize.w || window.visualViewport.height != windowSize.h) {
            Engine.setSize(Math.floor(windowSize.w), Math.floor(windowSize.h));
        }
        Engine.setTitle("Mandin");
    });


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