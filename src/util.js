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

    Util.textInput = function(title, callback) {
        let listener = () => {
            document.querySelector("#btn_textinput").removeEventListener("click", listener);
            dialog.close();
            callback(document.querySelector("#textinputfield").value);
        }
        document.querySelector("#btn_textinput").addEventListener("click", listener);
        let dialog = new WinBox(title, {
            modal: true,
            mount: document.querySelector("div.wb#textinput"),
            height: 67,
        }).removeControl("wb-close");
    }
    
    Util.random = function(index) {
        return [202,14,88,194,70,79,134,239,131,110,109,153,41,199,0,140,130,228,40,23,210,104,247,68,5,59,167,82,61,158,24,242,105,39,155,224,174,129,76,208,19,204,237,180,151,51,98,145,4,6,211,190,181,126,245,58,195,108,223,225,87,60,249,21,16,250,90,152,102,66,226,92,183,135,123,42,207,222,164,229,252,189,200,22,46,57,139,215,33,142,99,9,157,235,176,197,160,103,227,253,84,111,50,53,165,10,156,143,27,213,13,107,83,55,115,119,187,80,161,35,56,49,86,169,43,29,31,32,125,89,48,106,96,47,72,64,3,120,7,240,234,220,221,25,85,127,170,255,178,100,168,182,75,2,122,232,69,114,179,118,209,148,163,52,212,254,112,166,17,171,198,196,26,34,45,241,150,175,251,116,244,138,44,20,191,133,177,141,154,136,11,173,121,18,231,77,201,93,246,219,186,91,137,97,117,8,54,205,214,248,147,238,62,65,185,101,63,243,144,124,30,230,184,67,81,149,36,15,188,206,236,73,71,217,193,78,128,28,132,203,94,37,159,1,218,146,95,192,12,162,74,233,216,38,172,113][Math.abs(Math.round(index)) % 256];
    }

    window.Util = Util;
})();