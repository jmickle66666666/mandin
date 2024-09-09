(function() {
    let GMF = {};

    function yypParse(text)
    {
        // gml json is broken
        text = text.replaceAll(/,\s*}/g, "}");
        text = text.replaceAll(/,\s*\]/g, "]");
        return JSON.parse(text);
    }
    GMF.yypParse = yypParse;

    function setProjectPath(_projectPath)
    {
        log("setting project path: "+_projectPath);
        GMF.projectPath = _projectPath;

        let lastSlash = GMF.projectPath.lastIndexOf("/");
        let lastBackslash = GMF.projectPath.lastIndexOf("\\");

        GMF.projectDirectory = GMF.projectPath.substring(0, Math.max(lastSlash, lastBackslash)+1);
        log("project directory: "+GMF.projectDirectory);

        Engine.fileReadText(GMF.projectPath, (data) => {
            log("Loaded project data");
            GMF.projectData = yypParse(data);
            console.log(GMF.projectData);
        });
    }
    GMF.setProjectPath = setProjectPath;

    function listRooms(callback) {
        Engine.listFilesInDir(GMF.projectDirectory+"rooms/", (list) => {
            let names = [];
            let sl = (GMF.projectDirectory+"rooms/").length;
            for (let opath of list) {
                names.push(opath.substring(sl));
            }
            callback(names);
        });
    }
    GMF.listRooms = listRooms;

    function listObjects(callback) {
        Engine.listFilesInDir(GMF.projectDirectory+"objects/", (list) => {
            let names = [];
            let sl = (GMF.projectDirectory+"objects/").length;
            for (let opath of list) {
                names.push(opath.substring(sl));
            }
            callback(names);
        });
    }
    GMF.listObjects = listObjects;

    function getResourcePath(asset) {
        for (let id of GMF.projectData.resources) {
            if (id.id.name == asset) return GMF.projectDirectory + id.id.path;
        }
    }
    GMF.getResourcePath = getResourcePath;

    function getAssetData(asset, callback) {
        path = getResourcePath(asset);
        if (path == null) {log("fucxked up! truna get "+asset); return;}
        Engine.fileReadText(path, (data) => {
            callback(yypParse(data));
        });
    }
    GMF.getAssetData = getAssetData;

    function getObjectSprite(object, callback) {
        getAssetData(object, (data) => {
            if (data.spriteId == null) return;
            let spriteDataPath = GMF.projectDirectory + data.spriteId.path;
            let spriteDirectoryPath = spriteDataPath.substring(0, spriteDataPath.lastIndexOf("/")+1);
            
            Engine.fileReadText(GMF.projectDirectory + data.spriteId.path, (data) => {
                data = yypParse(data);
                callback({data:data, img_path: spriteDirectoryPath + data.frames[0].name + ".png"});
            });
        });
    }
    GMF.getObjectSprite = getObjectSprite;

    function getRoomData(room, callback) {
        console.log(getRoomDataPath(room));
        Engine.fileReadText(getRoomDataPath(room), (data) => {
            callback(yypParse(data));
        });
    }
    GMF.getRoomData = getRoomData;

    function getRoomDataPath(room) {
        return GMF.projectDirectory + "rooms/" + room + "/" + room + ".yy";
    }
    GMF.getRoomDataPath = getRoomDataPath;

    // function getTilesetSourceImage(tileset, callback) {
    //     getAssetData(tileset, (data) => {

    //     });
    // }

    window.GMF = GMF;
    
})();