(function() {
    let open = false;
    let winbox = null;
    let cachedRooms = null;

    let RoomPicker = {};

    function openWindow() {
        if (open) return;
        open = true;
        Settings.saveWindowOpen("roompicker", true);

        let size = Settings.getWindowSize("roompicker", 50, 50, 200, 500);
        winbox = new WinBox("Room Picker", {
            mount: document.querySelector("div.wb#roompicker"),
            onclose: () => {
                open = false;
                Settings.saveWindowOpen("roompicker", false);
            },
            x:size.x,
            y:size.y,
            width:size.w,
            height:size.h,
            onresize: (w, h) => {
                Settings.saveWindowWH("roompicker", w, h)
            },
            onmove: (x, y) => {
                Settings.saveWindowXY("roompicker", x, y)
            }
        });
        
        // refresh the object list
        let roomPicker = document.querySelector("#roompickerlist");
        roomPicker.innerHTML = "";

        GMF.listRooms((rooms) => {
            cachedRooms = rooms;
            buildList(rooms, document.querySelector("#roompickerfilter").value);
        });
    }
    RoomPicker.openWindow = openWindow;

    function buildList(rooms, filter) {
        let roomPicker = document.querySelector("#roompickerlist");
        roomPicker.innerHTML = "";
        for (let i = 0; i < rooms.length; i++) 
        {
            if (rooms[i].indexOf(filter) == -1) continue;

            let option = document.createElement("div");

            option.className = "listOption";
            option.type = "radio";
            option.name = "roomPickerRoom";
            option.value = rooms[i];
            option.id = rooms[i];
            option.innerText = rooms[i];
            option.onclick = () => {
                setHighlight(rooms[i]);
            }

            roomPicker.appendChild(option);
        }
    }

    function setHighlight(id) {
        let elements = document.querySelectorAll("#roompickerlist .listOption");
        for (var el of elements) {
            el.setAttribute("selected", el.id == id?"true":"false");
        }
    }

    function getSelected() {
        let elements = document.querySelectorAll("#roompickerlist .listOption");
        for (var el of elements) {
            if (el.getAttribute("selected") == "true") return el.id;
        }
    }

    function loadRoom()
    {
        log("load room: "+getSelected());

        GMF.getRoomData(getSelected(), (data) => {
            console.log(data);
            Layers.buildList(data);
            Room.renderRoom(data, (canvas) => {
                log(canvas);
            });
        });
    }

    document.querySelector("#roompickerfilter").addEventListener("input", () => {
        buildList(cachedRooms, document.querySelector("#roompickerfilter").value);
    })
    document.querySelector("#btn_rooms").addEventListener("click", openWindow);
    document.querySelector("#btn_roompickerload").addEventListener("click", loadRoom);

    window.RoomPicker = RoomPicker;
})();