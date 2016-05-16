const app = require('electron').app;
const BrowserWindow = require('electron').BrowserWindow;
var userDataDir = app.getPath('userData');

var ipcMain = require("electron").ipcMain;
var NeDB = require('nedb');
var db = {
    samples: null
};

var isAppReady = false;
var localFilePath = '';

app.on('open-file', (ev, path) => {
    ev.preventDefault();
    if (isAppReady) {
        openBrowserWindow(path); 
    }else {
        localFilePath = path;
    }
});

app.on('ready', () => {
    isAppReady = true;
    openBrowserWindow(localFilePath);
});

// 全てのウィンドウが閉じたらアプリケーションを終了
app.on('window-all-closed', () => {
    app.quit();
});

var openBrowserWindow = (givenFilePath) => {
    var bw = new BrowserWindow({
        width: 600,
        height: 730,
        titleBarStyle: 'hidden'
    });
    bw.loadURL(`file://${__dirname}/index.html#${(givenFilePath || '')}`);
    bw.openDevTools();
    bw.on('closed', () => {
        bw = null;
    });
};