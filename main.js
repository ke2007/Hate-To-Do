const { app, BrowserWindow, ipcMain } = require('electron');
const Store = require('electron-store');
const path = require('path');

// 데이터 저장소 초기화
const store = new Store();

let mainWindow;
let splashWindow;

function createSplashWindow() {
    splashWindow = new BrowserWindow({
        width: 300,
        height: 300,
        frame: false,
        alwaysOnTop: true,
        transparent: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        icon: path.join(__dirname, 'hate_to_do_icon.ico'),
        resizable: false
    });

    splashWindow.loadFile('splash.html');
    splashWindow.center();

}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 900,
        minWidth: 250,
        minHeight: 500,
        resizable: true,
        frame: false,
        titleBarStyle: 'hidden',
        backgroundColor: '#1a1a1a',
        icon: path.join(__dirname, 'hate_to_do_icon.ico'),
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');

    // 준비되면 표시
    mainWindow.once('ready-to-show', () => {
        // setMinimumSize 메서드로 최소 크기 설정
        mainWindow.setMinimumSize(250, 500);
        console.log('Minimum size set using setMinimumSize:', mainWindow.getMinimumSize());
        
        // 저장된 윈도우 설정 적용
        const savedOpacity = store.get('windowSettings.opacity', 1.0);
        const savedAlwaysOnTop = store.get('windowSettings.alwaysOnTop', false);
        
        mainWindow.setOpacity(savedOpacity);
        mainWindow.setAlwaysOnTop(savedAlwaysOnTop);
        
        console.log(`Applied saved settings - Opacity: ${savedOpacity}, Always on top: ${savedAlwaysOnTop}`);
        
        setTimeout(() => {
            if (splashWindow) {
                splashWindow.close();
            }
            mainWindow.show();
        }, 500);
    });

    // 개발 중에는 DevTools 열기
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    createSplashWindow();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// === TODO MANAGEMENT HANDLERS ===

// Get all todos
ipcMain.handle('get-todos', async () => {
    try {
        return store.get('todos', []);
    } catch (error) {
        console.error('Failed to get todos:', error);
        return [];
    }
});

// Add new todo
ipcMain.handle('add-todo', async (event, text) => {
    try {
        // Input validation
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            throw new Error('Todo text is required and must be a non-empty string');
        }

        if (text.trim().length > 1000) {
            throw new Error('Todo text must be less than 1000 characters');
        }

        const todos = store.get('todos', []);
        const today = new Date().toISOString().split('T')[0];
        const newTodo = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            priority: null,
            date: today,
            createdAt: new Date().toISOString(),
            dueDate: null
        };
        
        todos.push(newTodo);
        store.set('todos', todos);
        console.log(`Todo added: "${newTodo.text}" (ID: ${newTodo.id})`);
        return todos;
    } catch (error) {
        console.error('Failed to add todo:', error);
        throw error;
    }
});

// Update existing todo text
ipcMain.handle('update-todo', async (event, id, newText) => {
    try {
        // Input validation
        if (!id || typeof id !== 'number') {
            throw new Error('Todo ID is required and must be a number');
        }

        if (!newText || typeof newText !== 'string' || newText.trim().length === 0) {
            throw new Error('Todo text is required and must be a non-empty string');
        }

        if (newText.trim().length > 1000) {
            throw new Error('Todo text must be less than 1000 characters');
        }

        const todos = store.get('todos', []);
        const todo = todos.find(t => t.id === id);
        
        if (!todo) {
            throw new Error(`Todo with ID ${id} not found`);
        }

        todo.text = newText.trim();
        store.set('todos', todos);
        console.log(`Todo updated: "${todo.text}" (ID: ${id})`);
        return todos;
    } catch (error) {
        console.error('Failed to update todo:', error);
        throw error;
    }
});

// Toggle todo completion status
ipcMain.handle('toggle-todo', async (event, id) => {
    try {
        // Input validation
        if (!id || typeof id !== 'number') {
            throw new Error('Todo ID is required and must be a number');
        }

        const todos = store.get('todos', []);
        const todo = todos.find(t => t.id === id);
        
        if (!todo) {
            throw new Error(`Todo with ID ${id} not found`);
        }

        todo.completed = !todo.completed;
        store.set('todos', todos);
        console.log(`Todo ${todo.completed ? 'completed' : 'uncompleted'}: "${todo.text}" (ID: ${id})`);
        return todos;
    } catch (error) {
        console.error('Failed to toggle todo:', error);
        throw error;
    }
});

// Delete todo
ipcMain.handle('delete-todo', async (event, id) => {
    try {
        // Input validation
        if (!id || typeof id !== 'number') {
            throw new Error('Todo ID is required and must be a number');
        }

        let todos = store.get('todos', []);
        const originalCount = todos.length;
        todos = todos.filter(t => t.id !== id);
        
        if (todos.length === originalCount) {
            throw new Error(`Todo with ID ${id} not found`);
        }

        store.set('todos', todos);
        console.log(`Todo deleted (ID: ${id})`);
        return todos;
    } catch (error) {
        console.error('Failed to delete todo:', error);
        throw error;
    }
});

// Clear all todos
ipcMain.handle('clear-all-todos', async () => {
    try {
        const todos = store.get('todos', []);
        const count = todos.length;
        store.set('todos', []);
        console.log(`Cleared all todos (${count} items removed)`);
        return [];
    } catch (error) {
        console.error('Failed to clear all todos:', error);
        throw error;
    }
});

// === PRIORITY MANAGEMENT HANDLERS ===

// Set todo priority
ipcMain.handle('set-priority', async (event, id, priority) => {
    try {
        // Input validation
        if (!id || typeof id !== 'number') {
            throw new Error('Todo ID is required and must be a number');
        }

        if (priority !== null && (typeof priority !== 'number' || priority < 1 || priority > 8)) {
            throw new Error('Priority must be null or a number between 1 and 8');
        }

        const todos = store.get('todos', []);
        const todo = todos.find(t => t.id === id);
        
        if (!todo) {
            throw new Error(`Todo with ID ${id} not found`);
        }

        todo.priority = priority;
        store.set('todos', todos);
        console.log(`Todo priority set to ${priority}: "${todo.text}" (ID: ${id})`);
        return todos;
    } catch (error) {
        console.error('Failed to set priority:', error);
        throw error;
    }
});

// === MEMO MANAGEMENT HANDLERS ===

// Set memo for todo
ipcMain.handle('set-memo', async (event, id, memo) => {
    try {
        // Input validation
        if (!id || typeof id !== 'number') {
            throw new Error('Todo ID is required and must be a number');
        }

        if (memo && (typeof memo !== 'string' || memo.length > 300)) {
            throw new Error('Memo must be a string with maximum 300 characters');
        }

        const todos = store.get('todos', []);
        const todo = todos.find(t => t.id === id);
        
        if (!todo) {
            throw new Error(`Todo with ID ${id} not found`);
        }

        todo.memo = memo ? memo.trim() : '';
        store.set('todos', todos);
        console.log(`Memo ${memo ? 'set' : 'cleared'} for todo: "${todo.text}" (ID: ${id})`);
        return todos;
    } catch (error) {
        console.error('Failed to set memo:', error);
        throw error;
    }
});

// Set due date for todo
ipcMain.handle('set-due-date', async (event, id, dueDate) => {
    try {
        // Input validation
        if (!id || typeof id !== 'number') {
            throw new Error('Todo ID is required and must be a number');
        }

        const todos = store.get('todos', []);
        const todo = todos.find(t => t.id === id);
        
        if (!todo) {
            throw new Error('Todo not found');
        }

        // Validate dueDate format if provided
        if (dueDate !== null && dueDate !== undefined) {
            if (typeof dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
                throw new Error('Due date must be in YYYY-MM-DD format or null');
            }
        }

        todo.dueDate = dueDate;
        store.set('todos', todos);
        console.log(`Due date ${dueDate ? 'set' : 'removed'} for todo ID: ${id}`);
        return todos;
    } catch (error) {
        console.error('Failed to set due date:', error);
        throw error;
    }
});

// Delete memo from todo
ipcMain.handle('delete-memo', async (event, id) => {
    try {
        // Input validation
        if (!id || typeof id !== 'number') {
            throw new Error('Todo ID is required and must be a number');
        }

        const todos = store.get('todos', []);
        const todo = todos.find(t => t.id === id);
        
        if (!todo) {
            throw new Error(`Todo with ID ${id} not found`);
        }

        delete todo.memo;
        store.set('todos', todos);
        console.log(`Memo deleted for todo: "${todo.text}" (ID: ${id})`);
        return todos;
    } catch (error) {
        console.error('Failed to delete memo:', error);
        throw error;
    }
});

// === WINDOW CONTROL HANDLERS ===

// Minimize window
ipcMain.on('minimize-window', () => {
    try {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.minimize();
            console.log('Window minimized');
        } else {
            console.warn('Cannot minimize: Main window not available');
        }
    } catch (error) {
        console.error('Failed to minimize window:', error);
    }
});

// Close window
ipcMain.on('close-window', () => {
    try {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.close();
            console.log('Window closed');
        } else {
            console.warn('Cannot close: Main window not available');
        }
    } catch (error) {
        console.error('Failed to close window:', error);
    }
});

// Set minimum window size
ipcMain.on('set-min-size', (event, width, height) => {
    try {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.setMinimumSize(width, height);
            const currentBounds = mainWindow.getBounds();
            if (currentBounds.width < width || currentBounds.height < height) {
                mainWindow.setBounds({
                    ...currentBounds,
                    width: Math.max(currentBounds.width, width),
                    height: Math.max(currentBounds.height, height)
                });
            }
            console.log(`Minimum size set to ${width}x${height}`);
        } else {
            console.warn('Cannot set min size: Main window not available');
        }
    } catch (error) {
        console.error('Failed to set minimum size:', error);
    }
});

// === WINDOW SETTINGS HANDLERS ===

// Set window opacity
ipcMain.handle('set-opacity', async (event, opacity) => {
    try {
        if (!mainWindow || mainWindow.isDestroyed()) {
            throw new Error('Main window not available');
        }

        // Validate opacity value (0.1 to 1.0)
        if (typeof opacity !== 'number' || opacity < 0.1 || opacity > 1.0) {
            throw new Error('Opacity must be a number between 0.1 and 1.0');
        }

        mainWindow.setOpacity(opacity);
        
        // Save setting to store
        store.set('windowSettings.opacity', opacity);
        
        console.log(`Window opacity set to ${opacity}`);
        return { success: true, opacity };
    } catch (error) {
        console.error('Failed to set opacity:', error);
        throw error;
    }
});

// Toggle always on top
ipcMain.handle('toggle-always-on-top', async (event, alwaysOnTop) => {
    try {
        if (!mainWindow || mainWindow.isDestroyed()) {
            throw new Error('Main window not available');
        }

        // If no argument provided, toggle current state
        if (typeof alwaysOnTop !== 'boolean') {
            alwaysOnTop = !mainWindow.isAlwaysOnTop();
        }

        mainWindow.setAlwaysOnTop(alwaysOnTop);
        
        // Save setting to store
        store.set('windowSettings.alwaysOnTop', alwaysOnTop);
        
        console.log(`Always on top ${alwaysOnTop ? 'enabled' : 'disabled'}`);
        return { success: true, alwaysOnTop };
    } catch (error) {
        console.error('Failed to toggle always on top:', error);
        throw error;
    }
});

// Get current window settings
ipcMain.handle('get-window-settings', async () => {
    try {
        if (!mainWindow || mainWindow.isDestroyed()) {
            throw new Error('Main window not available');
        }

        const settings = {
            opacity: store.get('windowSettings.opacity', 1.0),
            alwaysOnTop: mainWindow.isAlwaysOnTop()
        };

        return settings;
    } catch (error) {
        console.error('Failed to get window settings:', error);
        return { opacity: 1.0, alwaysOnTop: false };
    }
});

