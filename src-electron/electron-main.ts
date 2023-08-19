import { app, BrowserWindow, nativeTheme } from 'electron';
import path from 'path';
import os from 'os';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(
      path.join(app.getPath('userData'), 'DevTools Extensions')
    );
  }
} catch (_) {}

let mainWindow: BrowserWindow | undefined;

function getBounds() {
  const path = require('path');
  const fs = require('fs');

  const initPath = path.join(app.getPath('userData'), 'npaf_windowBounds.json');
  let data;

  try {
    data = JSON.parse(fs.readFileSync(initPath, 'utf8'));
  } catch (e) {
    //
  }

  const width =
    data && data.bounds && data.bounds.width ? data.bounds.width : 1e3;
  const height =
    data && data.bounds && data.bounds.height ? data.bounds.height : 600;

  let x, y;

  if (data && data.position) {
    x = data.position.x;
    y = data.position.y;
  }

  return {
    bounds: {
      width,
      height,
    },
    position: {
      x,
      y,
    },
  };
}

function setBounds(window: any) {
  const path = require('path');
  const fs = require('fs');

  const initPath = path.join(app.getPath('userData'), 'npaf_windowBounds.json');

  try {
    const [x, y] = window.getPosition();

    fs.writeFileSync(
      initPath,
      JSON.stringify({
        bounds: window.getBounds(),
        position: { x, y },
      })
    );
  } catch (e) {
    console.warn('FS ERROR:');
    console.warn(e);

    throw e;
    // return false;
  }

  return true;
}

function createWindow() {
  const bounds = getBounds() || { bounds: {}, position: {} };

  console.log('DIRNAME:', __dirname);

  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: bounds.bounds.width || 500,
    height: bounds.bounds.height || 800,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      sandbox: false,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  });

  if (bounds.position) {
    if (bounds.position.x && bounds.position.y) {
      mainWindow.setPosition(bounds.position.x, bounds.position.y, true);
    }
  }

  mainWindow.loadURL(process.env.APP_URL);

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  mainWindow.on('resize', () => {
    setBounds(mainWindow);
  });

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    createWindow();
  }
});
