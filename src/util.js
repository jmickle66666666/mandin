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

    window.Util = Util;
})();