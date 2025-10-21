const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // load local dev server or production file
  const devUrl = 'http://localhost:4200';
  win.loadURL(devUrl).catch(() => {
    win.loadFile(path.join(__dirname, '..', 'public', 'index.html'));
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

const fs = require('fs');

// IPC to open or reveal path
ipcMain.handle('open-path', async (event, targetPath) => {
  try {
    console.log('ipc open-path called with raw:', targetPath);
    if (!targetPath) return { ok: false, message: 'no path' };
    // attempt to decode URL-encoded paths (if caller encoded them)
    try {
      if (typeof targetPath === 'string' && /%[0-9A-Fa-f]{2}/.test(targetPath)) {
        targetPath = decodeURIComponent(targetPath);
        console.log('decoded targetPath:', targetPath);
      }
    } catch (decErr) {
      console.warn('decodeURIComponent failed', decErr);
    }
    // normalize path separators
    try { targetPath = path.normalize(String(targetPath)); } catch (normErr) { console.warn('path.normalize failed', normErr); }
    // Prefer to check the filesystem to see if it's a folder or file
    try {
      console.log('stat-ing path:', targetPath);
      const stats = await fs.promises.stat(targetPath);
      if (stats.isDirectory && stats.isDirectory()) {
        // open the folder in the system file manager
        const res = await shell.openPath(targetPath);
        if (res) return { ok: false, message: res };
        return { ok: true };
      }
      // it's a file -> reveal in folder
      if (shell.showItemInFolder) {
        shell.showItemInFolder(targetPath);
        return { ok: true };
      }
      const res2 = await shell.openPath(path.dirname(targetPath));
      if (res2) return { ok: false, message: res2 };
      return { ok: true };
    } catch (fsErr) {
      console.warn('fs.stat failed', fsErr);
      // if stat failed (path may not exist locally or permission), fall back to openPath
      const result = await shell.openPath(targetPath);
      if (result) return { ok: false, message: result };
      return { ok: true };
    }
  } catch (e) {
    return { ok: false, message: String(e) };
  }
});
