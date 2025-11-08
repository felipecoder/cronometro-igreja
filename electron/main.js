import { app, BrowserWindow, screen, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let projectorWindow = null;
let mainWindow;

function createProjectorWindow() {
    const displays = screen.getAllDisplays();

    const externalDisplay =
        displays.length > 1 ? displays[1].bounds : displays[0].bounds;

    projectorWindow = new BrowserWindow({
        x: externalDisplay.x,
        y: externalDisplay.y,
        fullscreen: true,
        frame: false,
        alwaysOnTop: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
        },
		autoHideMenuBar: app.isPackaged ? true : false
    });

    const devServerURL = "http://localhost:5173/#/projector";
    const prodIndex = `file://${path.join(
        __dirname,
        "../dist/index.html"
    )}#/projector`;

    if (!app.isPackaged) {
        projectorWindow.loadURL(devServerURL);
    } else {
        projectorWindow.loadURL(prodIndex);
    }

    projectorWindow.on("closed", () => {
        projectorWindow = null;
    });
}

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
        },
		autoHideMenuBar: app.isPackaged ? true : false
    });

    const devServerURL = "http://localhost:5173/";
    const prodIndex = `file://${path.join(__dirname, "../dist/index.html")}`;

    if (!app.isPackaged) {
        await mainWindow.loadURL(devServerURL);
        mainWindow.webContents.openDevTools();
    } else {
        await mainWindow.loadURL(prodIndex);
    }

    mainWindow.on("close", () => {
        if (projectorWindow) {
            projectorWindow.close();
        }
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

ipcMain.on("open-projector", () => {
    if (!projectorWindow) createProjectorWindow();
});

ipcMain.on("close-projector", () => {
    if (projectorWindow) projectorWindow.close();
});

ipcMain.on("timer-update", (_, data) => {
    if (projectorWindow) {
        projectorWindow.webContents.send("timer-update", data);
    }
});

ipcMain.on("theme-update", (event, data) => {
    if (projectorWindow) {
        projectorWindow.webContents.send("theme-update", data);
    }
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (projectorWindow) projectorWindow.close();
    if (process.platform !== "darwin") app.quit();
});
