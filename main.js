const { app, BrowserWindow, Menu, MenuItem, BrowserView, ipcMain } = require('electron/main')
const path = require('node:path')

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })

  // win.setMenu(null)

  const config = require('./config-default.json')

  win.loadURL(config['home'])

  win.webContents.on('will-navigate', function (e, url) {
    console.log("Will navigate: " + url)
    if (config['passing'].length > 0) {
      block = true
      for (var i = 0; i < config['passing'].length; ++i) {
        expr = config['passing'][i]
        if (url.match(expr)) {
          block = false
          break
        }
      }
      if (block) {
        console.log("block: " + url)
        e.preventDefault()
      }
    }
  })
}

function doGoBack() {
  windows = BrowserWindow.getAllWindows();
  if (windows.length === 1) {
    windows[0].webContents.navigationHistory.goBack()
  }
}

function doReload() {
  windows = BrowserWindow.getAllWindows();
  if (windows.length === 1) {
    windows[0].reload()
  }
}

const menu = new Menu()
menu.append(new MenuItem({
  label: '🔙 Trang trước',
  click: () => doGoBack()
}))
menu.append(new MenuItem({
  label: '⟳ Tải lại',
  click: () => doReload()
}))

Menu.setApplicationMenu(menu)

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})