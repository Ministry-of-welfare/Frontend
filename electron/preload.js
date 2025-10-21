const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openPath: (p) => ipcRenderer.invoke('open-path', p)
});
