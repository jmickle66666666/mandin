(function() {
    let open = false;
    let winbox = null;

    let AssetWindow = {};

    function openWindow() {
        if (open) return;
        open = true;
        Settings.saveWindowOpen("assetwindow", true);
        let size = Settings.getWindowSize("assetwindow", 40, 40, 200, 500);
        winbox = new WinBox("Asset Window", {
            mount: document.querySelector("div.wb#assetwindow"),
            onclose: () => {
                open = false;
                Settings.saveWindowOpen("assetwindow", false);
            },
            x:size.x,
            y:size.y,
            width:size.w,
            height:size.h,
            onresize: (w, h) => {
                Settings.saveWindowWH("assetwindow", w, h)
            },
            onmove: (x, y) => {
                Settings.saveWindowXY("assetwindow", x, y)
            }
        });
    }
    AssetWindow.openWindow = openWindow;

    let currentNode = null;

    function attach(node) {
        openWindow();
        if (currentNode != null) {
            document.querySelector("windows").appendChild(currentNode);
            document.querySelector("div.wb#assetwindow").innerHTML = "";
        }
        currentNode = node;
        document.querySelector("div.wb#assetwindow").appendChild(node);
    }
    AssetWindow.attach = attach;

    document.querySelector("#btn_assets").addEventListener("click", openWindow);

    window.AssetWindow = AssetWindow;
})();