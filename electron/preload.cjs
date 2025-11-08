const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    sendTimer: (data) => ipcRenderer.send("timer-update", data),
    onTimer: (callback) => ipcRenderer.on("timer-update", (_, data) => callback(data)),

    sendTheme: (data) => ipcRenderer.send("theme-update", data),
    onThemeChange: (callback) => ipcRenderer.on("theme-update", (_, data) => callback(data)),

    openProjector: () => ipcRenderer.send("open-projector"),
    closeProjector: () => ipcRenderer.send("close-projector"),

    onEsc: (callback) => {
        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape") callback();
        });
    },
});
