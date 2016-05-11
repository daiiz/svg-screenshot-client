const app = require('electron').app;
const BrowserWindow = require('electron').BrowserWindow;
var userDataDir = app.getPath('userData');
var mainWindow = null;
var ipcMain = require("electron").ipcMain;
var NeDB = require('nedb');
var db = {
    samples: null
};

console.log(__dirname);
console.log(userDataDir);

var localFilePath = null;
app.on('open-file', (ev, path) => {
    ev.preventDefault();
    localFilePath = path;
});

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 730,
        titleBarStyle: 'hidden'
    });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});