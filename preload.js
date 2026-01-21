const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => require('./package.json').version,
});
