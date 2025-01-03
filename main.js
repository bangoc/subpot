const { app, dialog, BrowserWindow, Menu, MenuItem } = require('electron/main')
const fs = require("fs");
const path = require('node:path')

const app_path = app.getAppPath()
const config_override = path.join(app_path, "config-override")
const local_default_config = path.join(app_path, "config-default.json")

var config;

async function loadConfig() {
  config_url = 'https://bangoc.github.io/subpot/config.json'
  console.log("check: " + config_override)
  if (fs.existsSync(config_override)) {
    const contents = fs.readFileSync(config_override, 'utf-8')
    config_url = contents.split(/\r?\n/)[0]
    console.log("Config url is overrided to: " + config_url)
  }

  try {
    config = await fetch(config_url).then(res => {
                        if (!res.ok) {
                          throw new Error("Can not fetch config")
                        }
                        return res.json()
                    })

    console.log("Config fetch successful: " + JSON.stringify(config))
  } catch {
    console.log("Config fetch failed, fallback to default: " + local_default_config)
    if (fs.existsSync(local_default_config)) {
      config = require(local_default_config)
    } else {
      console.log(local_default_config + " Does not exists, no way to load config.")
      app.exit(0)
    }
  }

  console.log("Final config: " + JSON.stringify(config))
}

async function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: 'images/icon.png'
  })

  if (typeof config != 'undefined' && 'home' in config) {
    win.loadURL(config['home'])
  } else {
    console.log("home parameter is not set, can not start due to unknown home.")
    return 1
  }

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

async function doStart() {
  await loadConfig()

  await createWindow()
}

app.whenReady().then(() => {

  doStart()

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