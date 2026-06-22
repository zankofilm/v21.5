
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('JavanroodNativeStore',{
  version:'V21_FIXED',
  loadState:(k)=>ipcRenderer.invoke('native:loadState',k),
  saveState:(k,s)=>ipcRenderer.invoke('native:saveState',k,s),
  getVersion:()=>ipcRenderer.invoke('native:getVersion')
});
