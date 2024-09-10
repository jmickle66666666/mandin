(function() {
    let open = false;
    let winbox = null;
    let cachedRooms = null;

    function openWindow() {
        if (open) return;
        open = true;
        Settings.saveWindowOpen("log", true);
        let size = Settings.getWindowSize("log", 30, 30, 400, 200);
        winbox = new WinBox("Log", {
            mount: document.querySelector("div.wb#log"),
            onclose: () => {
                open = false;
                Settings.saveWindowOpen("log", false);
            },
            x:size.x,
            y:size.y,
            width:size.w,
            height:size.h,
            bottom:"2px",
            onresize: (w, h) => {
                Settings.saveWindowWH("log", w, h)
            },
            onmove: (x, y) => {
                Settings.saveWindowXY("log", x, y)
            }
        });
        
    }

    document.querySelector("#btn_log").addEventListener("click", openWindow);

    window.log = function(message) {
        console.log(message);

        let newlog = document.createElement("div");
        let timestamp = document.createElement("div");
        timestamp.className = "logtimestamp";
        timestamp.innerText = `[${new Date().toLocaleTimeString("en-GB")}]`
        newlog.appendChild(timestamp);
        switch (typeof message) {
            case "object":
                if (message.nodeName != null) {
                    if (message.nodeName == "IMG" || message.nodeName == "CANVAS") {
                        newlog.appendChild(message);
                        break;
                    }
                }
            case "string":
            default:
                let text = document.createElement("div");
                text.innerText = message.toString();
                newlog.appendChild(text);
            break;
        }
            
        newlog.className = "logmessage";
        document.querySelector("div.wb#log").appendChild(newlog);

    }

    window.openLog = openWindow;
})();