(function() {
    let Room = {};
    let open = false;
    let roomData = null;
    let roomPath = null;
    let tilesetData = null;
    let tilesetImage = null;
    let brushSize = 1;

    let outputCanvas = null;
    let outctx = null;

    let rv = document.querySelector("div.wb#roomViewer");

    let roomLayers = [];
    let instances = [];
    let winbox = null;

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
                GMF.getObjectSprite(layer.tilesetId.name, (sprite_data) => {
                    Util.loadImage(sprite_data.img_path, (tileset_image) => {
                        ctx.canvas.tileset_image = tileset_image;
                        tilesetImage = tileset_image;
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
                GMF.getObjectSprite(inst.objectId.name, (sprite_data) => {
                    Util.loadImage(sprite_data.img_path, (img) => {
                        ctx.drawImage(img, inst.x - sprite_data.data.sequence.xorigin, inst.y - sprite_data.data.sequence.yorigin);
                    })
                });
            }
        }

        if (layer["$GMRBackgroundLayer"] != null) {
            ctx.fillStyle = Util.abgrToRGBA(layer.colour);
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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

    function loadRoom(_roomData) {
        TilePicker.clear();
        dx = 0;
        dy = 0;
        roomData = _roomData;
        let layers = roomData.layers;
        
        let width = roomData.roomSettings.Width;
        let height = roomData.roomSettings.Height;

        rv.innerHTML = "";
        roomLayers = [];
        for (let i = 0; i < layers.length; i++)
        {
            let cnv = document.createElement("canvas");
            cnv.width = width;
            cnv.height = height;
            let _ctx = cnv.getContext("2d");
            _ctx.imageSmoothingEnabled = false;
            drawLayer(_ctx, layers[i]);
            cnv.style.position = "absolute";
            cnv.style.width = (width).toString()+"px";
            cnv.layer = layers[i];
            roomLayers.push(cnv);
        }
        
        roomLayers.sort((a, b) => b.layer.depth - a.layer.depth);
        
        if (outputCanvas == null) {
            outputCanvas = document.createElement("canvas");
            outctx = outputCanvas.getContext("2d");
        }
        rv.appendChild(outputCanvas);
        outputCanvas.width = outputCanvas.parentElement.clientWidth;
        outputCanvas.height = outputCanvas.parentElement.clientHeight;
        outctx.imageSmoothingEnabled = false;
        render();

        openWindow();
        winbox.onresize = () => {
            outputCanvas.width = outputCanvas.parentElement.clientWidth;
            outputCanvas.height = outputCanvas.parentElement.clientHeight;
            outctx.imageSmoothingEnabled = false;
            render();
        }
        moveView((outputCanvas.width - roomLayers[0].width)/2, (outputCanvas.height - roomLayers[0].height)/2);
    }
    Room.loadRoom = loadRoom;

    function render() {
        if (outputCanvas.width == 0) {
            outputCanvas.width = outputCanvas.parentElement.clientWidth;
            outputCanvas.height = outputCanvas.parentElement.clientHeight;
            outctx.imageSmoothingEnabled = false;
            moveView((outputCanvas.width - roomLayers[0].width)/2, (outputCanvas.height - roomLayers[0].height)/2);
        }

        let t = outctx.getTransform();
        outctx.resetTransform();
        outctx.clearRect(0, 0, outctx.canvas.width, outctx.canvas.height);
        outctx.setTransform(t);
        for (let i = 0; i < roomLayers.length; i++)
        {
            if (roomLayers[i].layer.visible) {
                outctx.drawImage(roomLayers[i], 0, 0);
            }
        }

        if (Layers.onTileLayer()) {
            let off = Math.floor(brushSize/2);
            for (let i = 0; i < brushSize; i++) {
                for (let j = 0; j < brushSize; j++) {
                    drawTile(tilesetImage, outctx, TilePicker.getCurrentTile(mouseTile.x + mouseTile.y * (j+2) * (i+2)), -off + mouseTile.x + i, -off + mouseTile.y + j, tilesetData.tileWidth, tilesetData.tileHeight);
                }
            }
        }

        requestAnimationFrame(render);
    }
    Room.render = render;

    function updateVisibility() {
        for (let i = 0; i < roomLayers.length; i++) {
            roomLayers[i].style.visibility = roomLayers[i].layer.visible?"visible":"hidden";
        }
    }
    Room.updateVisibility = updateVisibility;

    function openWindow() {
        if (open) return;
        open = true;
        let size = Settings.getWindowSize("room", 10, 10, 400, 300);
        winbox = new WinBox("Room Viewer", {
            mount: document.querySelector("div.wb#roomViewer"),
            onclose: () => {
                open = false;
            },
            x:size.x,
            y:size.y,
            width:size.w,
            height:size.h,
            bottom:"2px",
            onresize: (w, h) => {
                Settings.saveWindowWH("room", w, h)
            },
            onmove: (x, y) => {
                Settings.saveWindowXY("room", x, y)
            }
        });
    }

    let dragging = false;
    let holding = false;
    let deleting = false;
    rv.addEventListener("mousedown", (e) => {
        if (e.button == 1) {
            dragging = true;
        }

        if (e.button == 0) {
            holding = true;
            Undo.beginSubstack();
            if (Layers.onTileLayer()) {
                let off = Math.floor(brushSize/2);
                for (let i = 0; i < brushSize; i++) {
                    for (let j = 0; j < brushSize; j++) {
                        let newTile = TilePicker.getCurrentTile();
                        let x = -off+mouseTile.x+i;
                        let y = -off+mouseTile.y+j;
                        let oldTile = getTile(x, y);
                        Undo.registerAction("Draw a tile", () => {
                            paintTile(x, y, newTile);
                        }, () => {
                            paintTile(x, y, oldTile);
                        });
                    }
                }
            }
        }

        if (e.button == 2) {
            deleting = true;
            Undo.beginSubstack();
            if (Layers.onTileLayer()) {
                let off = Math.floor(brushSize/2);
                for (let i = 0; i < brushSize; i++) {
                    for (let j = 0; j < brushSize; j++) {
                        let x = -off+mouseTile.x+i;
                        let y = -off+mouseTile.y+j;
                        let oldTile = getTile(x, y);
                        Undo.registerAction("Draw a tile", () => {
                            deleteTile(x, y);
                        }, () => {
                            paintTile(x, y, oldTile);
                        });
                    }
                }
            }
        }
    });

    function getTile(x, y) {
        return Layers.currentLayer.tiles["TileCompressedData"][1 + x + y * Layers.currentLayer.tiles.SerialiseWidth];
    }

    let lastdrawpos = {x:-1, y:-1};
    function paintTile(x, y, tile) {
        if (x >= Layers.currentLayer.tiles.SerialiseWidth) return;
        if (x < 0) return;
        if (y >= Layers.currentLayer.tiles.SerialiseHeight) return;
        if (y < 0) return;
        let index = x + y * Layers.currentLayer.tiles.SerialiseWidth;
        index += 1;
        Layers.currentLayer.tiles["TileCompressedData"][index] = tile;
        
        for (let i = 0; i < roomLayers.length; i++) {
            if (roomLayers[i].layer == Layers.currentLayer) {
                roomLayers[i].getContext("2d").clearRect(x * tilesetData.tileWidth, y * tilesetData.tileHeight, tilesetData.tileWidth, tilesetData.tileWidth);
                drawTile(roomLayers[i].tileset_image, roomLayers[i].getContext("2d"), tile, x, y, tilesetData.tileWidth, tilesetData.tileHeight);
                break;
            }
        }
    }

    function deleteTile(x, y) {
        let index = x + y * Layers.currentLayer.tiles.SerialiseWidth;
        index += 1;
        Layers.currentLayer.tiles["TileCompressedData"][index] = 0;
        for (let i = 0; i < roomLayers.length; i++) {
            if (roomLayers[i].layer == Layers.currentLayer) {
                roomLayers[i].getContext("2d").clearRect(x * tilesetData.tileWidth, y * tilesetData.tileHeight, tilesetData.tileWidth, tilesetData.tileWidth);
                break;
            }
        }
    }

    window.addEventListener("keydown", (e) => {
        if(e.ctrlKey && e.key == "s") {
            log("Saving room!");
            let path = GMF.getRoomDataPath(roomData["%Name"]);
            Engine.fileWriteText(path, JSON.stringify(roomData));
        }

        if (e.key == "]") {
            brushSize += 1;
        }

        if (e.key == "[") {
            if (brushSize > 1) brushSize -= 1;
        }
    })

    window.addEventListener("mouseup", (e) => {
        if (e.button == 1) {
            dragging = false;
        }

        if (e.button == 0) {
            if (holding) {
                Undo.compressSubstack("painting lots of tiles");
            }
            holding = false;
        }

        if (e.button == 2) {
            if (deleting) {
                Undo.compressSubstack("deleting lots of tiles");
            }
            deleting = false;
        }
    });

    function moveView(x, y) {
        let transform = outctx.getTransform();
        outctx.translate(x / transform.a, y / transform.d);
    }

    window.addEventListener("mousemove", (e) => {
        if (dragging) {
            moveView(e.movementX, e.movementY);
        }

        if (holding && Layers.onTileLayer()) {
            if (mouseTile.x != lastdrawpos.x || mouseTile.y != lastdrawpos.y) {
                lastdrawpos.x = mouseTile.x;
                lastdrawpos.y = mouseTile.y;

                let off = Math.floor(brushSize/2);
                for (let i = 0; i < brushSize; i++) {
                    for (let j = 0; j < brushSize; j++) {
                        let newTile = TilePicker.getCurrentTile();
                        let x = -off+mouseTile.x+i;
                        let y = -off+mouseTile.y+j;
                        let oldTile = getTile(x, y);
                        Undo.registerAction("Draw a tile", () => {
                            paintTile(x, y, newTile);
                        }, () => {
                            paintTile(x, y, oldTile);
                        });
                    }
                }
            }
        }

        if (deleting && Layers.onTileLayer()) {
            if (mouseTile.x != lastdrawpos.x || mouseTile.y != lastdrawpos.y) {
                lastdrawpos.x = mouseTile.x;
                lastdrawpos.y = mouseTile.y;

                let off = Math.floor(brushSize/2);
                for (let i = 0; i < brushSize; i++) {
                    for (let j = 0; j < brushSize; j++) {
                        let x = -off+mouseTile.x+i;
                        let y = -off+mouseTile.y+j;
                        let oldTile = getTile(x, y);
                        Undo.registerAction("Draw a tile", () => {
                            deleteTile(x, y);
                        }, () => {
                            paintTile(x, y, oldTile);
                        });
                    }
                }
            }
        }

        if (Layers.onInstanceLayer()) {
            for (let inst of Layers.currentLayer.instances) {
                if (mouseRoom.x >= inst.x && mouseRoom.y >= inst.y && mouseRoom.x < inst.x + 16 && mouseRoom.y < inst.y + 16) {
                    highlightRect(inst.x, inst.y, 8, 8);
                }
            }
        }
    });

    let mouseRoom = {x:0, y:0};
    let mouseTile = {x:0, y:0};
    rv.addEventListener("mousemove", (e) => {
        let t = outctx.getTransform().inverse();
        mouseRoom = t.transformPoint({x: e.offsetX, y:e.offsetY});

        if (Layers.onTileLayer()) {
            mouseTile.x = Math.floor(mouseRoom.x / tilesetData.tileWidth);
            mouseTile.y = Math.floor(mouseRoom.y / tilesetData.tileHeight);
        }
    });

    rv.addEventListener("wheel", (e) => {
        if (e.ctrlKey) {
            if (e.deltaY > 0 && brushSize > 1) brushSize -= 1;
            if (e.deltaY < 0) brushSize += 1;
        } else {
            let scaleFactor = 1;
            if (e.deltaY < 0) scaleFactor = 1.2;
            if (e.deltaY > 0) scaleFactor = 1/1.2;
            outctx.translate(mouseRoom.x, mouseRoom.y);
            outctx.scale(scaleFactor, scaleFactor);
            outctx.translate(-mouseRoom.x, -mouseRoom.y);
        }
    });

    window.Room = Room;
})();