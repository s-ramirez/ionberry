/**
 * Amy is Awesome!
 */
'use strict';
const app = require('app');
const ipc = require('electron').ipcRender

const BrowserWindow = require('browser-window');
const Menu = require('menu');

const angular = require('./client/lib/ng-electron/ng-bridge');

require('electron-debug')({
    showDevTools: true
});

function createMainWindow () {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		resizable: true
	});

	win.loadURL(`file://${__dirname}/index.html`);
	win.on('closed', onClosed);

	return win;
}

function onClosed() {
	mainWindow = null;
}
// prevent window being GC'd
let mainWindow;

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate-with-no-open-windows', function () {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

app.on('will-quit', function() {
	console.log('Thank you, good night!');
});

app.on('ready', function () {
	mainWindow = createMainWindow();
	mainWindow.webContents.on('dom-ready', function(e) {
		//try and manually bootstrap AngularJS
		var code = "angular.bootstrap(document, ['app']);"
		mainWindow.webContents.executeJavaScript( code );
	});

	mainWindow.webContents.on('did-finish-load', function( e ) {
		var menu = new Menu();
		var tpl = [
			{
				label: 'Ionberry',
				submenu: [
					{
						label: 'About',
						click: function() { console.log('Version 0.0.1'); }
					},
					{
						label: 'Quit',
						click: function() { app.quit(); },
						accelerator: 'Command+Q'
					}
				]
			},
      {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]}
		];
		menu = Menu.buildFromTemplate( tpl );
		Menu.setApplicationMenu(menu);

		//Start listening for client messages
		angular.listen(function(msg) {
			console.log('Client: ' + msg);
		});

	});
});
