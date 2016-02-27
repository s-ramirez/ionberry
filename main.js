'use strict';

const electron = require('electron');
const app = electron.app; //Module control app life
const BrowserWindow = electron.BrowserWindow; // Module create native browser window

var mainWindow = null; //global reference to the window object

//Quit when windows are closed
app.on('window-all-closed', function() {
    if(process.platform != 'darwin'){
        app.quit();
    }
});

//When finished init
app.on('ready', function() {
    mainWindow = new BrowserWindow({width: 800, height: 600});

    mainWindow.loadUrl('file://' + __dirname + '/index.html');

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});
