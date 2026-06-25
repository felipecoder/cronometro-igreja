import { app, BrowserWindow, screen, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let projectorWindow = null;
let mainWindow;

function getProjectorDisplay() {
    const displays = screen.getAllDisplays();
    const primaryDisplay = screen.getPrimaryDisplay();

    const explicitExternalDisplay = displays.find(
        (display) =>
            display.id !== primaryDisplay.id && display.internal === false
    );

    if (explicitExternalDisplay) {
        return explicitExternalDisplay;
    }

    const secondaryDisplay = displays.find(
        (display) => display.id !== primaryDisplay.id
    );

    return secondaryDisplay || primaryDisplay;
}

function notifyMainWindow(channel, payload) {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(channel, payload);
    }
}

function syncProjectorWindowToDisplay() {
    if (!projectorWindow || projectorWindow.isDestroyed()) {
        return;
    }

    const projectorDisplay = getProjectorDisplay();
    const { x, y, width, height } = projectorDisplay.bounds;

    projectorWindow.setBounds({ x, y, width, height });
    projectorWindow.setFullScreen(false);
    projectorWindow.setFullScreen(true);
    projectorWindow.focus();
}

function createProjectorWindow() {
    if (projectorWindow && !projectorWindow.isDestroyed()) {
        syncProjectorWindowToDisplay();
        return projectorWindow;
    }

    const projectorDisplay = getProjectorDisplay();
    const { x, y, width, height } = projectorDisplay.bounds;

    projectorWindow = new BrowserWindow({
        x,
        y,
        width,
        height,
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

    projectorWindow.once("ready-to-show", () => {
        syncProjectorWindowToDisplay();
    });

    notifyMainWindow("projector-opened");

    projectorWindow.on("closed", () => {
        notifyMainWindow("projector-closed");
        projectorWindow = null;
    });

    return projectorWindow;
}

function handleDisplayChange() {
    const hasExternalDisplay =
        screen.getAllDisplays().some(
            (display) => display.id !== screen.getPrimaryDisplay().id
        );

    if (hasExternalDisplay) {
        createProjectorWindow();
        return;
    }

    if (projectorWindow && !projectorWindow.isDestroyed()) {
        projectorWindow.close();
    }
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

    handleDisplayChange();
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

app.whenReady().then(() => {
    createWindow();

    screen.on("display-added", handleDisplayChange);
    screen.on("display-removed", handleDisplayChange);
    screen.on("display-metrics-changed", () => {
        if (projectorWindow && !projectorWindow.isDestroyed()) {
            syncProjectorWindowToDisplay();
        }
    });
});

app.on("window-all-closed", () => {
    if (projectorWindow) projectorWindow.close();
    if (process.platform !== "darwin") app.quit();
});
