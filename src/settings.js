(function() {

    let Settings = {};

    let settings;

    function loadData(json) {
        settings = json;
    }
    Settings.loadData = loadData;

    function saveData() {
        Engine.fileWriteText("settings.cfg", JSON.stringify(settings));
    }
    Settings.saveData = saveData;

    function saveValue(key, value)
    {
        settings[key] = value;
        Engine.fileWriteText("settings.cfg", JSON.stringify(settings));
    }
    Settings.saveValue = saveValue;

    function loadValue(key, _default)
    {
        if (settings[key] != null) return settings[key];
        return _default;
    }
    Settings.loadValue = loadValue;

    Settings.getWindowSize = function(name, x, y, w, h) {
        if (settings.windows == null) { return {x:x, y:y, w:w, h:h}; }
        if (settings.windows[name] == null) { return {x:x, y:y, w:w, h:h}; }
        if (settings.windows[name].x != null) { x = settings.windows[name].x };
        if (settings.windows[name].y != null) { y = settings.windows[name].y };
        if (settings.windows[name].w != null) { w = settings.windows[name].w };
        if (settings.windows[name].h != null) { h = settings.windows[name].h };
        return {x:x, y:y, w:w, h:h};
    }

    Settings.getWindowOpen = function(name) {
        if (settings.windows == null) { return false; }
        if (settings.windows[name] == null) { return false; }
        if (settings.windows[name].open != null) return settings.windows[name].open;
        return false;
    }

    Settings.saveWindowWH = function(name, w, h) {
        if (settings.windows == null) { settings.windows = {}; }
        if (settings.windows[name] == null) {
            settings.windows[name] = {};
        }
        settings.windows[name].w = w;
        settings.windows[name].h = h;
        Engine.fileWriteText("settings.cfg", JSON.stringify(settings));
    }

    Settings.saveWindowXY = function(name, x, y) {
        if (settings.windows == null) { settings.windows = {}; }
        if (settings.windows[name] == null) {
            settings.windows[name] = {};
        }
        settings.windows[name].x = x;
        settings.windows[name].y = y;
        Engine.fileWriteText("settings.cfg", JSON.stringify(settings));
    }

    Settings.saveWindowXYWH = function(name, x, y, w, h) {
        if (settings.windows == null) { settings.windows = {}; }
        if (settings.windows[name] == null) {
            settings.windows[name] = {};
        }
        settings.windows[name].x = x;
        settings.windows[name].y = y;
        settings.windows[name].w = w;
        settings.windows[name].h = h;
        Engine.fileWriteText("settings.cfg", JSON.stringify(settings));
    }

    Settings.saveWindowOpen = function(name, open) {
        if (settings.windows == null) { settings.windows = {}; }
        if (settings.windows[name] == null) {
            settings.windows[name] = {};
        }
        settings.windows[name].open = open;
        Engine.fileWriteText("settings.cfg", JSON.stringify(settings));
    }

    window.Settings = Settings;
})();