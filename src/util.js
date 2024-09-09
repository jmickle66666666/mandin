(function() {
    let Util = {};

    Util.loadImage = function(path, callback) {
        Engine.fileReadBytes(path, (data) => {
            let image = new Image();
            image.src = "data:image/png;base64,"+data;
            image.addEventListener("load", () => {
                callback(image);
            });
        });
    }

    Util.img = function(src) {
        let newImage = document.createElement("img");
        newImage.src = src;
        return newImage;
    }

    Util.abgrToRGBA = function(abgr) {
        let r = ((abgr) % 0x100).toString(16);
        let g = (Math.floor(abgr / 0x100) % 0x100).toString(16);
        let b = (Math.floor(abgr / 0x10000) % 0x100).toString(16);
        let a = (Math.floor(abgr / 0x1000000) % 0x100).toString(16);
        if (r.length == 1) r = "0"+r;
        if (g.length == 1) g = "0"+g;
        if (b.length == 1) b = "0"+b;
        if (a.length == 1) a = "0"+a;
        return "#"+r+g+b+a;
    }

    window.Util = Util;
})();