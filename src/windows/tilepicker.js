(function() {
    let TilePicker = {};

    TilePicker.previewCanvas = document.createElement("canvas");
    TilePicker.previewCanvasCtx = TilePicker.previewCanvas.getContext("2d");
    TilePicker.brushSize = 1;
    let tileWidth = 0;
    let tileHeight = 0;
    let tilesetImage = null;

    TilePicker.currentTiles = [];
    TilePicker.getCurrentTile = function (seed=-1) {
        if (TilePicker.currentTiles.length == 0) return -1;
        if (seed == -1) {
            return TilePicker.currentTiles[Math.floor(Math.random() * TilePicker.currentTiles.length)];
        } else {
            return TilePicker.currentTiles[Util.random(seed) % TilePicker.currentTiles.length];
        }
    }
    let pickDrag = false;
    let pickDragStart = null;

    function openWindow() {
        AssetWindow.attach(document.querySelector("div.wb#tilePicker"));
        return;
    }
    TilePicker.openWindow = openWindow;

    function clear() {
        TilePicker.currentTiles = [];
        document.querySelector("div.wb#tilePicker").innerHTML = "";
    }
    TilePicker.clear = clear;

    let highlight = null;
    function loadTileset(tileset) {
        openWindow();
        GMF.getObjectSprite(tileset, (sprite_data) => {
            Util.loadImage(sprite_data.img_path, (img) => {
                tilesetImage = img;
                document.querySelector("div.wb#tilePicker").appendChild(img);

                GMF.getAssetData(tileset, (tileset_data) => {
                    GMF.getAssetData(tileset_data.spriteId.name, (sprite_data) => {
                        let sw = tileset_data.tileWidth / sprite_data.width;
                        tileWidth = tileset_data.tileWidth;
                        tileHeight = tileset_data.tileHeight;
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