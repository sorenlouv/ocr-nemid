'use strict';

const {app, BrowserWindow, Menu} = require('electron');
let primaryWindow, secondaryWindow;

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  createSecondaryWindow();
  createPrimaryWindow();
  createMenuIfNotExist();
});

app.on('activate', () => {
  if (primaryWindow === null) {
    createPrimaryWindow();
  }
});

function createMenuIfNotExist() {
  if (Menu.getApplicationMenu()) {
    return;
  }

  let menuTemplate = require('./src/electron/menuTemplate.js');
  let menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

function createPrimaryWindow() {
  primaryWindow = new BrowserWindow({
    width: 400,
    height: 350,
    title: 'NemID Hjælperen'
  });

  primaryWindow.hide();
  primaryWindow.setProgressBar(-1); // hack: force icon refresh
  primaryWindow.loadURL('file://' + __dirname + '/src/primaryWindow.html');

  primaryWindow.webContents.on('did-finish-load', () => {
    primaryWindow.show();

    if(secondaryWindow){
      let secondaryWindowBounds = secondaryWindow.getBounds();
      primaryWindow.setBounds(secondaryWindowBounds);
      secondaryWindow.close();
    }
  });

  // Open the DevTools.
  // primaryWindow.webContents.openDevTools();

  primaryWindow.on('closed', () => primaryWindow = null);
}

function createSecondaryWindow() {
  secondaryWindow = new BrowserWindow({
    width: 400,
    height: 350,
    title: 'Loading NemID...'
  });

  secondaryWindow.loadURL('file://' + __dirname + '/src/secondaryWindow.html');
  secondaryWindow.on('closed', () => secondaryWindow = null);
}
