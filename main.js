window.onload = () => {

    Engine.fileReadText("project.cfg", (data) => {
        GMF.setProjectPath(data);
        // GMF.listObjects();
    });

    Engine.setTitle("GMRoomEdit");

    setTimeout(() => { ObjectPicker.openWindow(); }, 50 + Math.random() * 200);
    setTimeout(() => { RoomPicker.openWindow(); }, 50 + Math.random() * 200);
    setTimeout(() => { openLog(); }, 50 + Math.random() * 200);

    Engine.fileReadText("D:/GitHub/Vividerie/rooms/ch_crystal_caves_17/ch_crystal_caves_17.yy", (data) => {
        console.log(data);
    });
}