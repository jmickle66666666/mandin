Engine.setIcon("assets/icon.png");

window.onload = () => {
    
    Engine.setTitle("GMRoomEdit");
    Engine.fileReadText("settings.cfg", (data) => {
        data = JSON.parse(data);
        Settings.loadData(data);
        GMF.setProjectPath(data.projectPath);
        
        if (Settings.getWindowOpen("objectpicker")) setTimeout(() => { ObjectPicker.openWindow(); }, 50 + Math.random() * 200);
        if (Settings.getWindowOpen("roompicker")) setTimeout(() => { RoomPicker.openWindow(); }, 50 + Math.random() * 200);
        if (Settings.getWindowOpen("log")) setTimeout(() => { openLog(); }, 50 + Math.random() * 200);

        let windowSize = Settings.getWindowSize("window", -1, -1, 800, 600);
        Engine.setSize(Math.floor(windowSize.w), Math.floor(windowSize.h));
    });


    window.addEventListener("resize", () => {
        Settings.saveWindowWH(
            "window",
            Math.floor(window.visualViewport.width),
            Math.floor(window.visualViewport.height)
        );
    });
}