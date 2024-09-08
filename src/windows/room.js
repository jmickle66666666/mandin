(function() {
    let Room = {};
    let open = false;
    let roomData = null;
    let roomPath = null;
    let tilesetData = null;

    let roomLayers = [];

    function drawTile(src, dest, index, x, y, tileWidth, tileHeight)
    {
        // the transforms aren't working

        // let mirrored = index & (1 << 28) != 0;
        // let flipped = index & (1 << 29) != 0;
        // let rotated = index & (1 << 30) != 0;
        index &= 262143;
        let ix = index % (src.width/tileWidth);
        let iy = Math.floor(index / (src.width/tileWidth));
        let sx = ix * tileWidth;
        dest.drawImage(src, sx, iy * tileHeight, tileWidth, tileHeight, x * tileWidth, y * tileHeight, tileWidth, tileHeight);
    }

    function drawLayer(ctx, layer) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        if (layer["$GMRTileLayer"] != null) {
            let newTileArray = [layer.tiles.SerialiseWidth * layer.tiles.SerialiseHeight,];
            GMF.getAssetData(layer.tilesetId.name, (tileset_data) => {
                tilesetData = tileset_data;
                GMF.getObjectSprite(layer.tilesetId.name, (img_path) => {
                    Util.loadImage(img_path, (tileset_image) => {
                        ctx.canvas.tileset_image = tileset_image;
                        let tiles = layer.tiles["TileCompressedData"];

                        let pos = 0;
                        let x = 0;
                        let y = 0;
                        while (pos < tiles.length) {
                            if (tiles[pos] < 0) {
                                let rep = tiles[pos] * -1;
                                pos += 1;
                                for (let n = 0; n < rep; n++) {
                                    drawTile(tileset_image, ctx, tiles[pos], x, y, tileset_data.tileWidth, tileset_data.tileHeight);
                                    newTileArray.push(tiles[pos]);
                                    x += 1;
                                    if (x >= layer.tiles.SerialiseWidth) {
                                        x = 0;
                                        y += 1;
                                    }
                                }
                                pos += 1;
                            } else {
                                let rep = tiles[pos];
                                pos += 1;
                                for (let n = 0; n < rep; n++) {
                                    drawTile(tileset_image, ctx, tiles[pos], x, y, tileset_data.tileWidth, tileset_data.tileHeight);
                                    newTileArray.push(tiles[pos]);
                                    pos += 1;
                                    x += 1;
                                    if (x >= layer.tiles.SerialiseWidth) {
                                        x = 0;
                                        y += 1;
                                    }
                                }
                            }
                        }
                        layer.tiles["TileCompressedData"] = newTileArray;
                    })
                });
            });
        }

        if (layer["$GMRInstanceLayer"] != null) {
            let instances = layer.instances;
            for (let inst of instances) {
                GMF.getObjectSprite(inst.objectId.name, (imgpath) => {
                    Util.loadImage(imgpath, (img) => {
                        ctx.drawImage(img, inst.x, inst.y);
                    })
                });
            }
        }
    }

    function updateTileLayer(ctx, layer) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        let tileset_data = tilesetData;
        let tileset_image = ctx.canvas.tileset_image;
        let tiles = layer.tiles["TileCompressedData"];

        let pos = 0;
        let x = 0;
        let y = 0;
        while (pos < tiles.length) {
            if (tiles[pos] < 0) {
                let rep = tiles[pos] * -1;
                pos += 1;
                for (let n = 0; n < rep; n++) {
                    drawTile(tileset_image, ctx, tiles[pos], x, y, tileset_data.tileWidth, tileset_data.tileHeight);
                    x += 1;
                    if (x >= layer.tiles.SerialiseWidth) {
                        x = 0;
                        y += 1;
                    }
                }
                pos += 1;
            } else {
                let rep = tiles[pos];
                pos += 1;
                for (let n = 0; n < rep; n++) {
                    drawTile(tileset_image, ctx, tiles[pos], x, y, tileset_data.tileWidth, tileset_data.tileHeight);
                    pos += 1;
                    x += 1;
                    if (x >= layer.tiles.SerialiseWidth) {
                        x = 0;
                        y += 1;
                    }
                }
            }
        }
    }

    function renderRoom(_roomData) {
        roomData = _roomData;
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        
        // let layers = JSON.parse(JSON.stringify(roomData.layers));
        let layers = roomData.layers;
        
        // console.log(layers);
        // layers.sort((a, b) => {return b.depth - a.depth;});
        // console.log(layers);
        
        canvas.width = roomData.roomSettings.Width;
        canvas.height = roomData.roomSettings.Height;

        document.querySelector("div.wb#roomViewer").innerHTML = "";
        roomLayers = [];
        for (let i = 0; i < layers.length; i++)
        {
            let cnv = document.createElement("canvas");
            cnv.width = canvas.width;
            cnv.height = canvas.height;
            let _ctx = cnv.getContext("2d");
            drawLayer(_ctx, layers[i]);
            cnv.style.position = "absolute";
            cnv.style.width = (canvas.width).toString()+"px";
            cnv.layer = layers[i];
            roomLayers.push(cnv);
        }
        
        roomLayers.sort((a, b) => b.layer.depth - a.layer.depth);
        
        for (let i = 0; i < roomLayers.length; i++)
        {
            document.querySelector("div.wb#roomViewer").appendChild(roomLayers[i]);
        }

        openWindow(canvas.width, canvas.height);
    }
    Room.renderRoom = renderRoom;

    function updateVisibility() {
        for (let i = 0; i < roomLayers.length; i++) {
            roomLayers[i].style.visibility = roomLayers[i].layer.visible?"visible":"hidden";
        }
    }
    Room.updateVisibility = updateVisibility;

    function openWindow(w, h) {
        if (open) return;
        open = true;
        winbox = new WinBox("Room Viewer", {
            mount: document.querySelector("div.wb#roomViewer"),
            onclose: () => {
                open = false;
            },
            x:"center",
            y:"center",
            width:Math.min(800, w + 64),
            height:Math.min(600, h + 64),
            bottom:"2px"
        });
    }

    let dragging = false;
    let dx = 0;
    let dy = 0;
    let mx = 0;
    let my = 0;
    let holding = false;
    document.querySelector("div.wb#roomViewer").addEventListener("mousedown", (e) => {
        if (e.button == 1) {
            dragging = true;
        }

        if (e.button == 0) {
            holding = true;

            log(`${Math.floor((mx / 8)/zoom)}, ${Math.floor((my / 8)/zoom)}`);

            if (Layers.currentLayer != null && Layers.currentLayer["$GMRTileLayer"] != null) {
                paintTile();
            }
        }
    });

    function paintTile() {
        let x = Math.floor((mx / 8)/zoom);
        let y = Math.floor((my / 8)/zoom);
        let index = x + y * Layers.currentLayer.tiles.SerialiseWidth;
        index += 1;
        let newTile = TilePicker.getCurrentTile();
        if (newTile != -1) {
            Layers.currentLayer.tiles["TileCompressedData"][index] = newTile;
            
            for (let i = 0; i < roomLayers.length; i++) {
                if (roomLayers[i].layer == Layers.currentLayer) {
                    drawTile(roomLayers[i].tileset_image, roomLayers[i].getContext("2d"), newTile, x, y, tilesetData.tileWidth, tilesetData.tileHeight);
                    break;
                }
            }
        }
    }

    window.addEventListener("keydown", (e) => {
        if(e.ctrlKey && e.key == "s") {
            log("Saving room!");
            let path = GMF.getRoomDataPath(roomData["%Name"]);
            Engine.fileWriteText(path, JSON.stringify(roomData));
        }
    })

    window.addEventListener("mouseup", (e) => {
        if (e.button == 1) {
            dragging = false;
        }

        if (e.button == 0) {
            holding = false;
        }
    });

    function moveView(x, y) {
        dx += x/zoom;
        dy += y/zoom;
        for (let i = 0; i < roomLayers.length; i++) {
            roomLayers[i].style.left = `${dx}px`;
            roomLayers[i].style.top = `${dy}px`;
        }
    }

    function moveViewTo(x, y) {
        dx = x/zoom;
        dy = y/zoom;
        for (let i = 0; i < roomLayers.length; i++) {
            roomLayers[i].style.left = `${dx}px`;
            roomLayers[i].style.top = `${dy}px`;
        }
    }

    window.addEventListener("mousemove", (e) => {
        if (dragging) {
            moveView(e.movementX, e.movementY);
        }

        if (holding) {
            if (Layers.currentLayer != null && Layers.currentLayer["$GMRTileLayer"] != null) {
                paintTile();
            }
        }

        mx = e.offsetX;
        my = e.offsetY;
    });

    let zoom = 1.0;
    document.querySelector("div.wb#roomViewer").addEventListener("wheel", (e) => {
        // moveView((-mx/2) * zoom, (-my/2) * zoom);

        // let w = document.querySelector("div.wb#roomViewer").getBoundingClientRect().width;
        // let h = document.querySelector("div.wb#roomViewer").getBoundingClientRect().height;

        // let oldx = (e.offsetX - dx) / w;
        // let oldy = (e.offsetY - dy) / h;

        let oldZoom = zoom;
        if (e.deltaY < 0) zoom *= 1.1;
        if (e.deltaY > 0) zoom /= 1.1;

        // dx = e.offsetX - w * zoom * oldx;
        // dy = e.offsetY - h * zoom * oldy;
        // moveViewTo(dx, dy);

        // log(`${e.offsetX}, ${e.offsetY}`);
        // log(`${e.offsetX/oldZoom}, ${e.offsetY/oldZoom}`);
        // log(`${e.offsetX/zoom}, ${e.offsetY/zoom}`);

        let dx = (e.offsetX/oldZoom) - (e.offsetX/zoom);
        let dy = (e.offsetY/oldZoom) - (e.offsetY/zoom);
        moveView(-dx, -dy);

        // let nx = e.offsetX/zoom - (e.offsetX/zoom - dx) * (zoom/oldZoom);
        // let ny = e.offsetY/zoom - (e.offsetY/zoom - dy) * (zoom/oldZoom);
        // moveViewTo(nx, ny);
        

        // let zoomDiff = zoom - oldZoom;
        // moveView(-mx * zoomDiff, -my * zoomDiff);
        // moveView(-dx / zoom, -dy / zoom);
        document.querySelector("div.wb#roomViewer").style.zoom = `${zoom*100}%`;
    });

    window.Room = Room;
})();