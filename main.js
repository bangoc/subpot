const { app, dialog, BrowserWindow, Menu, MenuItem } = require('electron/main')
const path = require('node:path')

async function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: 'images/icon.png'
  })

  var config;
  try {
    config = await fetch('https://bangoc.github.io/subpot/config.json')
                            .then(res => {
                        if (!res.ok) {
                          throw new Error("Lỗi tải dữ liệu")
                        }
                        return res.json()
                    })

    console.log("Fetch success config: " + JSON.stringify(config))
  } catch {
    console.log("Fetch failed, fallback to default!")
    config = require('./config-default.json')
  }

  console.log("Final config: " + JSON.stringify(config))

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

about_options = {
  type: 'info',
  title: 'Giới thiệu',
  icon: 'images/icon.png',
  message: 'SubPot phiên bản ' + app.getVersion(),
  detail: 'Chương trình hỗ trợ giới hạn truy cập mạng.\n' +
           'Tác giả: Nguyễn Bá Ngọc\n' +
           'email: ngocnb@soict.hust.edu.vn'
}

function doAbout() {
  windows = BrowserWindow.getAllWindows();
  if (windows.length === 1) {
    dialog.showMessageBox(windows[0], about_options)
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
menu.append(new MenuItem({
  label: '? Giới thiệu',
  click: () =>doAbout()
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