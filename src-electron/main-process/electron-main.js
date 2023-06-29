import { app, BrowserWindow, nativeTheme } from 'electron';
import fs from "fs";

try {
  if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) { }

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = __dirname
}

let mainWindow

/**
 * Initial window options
 */
function createWindow () {
    const path = require("path");
    const fs = require("fs");
    const initPath = path.join(app.getAppPath(), "init.json");
    console.warn({ initPath, appPath: app.getAppPath() });
    let data;

    try
    {
        data = JSON.parse(fs.readFileSync(initPath, 'utf8'));
    }
    catch(e)
    {
        //
    }

    const width = data && data.bounds && data.bounds.width ? data.bounds.width : 640;
    const height = data && data.bounds && data.bounds.height ? data.bounds.height : 1040;

    mainWindow = new BrowserWindow({
        width,
        height,
        useContentSize: true,
        webPreferences: {
          // Change from /quasar.conf.js > electron > nodeIntegration;
          // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
          nodeIntegration: process.env.QUASAR_NODE_INTEGRATION,
          nodeIntegrationInWorker: process.env.QUASAR_NODE_INTEGRATION,

          // More info: /quasar-cli/developing-electron-apps/electron-preload-script
          // preload: path.resolve(__dirname, 'electron-preload.js')
        }
    });

    mainWindow.on(
        'close',
        () =>
        {
            try
            {
                fs.writeFileSync(
                    initPath,
                    JSON.stringify({ bounds: mainWindow.getBounds() })
                );
            }
            catch(e)
            {
                console.warn('FS ERROR:');
                console.warn(e);
            }
        }
    );

    mainWindow.loadURL(process.env.APP_URL);

    mainWindow.on('closed', () => {
        mainWindow = null
    });
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
