(function () {
    var Engine = {}
    var eventCount = 0;
    
    Engine.getTime = function () {
        return Date.now() / 1000;
    }

    function ipcMessage(object) {
        if (window.ipc != null) window.ipc.postMessage(JSON.stringify(object));
    }

    function nextEventName() {
        eventCount += 1;
        return "listener_"+eventCount;
    }

    Engine.echo = function(message)  {ipcMessage({message:"echo", data:message})};

    Engine.setFullscreen = function(enabled) { ipcMessage({message: "fullscreen", fullscreen: enabled}); }
    Engine.toggleFullscreen = function() { ipcMessage({message: "fullscreen", fullscreen: "toggle"}); }
    Engine.setTitle = function(title) { ipcMessage({message: "title", title: title}); }
    Engine.setIcon = function(iconPath) { ipcMessage({message: "icon", icon: iconPath}); }
    Engine.setSize = function(x, y) { ipcMessage({message: "size", size: {x:x, y:y}}); }
    Engine.setResizable = function(enabled) { ipcMessage({message: "resizable", resizable: enabled}); }
    Engine.quit = function() { ipcMessage({message:"quit"}); }

    Engine.fileWriteText = function(path, data) { ipcMessage({message:"file_write", path:path, data:data}); }
    Engine.fileReadText = function(path, callback) {
        let eventName = nextEventName();
        let listener = function(e) {
            callback(e.detail.replaceAll("\\$", "$"));
            window.removeEventListener(eventName, listener);
        };
        window.addEventListener(eventName, listener);
        
        ipcMessage({message:"file_read", path:path, return:eventName}); 
    }
    Engine.fileReadBytes = function(path, callback) {
        let eventName = nextEventName();
        let listener = function(e) {
            callback(e.detail);
            window.removeEventListener(eventName, listener);
        }
        window.addEventListener(eventName, listener);

        ipcMessage({message:"file_read_bytes", path:path, return:eventName});
    }
    Engine.listFilesInDir = function(path, callback) {
        let listener = function(e) {
            callback(e.detail.split(','));
            window.removeEventListener("pathlist", listener);
        };
        window.addEventListener("pathlist", listener);
        
        ipcMessage({message:"path_list", path:path}); 
    }
    // Engine.fileExists = function(path) { ipcMessage({message:"file_exists", path:path}); }
    // Engine.fileDelete = function(path) { ipcMessage({message:"file_delete", path:path}); }

    window.Engine = Engine;
})();
