const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('JavanroodNativeStore', {
  version: 'V105_ADMIN_ICON_SECURITY_SETTINGS',
  loadState: (key) => ipcRenderer.invoke('native:loadState', key),
  saveState: (key, state) => ipcRenderer.invoke('native:saveState', key, state),
  backupState: (key, state) => ipcRenderer.invoke('native:backupState', key, state),
  openDataDir: () => ipcRenderer.invoke('native:openDataDir'),
  sha256Hex: (text) => ipcRenderer.invoke('native:sha256Hex', text),
  signActivation: (payload) => ipcRenderer.invoke('native:signActivation', payload),
  hashActivationPassword: (password, salt) => ipcRenderer.invoke('native:hashActivationPassword', password, salt)
});
