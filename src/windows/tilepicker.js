(function() {
    let TilePicker = {};

    TilePicker.currentTiles = [];
    TilePicker.getCurrentTile = function () {
        if (TilePicker.currentTiles.length == 0) return -1;
        return TilePicker.currentTiles[Math.floor(Math.random() * TilePicker.currentTiles.length)];
    }
    let pickDrag = false;
    let pickDragStart = null;

    let open = false;
    function openWindow() {
        if (open) return;
        open = true;

        let size = Settings.getWindowSize("tilePicker", 60, 60, 100, 300);
        winbox = new WinBox("Tile Picker", {
            mount: document.querySelector("div.wb#tilePicker"),
            onclose: () => {
                open = false;
            },
            x:size.x,
            y:size.y,
            width:size.w,
            height:size.h,
            bottom:"2px",
            onresize: (w, h) => {
                Settings.saveWindowWH("tilePicker", w, h)
            },
            onmove: (x, y) => {
                Settings.saveWindowXY("tilePicker", x, y)
            }
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
        GMF.getObjectSprite(tileset, (sprite_data) => {
            Util.loadImage(sprite_data.img_path, (img) => {
                document.querySelector("div.wb#tilePicker").appendChild(img);

                GMF.getAssetData(tileset, (tileset_data) => {
                    GMF.getAssetData(tileset_data.spriteId.name, (sprite_data) => {
                        let sw = tileset_data.tileWidth / sprite_data.width;
                        highlight = document.createElement("canvas");
                        highlight.style.opacity = 0.4;
                        let hctx = highlight.getContext('2d');
                        let tiles_per_row = Math.floor(sprite_data.width / tileset_data.tileWidth);
                        let tiles_per_column = Math.floor(sprite_data.height / tileset_data.tileHeight);
                        highlight.width = tiles_per_row;
                        highlight.height = tiles_per_column;
                        hctx.fillStyle = "#ffffffff";
                        hctx.clearRect(0, 0, tiles_per_row, tiles_per_column);
                        hctx.fillRect(0, 0, 1, 1);
                        document.querySelector("div.wb#tilePicker").appendChild(highlight);
                        
                        img.addEventListener("click", (e) => {
                            let x = e.offsetX / img.width;
                            let y = e.offsetY / img.width;

                            let tileIndex = Math.floor(x * tiles_per_row) + Math.floor(y * tiles_per_row) * tiles_per_row;
                            let tx = tileIndex % tiles_per_row;
                            let ty = Math.floor(tileIndex / tiles_per_row);
                        });

                        img.addEventListener("mousedown", (e) => {
                            let x = e.offsetX / img.width;
                            let y = e.offsetY / img.width;

                            let tileIndex = Math.floor(x * tiles_per_row) + Math.floor(y * tiles_per_row) * tiles_per_row;
                            let tx = tileIndex % tiles_per_row;
                            let ty = Math.floor(tileIndex / tiles_per_row);
                            
                            pickDrag = true;
                            pickDragStart = {x:tx, y:ty};

                            if (e.shiftKey) {
                                if (TilePicker.currentTiles.indexOf(tileIndex) == -1) {
                                    TilePicker.currentTiles.push(tileIndex);
                                    hctx.fillRect(tx, ty, 1, 1);
                                } else {
                                    TilePicker.currentTiles.splice(TilePicker.currentTiles.indexOf(tileIndex), 1);
                                    hctx.clearRect(tx, ty, 1, 1);
                                }
                            } else {
                                TilePicker.currentTiles = [tileIndex];
                                hctx.clearRect(0, 0, tiles_per_row, tiles_per_column);
                                hctx.fillRect(tx, ty, 1, 1);
                            }
                        });

                        window.addEventListener("mouseup", (e) => {
                            pickDrag = false;
                        });

                        img.addEventListener("mousemove", (e) => {
                            if (pickDrag) {

                                if (!e.shiftKey) { 
                                    TilePicker.currentTiles = []; 
                                    hctx.clearRect(0, 0, tiles_per_row, tiles_per_column);
                                }

                                let x = e.offsetX / img.width;
                                let y = e.offsetY / img.width;

                                let tileIndex = Math.floor(x * tiles_per_row) + Math.floor(y * tiles_per_row) * tiles_per_row;
                                let tx = tileIndex % tiles_per_row;
                                let ty = Math.floor(tileIndex / tiles_per_row);

                                

                                let tx1 = Math.min(pickDragStart.x, tx);
                                let ty1 = Math.min(pickDragStart.y, ty);
                                let tx2 = Math.max(pickDragStart.x, tx);
                                let ty2 = Math.max(pickDragStart.y, ty);

                                for (let i = tx1; i <= tx2; i++) {
                                    for (let j = ty1; j <= ty2; j++) {
                                        let index = i + j * tiles_per_row;
                                        if (TilePicker.currentTiles.indexOf(index) == -1) {
                                            TilePicker.currentTiles.push(index);
                                        }
                                    }
                                }
                                
                                hctx.fillRect(tx1, ty1, tx2-tx1+1, ty2-ty1+1);
                            }
                        });
                    });
                });
            })
        });

    }
    TilePicker.loadTileset = loadTileset;

    window.TilePicker = TilePicker;
})();