(function() {
    let open = false;
    let winbox = null;
    let cachedObjects = null;

    let ObjectPicker = {};

    function openWindow() {
        if (open) return;
        open = true;
        Settings.saveWindowOpen("objectpicker", true);
        let size = Settings.getWindowSize("objectpicker", 40, 40, 200, 500);
        winbox = new WinBox("Object Picker", {
            mount: document.querySelector("div.wb#objectpicker"),
            onclose: () => {
                open = false;
                Settings.saveWindowOpen("objectpicker", false);
            },
            x:size.x,
            y:size.y,
            width:size.w,
            height:size.h,
            onresize: (w, h) => {
                Settings.saveWindowWH("objectpicker", w, h)
            },
            onmove: (x, y) => {
                Settings.saveWindowXY("objectpicker", x, y)
            }
        });
        

        // refresh the object list
        let objectPicker = document.querySelector("#objectpickerlist");
        objectPicker.innerHTML = "";

        GMF.listObjects((objects) => {
            cachedObjects = objects;
            buildList(objects, document.querySelector("#objectpickerfilter").value);
        });
    }
    ObjectPicker.openWindow = openWindow;

    function buildList(objects, filter) {
        let objectPicker = document.querySelector("#objectpickerlist");
        objectPicker.innerHTML = "";
        for (let i = 0; i < objects.length; i++) 
        {
            if (objects[i].indexOf(filter) == -1) continue;

            let option = document.createElement("div");

            option.className = "listOption";
            option.type = "radio";
            option.name = "objectPickerobject";
            option.value = objects[i];
            option.id = objects[i];
            option.innerText = objects[i];
            option.onclick = () => {
                setHighlight(objects[i]);
            }

            GMF.getObjectSprite(objects[i], (sprite_data) => {
                Util.loadImage(sprite_data.img_path, (data) => {
                    option.insertBefore(data, option.firstChild);
                })
            });

            objectPicker.appendChild(option);
        }
    }

    function setHighlight(id) {
        selectedObject = id;

        // update room viewer preview
        GMF.getObjectSprite(selectedObject, (sprite_data) => {
            Util.loadImage(sprite_data.img_path, (img) => {
                Room.setObjectPreview(img, sprite_data);
            })
        });

        let elements = document.querySelectorAll("#objectpickerlist .listOption");
        for (var el of elements) {
            el.setAttribute("selected", el.id == id?"true":"false");
        }
    }

    let selectedObject = "";

    function getSelectedObject() {
        return selectedObject;
    }
    ObjectPicker.getSelectedObject = getSelectedObject;

    document.querySelector("#objectpickerfilter").addEventListener("input", () => {
        buildList(cachedObjects, document.querySelector("#objectpickerfilter").value);
    })
    document.querySelector("#btn_objects").addEventListener("click", openWindow);

    window.ObjectPicker = ObjectPicker;
})();