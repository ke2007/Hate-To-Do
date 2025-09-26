// Main application entry point

// Global function wrappers for HTML onclick handlers
// These maintain backwards compatibility with existing HTML

// Todo operations
function addHate() {
    window.todoController.addHate();
}

function setPriority(id) {
    window.todoController.setPriority(id);
}

function deleteHate(id) {
    window.todoController.deleteHate(id);
}

function startEditHate(id) {
    window.todoController.startEditHate(id);
}

function handleEditKeydown(event, id) {
    window.todoController.handleEditKeydown(event, id);
}

function saveEditHate(id) {
    window.todoController.saveEditHate(id);
}

function cancelEditHate(id) {
    window.todoController.cancelEditHate(id);
}

function toggleTodo(id) {
    window.todoController.toggleTodo(id);
}

// Date operations
function changeDate(direction) {
    window.todoController.changeDate(direction);
}

function showAllDates() {
    window.todoController.showAllDates();
}

// Screen operations
function switchScreen() {
    window.todoController.switchScreen();
}

function clearAllWithConfirm() {
    window.todoController.clearAllWithConfirm();
}

// Memo operations
function openMemoModal(id) {
    window.memoController.openMemoModal(id);
}

function viewMemoModal(id) {
    window.memoController.viewMemoModal(id);
}

function closeMemoModal() {
    window.memoController.closeMemoModal();
}

function updateCharCount(textarea) {
    window.memoController.updateCharCount(textarea);
}

function handleMemoKeydown(event, id) {
    window.memoController.handleMemoKeydown(event, id);
}

function saveMemo(id) {
    window.memoController.saveMemo(id);
}

function deleteMemo(id) {
    window.memoController.deleteMemo(id);
}

function showMemoPreview(event, todoId) {
    window.memoController.showMemoPreview(event, todoId);
}

function hideMemoPreview() {
    window.memoController.hideMemoPreview();
}

// Window operations
function minimizeWindow() {
    window.WindowAPI.minimize();
}

function closeWindow() {
    window.WindowAPI.close();
}

// Application initialization
// Main application entry point

// Global function wrappers for HTML onclick handlers
// These maintain backwards compatibility with existing HTML

// Todo operations
function addHate() {
    window.todoController.addHate();
}

function setPriority(id) {
    window.todoController.setPriority(id);
}

function deleteHate(id) {
    window.todoController.deleteHate(id);
}

function startEditHate(id) {
    window.todoController.startEditHate(id);
}

function handleEditKeydown(event, id) {
    window.todoController.handleEditKeydown(event, id);
}

function saveEditHate(id) {
    window.todoController.saveEditHate(id);
}

function cancelEditHate(id) {
    window.todoController.cancelEditHate(id);
}

function toggleTodo(id) {
    window.todoController.toggleTodo(id);
}

// Date operations
function changeDate(direction) {
    window.todoController.changeDate(direction);
}

function showAllDates() {
    window.todoController.showAllDates();
}

// Screen operations
function switchScreen() {
    window.todoController.switchScreen();
}

function clearAllWithConfirm() {
    window.todoController.clearAllWithConfirm();
}

// Memo operations
function openMemoModal(id) {
    window.memoController.openMemoModal(id);
}

function viewMemoModal(id) {
    window.memoController.viewMemoModal(id);
}

function closeMemoModal() {
    window.memoController.closeMemoModal();
}

function updateCharCount(textarea) {
    window.memoController.updateCharCount(textarea);
}

function handleMemoKeydown(event, id) {
    window.memoController.handleMemoKeydown(event, id);
}

function saveMemo(id) {
    window.memoController.saveMemo(id);
}

function deleteMemo(id) {
    window.memoController.deleteMemo(id);
}

function showMemoPreview(event, todoId) {
    window.memoController.showMemoPreview(event, todoId);
}

function hideMemoPreview() {
    window.memoController.hideMemoPreview();
}

// Window operations
function minimizeWindow() {
    window.WindowAPI.minimize();
}

function closeWindow() {
    window.WindowAPI.close();
}

// Application initialization
async function initializeApp() {
    console.log('DOM content loaded. Starting initialization.');
    try {
        // Dynamically load all script modules
        const modules = [
            'state.js', 'utils.js', 'api.js', 'animations.js', 
            'memo.js', 'calendar.js', 'dashboard.js', 'ui.js', 'todo-controller.js'
        ];

        for (const module of modules) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = `scripts/${module}`;
                script.onload = () => {
                    console.log(`${module} loaded.`);
                    resolve();
                };
                script.onerror = () => {
                    console.error(`Failed to load ${module}.`);
                    reject(new Error(`Script load error for ${module}`));
                };
                document.head.appendChild(script);
            });
        }

        console.log('All modules loaded. Initializing application logic.');

        // Initialize controllers
        window.calendarController = new CalendarController();
        window.calendarController.init();
        console.log('Calendar controller initialized.');

        // Initialize dashboard controller
        window.dashboardController.init();
        console.log('Dashboard controller initialized.');

        // Initialize the main controller and load data
        await window.todoController.loadTodos();
        console.log('Todos loaded.');

        // Set up event listeners
        const hateInput = document.getElementById('hateInput');
        if (hateInput) {
            hateInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addHate();
                }
            });
            console.log('Hate input event listener set up.');
        }

        const calendarBtn = document.getElementById('calendarBtn');
        if (calendarBtn) {
            calendarBtn.addEventListener('click', () => {
                window.calendarController.openCalendar();
            });
            console.log('Calendar button event listener set up.');
        }
        
        // Initialize settings controller
        if (window.settingsController) {
            await window.settingsController.init();
        }
        
        console.log('Application initialized successfully');

    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
}

// Start the application when DOM is loaded
window.addEventListener('DOMContentLoaded', initializeApp);

// 너무 작은 크기일 때 사용자에게 알림 (부드러운 UX)
let warningShown = false;
window.addEventListener('resize', () => {
    if (window.innerWidth < 200 && !warningShown) {
        warningShown = true;
        // 3초 후에 다시 경고 가능하도록
        setTimeout(() => { warningShown = false; }, 3000);
        
        // 부드러운 알림 표시 (선택사항)
        console.log('💡 더 나은 사용 경험을 위해 창을 조금 더 넓게 해주세요!');
    }
});

// Hate options menu functions
function toggleHateOptionsMenu(id) {
    const menu = document.getElementById(`hate-options-${id}`);
    const allMenus = document.querySelectorAll('.hate-options-menu');
    const allItems = document.querySelectorAll('.hate-item');
    
    // Close all other menus first and remove menu-open class
    allMenus.forEach(m => {
        if (m.id !== `hate-options-${id}`) {
            m.style.display = 'none';
        }
    });
    
    // Remove menu-open class from all items
    allItems.forEach(item => {
        item.classList.remove('menu-open');
    });
    
    // Toggle current menu
    if (menu) {
        const isVisible = menu.style.display === 'block';
        menu.style.display = isVisible ? 'none' : 'block';
        
        // Add/remove menu-open class to current item
        const currentItem = menu.closest('.hate-item');
        if (currentItem) {
            if (isVisible) {
                currentItem.classList.remove('menu-open');
            } else {
                currentItem.classList.add('menu-open');
            }
        }
    }
}

function hideHateOptionsMenu(id) {
    const menu = document.getElementById(`hate-options-${id}`);
    if (menu) {
        menu.style.display = 'none';
        
        // Remove menu-open class from the item
        const currentItem = menu.closest('.hate-item');
        if (currentItem) {
            currentItem.classList.remove('menu-open');
        }
    }
}

// Close menus when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('.hate-options-container')) {
        const allMenus = document.querySelectorAll('.hate-options-menu');
        const allItems = document.querySelectorAll('.hate-item');
        
        allMenus.forEach(menu => {
            menu.style.display = 'none';
        });
        
        // Remove menu-open class from all items
        allItems.forEach(item => {
            item.classList.remove('menu-open');
        });
    }
});

// Settings operations
function openSettings() {
    window.settingsController.openSettings();
}

function closeSettings() {
    window.settingsController.closeSettings();
}

// === SETTINGS CONTROLLER ===
window.settingsController = {
    modal: null,
    opacitySlider: null,
    opacityValue: null,
    alwaysOnTopToggle: null,
    
    async init() {
        this.modal = document.getElementById('settings-modal');
        this.opacitySlider = document.getElementById('opacity-slider');
        this.opacityValue = document.getElementById('opacity-value');
        this.alwaysOnTopToggle = document.getElementById('always-on-top-toggle');
        
        // Load current settings
        await this.loadSettings();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('Settings controller initialized');
    },
    
    async loadSettings() {
        try {
            const settings = await window.windowAPI.getWindowSettings();
            
            // Set opacity slider and display value
            this.opacitySlider.value = Math.round(settings.opacity * 100);
            this.opacityValue.textContent = Math.round(settings.opacity * 100) + '%';
            
            // Set always on top toggle
            this.alwaysOnTopToggle.checked = settings.alwaysOnTop;
            
            console.log('Settings loaded:', settings);
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    },
    
    setupEventListeners() {
        // Close button
        const closeBtn = document.getElementById('close-settings-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeSettings());
        }
        
        // Opacity slider
        if (this.opacitySlider) {
            this.opacitySlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.opacityValue.textContent = value + '%';
                this.setOpacity(value / 100);
            });
        }
        
        // Always on top toggle
        if (this.alwaysOnTopToggle) {
            this.alwaysOnTopToggle.addEventListener('change', (e) => {
                this.toggleAlwaysOnTop(e.target.checked);
            });
        }
        
        // Close modal when clicking outside
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeSettings();
                }
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.modal && this.modal.classList.contains('show')) {
                if (e.key === 'Escape') {
                    this.closeSettings();
                }
            }
        });
    },
    
    async openSettings() {
        if (!this.modal) return;
        
        // Reload settings before opening
        await this.loadSettings();
        
        this.modal.style.display = 'flex';
        setTimeout(() => {
            this.modal.classList.add('show');
        }, 10);
        
        console.log('Settings modal opened');
    },
    
    closeSettings() {
        if (!this.modal) return;
        
        this.modal.classList.remove('show');
        setTimeout(() => {
            this.modal.style.display = 'none';
        }, 300);
        
        console.log('Settings modal closed');
    },
    
    async setOpacity(opacity) {
        try {
            await window.windowAPI.setOpacity(opacity);
            console.log(`Opacity set to ${opacity}`);
        } catch (error) {
            console.error('Failed to set opacity:', error);
            
            // Reset slider on error
            const settings = await window.windowAPI.getWindowSettings();
            this.opacitySlider.value = Math.round(settings.opacity * 100);
            this.opacityValue.textContent = Math.round(settings.opacity * 100) + '%';
        }
    },
    
    async toggleAlwaysOnTop(alwaysOnTop) {
        try {
            await window.windowAPI.toggleAlwaysOnTop(alwaysOnTop);
            console.log(`Always on top ${alwaysOnTop ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Failed to toggle always on top:', error);
            
            // Reset toggle on error
            const settings = await window.windowAPI.getWindowSettings();
            this.alwaysOnTopToggle.checked = settings.alwaysOnTop;
        }
    }
};

