(function() {
    let open = false;
    let winbox = null;

    let Layers = {};

    Layers.currentLayer = null;

    function openWindow() {
        if (open) return;
        open = true;
        winbox = new WinBox("Layers", {
            mount: document.querySelector("div.wb#layers"),
            onclose: () => {
                open = false;
            },
            x:"70%",
            y:"center",
            width:"20%"
        });
    }
    Layers.openWindow = openWindow;

    function buildList(roomData) {

        console.log(roomData);
        let layers = roomData.layers;

        openWindow();
        let layersElement = document.querySelector("#layerlist");
        layersElement.innerHTML = "";
        for (let i = 0; i < layers.length; i++) 
        {
            let option = document.createElement("div");

            option.className = "listOption";
            option.type = "radio";
            option.name = "layersListLayer";
            option.value = i;
            option.id = i;
            option.innerText = layers[i]["%Name"];
            option.onclick = () => {
                setHighlight(i);
                TilePicker.clear();

                Layers.currentLayer = layers[i];

                if (layers[i]["$GMRTileLayer"] != null) {
                    TilePicker.loadTileset(layers[i].tilesetId.name);
                }
            }

            if (layers[i]["$GMRInstanceLayer"] != null) { option.insertBefore(Util.img("img/instances.png"), option.firstChild); }
            if (layers[i]["$GMRTileLayer"] != null) { option.insertBefore(Util.img("img/tiles.png"), option.firstChild); }
            if (layers[i]["$GMRBackgroundLayer"] != null) { option.insertBefore(Util.img("img/bg.png"), option.firstChild); }

            let visibutton = document.createElement("button");
            visibutton.innerText = layers[i].visible==true?"O":"-";
            visibutton.onclick = () => {
                layers[i].visible =! layers[i].visible;
                Room.updateVisibility();
                buildList(roomData);
            }
            option.insertBefore(visibutton, option.firstChild);

            layersElement.appendChild(option);
        }
    }
    Layers.buildList = buildList;

    function setHighlight(id) {
        let elements = document.querySelectorAll("#layerlist .listOption");
        for (var el of elements) {
            el.setAttribute("selected", el.id == id?"true":"false");
        }
    }

    function getSelected() {
        let elements = document.querySelectorAll("#layerlist .listOption");
        for (var el of elements) {
            if (el.getAttribute("selected") == "true") return el.id;
        }
    }

    window.Layers = Layers;
})();