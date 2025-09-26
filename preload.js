const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('todoAPI', {
    getTodos: () => ipcRenderer.invoke('get-todos'),
    addTodo: (text) => ipcRenderer.invoke('add-todo', text),
    toggleTodo: (id) => ipcRenderer.invoke('toggle-todo', id),
    deleteTodo: (id) => ipcRenderer.invoke('delete-todo', id),
    updateTodo: (id, newText) => ipcRenderer.invoke('update-todo', id, newText),
    setPriority: (id, priority) => ipcRenderer.invoke('set-priority', id, priority),
    clearAll: () => ipcRenderer.invoke('clear-all-todos'),
    setMemo: (id, memo) => ipcRenderer.invoke('set-memo', id, memo),
    deleteMemo: (id) => ipcRenderer.invoke('delete-memo', id),
    setDueDate: (id, dueDate) => ipcRenderer.invoke('set-due-date', id, dueDate)
});

contextBridge.exposeInMainWorld('windowAPI', {
    minimize: () => ipcRenderer.send('minimize-window'),
    close: () => ipcRenderer.send('close-window'),
    setMinSize: (width, height) => ipcRenderer.send('set-min-size', width, height),
    setOpacity: (opacity) => ipcRenderer.invoke('set-opacity', opacity),
    toggleAlwaysOnTop: (alwaysOnTop) => ipcRenderer.invoke('toggle-always-on-top', alwaysOnTop),
    getWindowSettings: () => ipcRenderer.invoke('get-window-settings')
});