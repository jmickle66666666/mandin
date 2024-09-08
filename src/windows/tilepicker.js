(function() {
    let TilePicker = {};

    TilePicker.currentTile = -1;

    let open = false;
    function openWindow() {
        if (open) return;
        open = true;
        winbox = new WinBox("Tile Picker", {
            mount: document.querySelector("div.wb#tilePicker"),
            onclose: () => {
                open = false;
            },
            x:"20%",
            y:"center",
            width:"10%",
            height:"40%",
            bottom:"2px"
        });
    }
    TilePicker.openWindow = openWindow;

    function clear() {
        document.querySelector("div.wb#tilePicker").innerHTML = "";
    }
    TilePicker.clear = clear;

    let highlight = null;
    function loadTileset(tileset) {
        openWindow();
        GMF.getObjectSprite(tileset, (img_path) => {
            Util.loadImage(img_path, (img) => {
                document.querySelector("div.wb#tilePicker").appendChild(img);

                
                GMF.getAssetData(tileset, (tileset_data) => {
                    GMF.getAssetData(tileset_data.spriteId.name, (sprite_data) => {
                        let sw = tileset_data.tileWidth / sprite_data.width;
                        highlight = document.createElement("canvas");
                        let hctx = highlight.getContext('2d');
                        let tiles_per_row = Math.floor(sprite_data.width / tileset_data.tileWidth);
                        let tiles_per_column = Math.floor(sprite_data.height / tileset_data.tileHeight);
                        highlight.width = tiles_per_row;
                        highlight.height = tiles_per_column;
                        hctx.fillStyle = "#ffffff44";
                        hctx.clearRect(0, 0, tiles_per_row, tiles_per_column);
                        hctx.fillRect(0, 0, 1, 1);
                        document.querySelector("div.wb#tilePicker").appendChild(highlight);
                        
                        img.addEventListener("click", (e) => {
                            let x = e.offsetX / img.width;
                            let y = e.offsetY / img.width;

                            let tileIndex = Math.floor(x * tiles_per_row) + Math.floor(y * tiles_per_row) * tiles_per_row;
                            let tx = tileIndex % tiles_per_row;
                            let ty = Math.floor(tileIndex / tiles_per_row);

                            TilePicker.currentTile = tileIndex;
                            
                            hctx.clearRect(0, 0, tiles_per_row, tiles_per_column);
                            hctx.fillRect(tx, ty, 1, 1);
                        });
                    });
                });
            })
        });

    }
    TilePicker.loadTileset = loadTileset;

    window.TilePicker = TilePicker;
})();