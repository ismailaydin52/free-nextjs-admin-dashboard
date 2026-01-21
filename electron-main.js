const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../.next/standalone/.next/server/pages/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  createWindow();

  // Haftalık otomatik yedek
  setupAutoBackup();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function setupAutoBackup() {
  const backupDir = path.join(app.getPath('userData'), 'backups');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Her 7 gün (604800000 ms) sonra yedek al
  setInterval(() => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

    const dataDir = path.join(app.getPath('userData'), 'data');
    const sourceFile = path.join(dataDir, 'shop-data.json');

    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, backupFile);
      console.log(`Yedek oluşturuldu: ${backupFile}`);
    }
  }, 7 * 24 * 60 * 60 * 1000); // 7 gün
}
