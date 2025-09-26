// UI Controller for rendering and managing the user interface

class UIController {
    constructor() {
        // Bind methods to ensure proper 'this' context
        this.renderHateList = this.renderHateList.bind(this);
        this.renderTodoList = this.renderTodoList.bind(this);
    }

    // 하기 싫은 일 목록 렌더링
    renderHateList() {
        const hateList = document.getElementById('hateList');
        const emptyState = document.getElementById('hateEmptyState');
        const hateFooter = document.getElementById('hateFooter');
        const hateCount = document.getElementById('hateCount');

        const todos = window.appState.getTodos();
        const incompleteTodos = todos.filter(t => !t.completed);

        if (incompleteTodos.length === 0) {
            hateList.style.display = 'none';
            emptyState.style.display = 'block';
            hateFooter.style.display = 'none';
            return;
        }

        hateList.style.display = 'block';
        emptyState.style.display = 'none';
        hateFooter.style.display = 'flex';
        hateCount.textContent = incompleteTodos.length;

        hateList.innerHTML = incompleteTodos.map(todo => {
            const dateToShow = todo.date || new Date().toISOString().split('T')[0];
            const hasMemo = todo.memo && todo.memo.trim();
            const escapedText = UIUtils.escapeHtml(todo.text);
            
            return `
                <li class="hate-item ${todo.priority ? 'prioritized' : ''} ${hasMemo ? 'has-memo' : ''}" onclick="todoController.setPriority(${todo.id})" onmouseenter="${hasMemo ? `memoController.showMemoPreview(event, ${todo.id})` : ''}" onmouseleave="${hasMemo ? 'memoController.hideMemoPreview()' : ''}">
                    <div class="hate-item-content">
                        ${todo.priority ? `<span class="priority-badge">${todo.priority}</span>` : ''}
                        <div class="hate-text-container">
                            <span class="hate-text">${escapedText}</span>
                            <div class="hate-dates">
                                <span class="hate-date created">등록: ${DateUtils.formatSimpleDate(dateToShow)}</span>
                                <div class="due-date-container">
                                    <label class="due-date-label">종료:</label>
                                    <input type="date" class="due-date-input" value="${todo.dueDate || ''}" 
                                           style="width: 130px; font-size: 12px;"
                                           onchange="event.stopPropagation(); todoController.setDueDate(${todo.id}, this.value)"
                                           onclick="event.stopPropagation(); try { if (this.showPicker) this.showPicker(); else this.focus(); } catch(e) { this.focus(); }"
                                           title="클릭하여 종료일 설정 (오늘 이후 날짜만 가능)">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="hate-item-actions">
                        <div class="hate-options-container">
                            <button class="hate-options-btn ${hasMemo ? 'has-memo' : ''}" onclick="event.stopPropagation(); toggleHateOptionsMenu(${todo.id})" title="옵션">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="3"></circle>
                                    <path d="m19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.79z"></path>
                                </svg>
                                ${hasMemo ? '<div class="memo-indicator"></div>' : ''}
                            </button>
                            <div class="hate-options-menu" id="hate-options-${todo.id}" style="display: none;">
                                <button class="menu-item memo-item" onclick="event.stopPropagation(); memoController.openMemoModal(${todo.id}); hideHateOptionsMenu(${todo.id})">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14,2 14,8 20,8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                    </svg>
                                    ${hasMemo ? '메모 수정' : '메모 추가'}
                                </button>
                                <button class="menu-item edit-item" onclick="event.stopPropagation(); todoController.startEditHate(${todo.id}); hideHateOptionsMenu(${todo.id})">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="m18 2 4 4-16 16H2v-4L18 2z"></path>
                                    </svg>
                                    텍스트 수정
                                </button>
                                <button class="menu-item delete-item" onclick="event.stopPropagation(); todoController.deleteHate(${todo.id}); hideHateOptionsMenu(${todo.id})">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3,6 5,6 21,6"></polyline>
                                        <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                    </svg>
                                    삭제
                                </button>
                            </div>
                        </div>
                    </div>
                </li>
            `;
        }).join('');
    }

    // TODO 리스트 렌더링
    renderTodoList() {
        const container = document.getElementById('todoListContainer');
        const emptyState = document.getElementById('todoEmptyState');
        const todoFooter = document.getElementById('todoFooter');

        const todos = window.appState.getTodos();
        const selectedDate = window.appState.getSelectedDate();
        const showAll = window.appState.isShowingAll();

        // 날짜별로 필터링
        let filteredTodos = todos;
        if (!showAll) {
            filteredTodos = todos.filter(t => t.date === selectedDate);
        }

        if (filteredTodos.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            todoFooter.style.display = 'none';
            return;
        }

        emptyState.style.display = 'none';
        todoFooter.style.display = 'flex';

        if (showAll) {
            // 날짜별로 그룹화
            const groupedTodos = {};
            filteredTodos.forEach(todo => {
                const date = todo.date || new Date().toISOString().split('T')[0];
                if (!groupedTodos[date]) {
                    groupedTodos[date] = [];
                }
                groupedTodos[date].push(todo);
            });

            // 날짜 순으로 정렬
            const sortedDates = Object.keys(groupedTodos).sort((a, b) => new Date(b) - new Date(a));

            container.innerHTML = sortedDates.map(date => {
                const dateTodos = groupedTodos[date];
                const sortedTodos = this.sortTodos(dateTodos);
                const incompleteTodos = dateTodos.filter(t => !t.completed).length;

                return `
                    <div class="date-group">
                        <div class="date-header">
                            <span>${DateUtils.formatDate(date)}</span>
                            <span class="date-count">${incompleteTodos}/${dateTodos.length} 남음</span>
                        </div>
                        <ul class="todo-list">
                            ${sortedTodos.map(todo => this.createTodoItem(todo)).join('')}
                        </ul>
                    </div>
                `;
            }).join('');
        } else {
            // 단일 날짜
            const sortedTodos = this.sortTodos(filteredTodos);
            container.innerHTML = `
                <ul class="todo-list">
                    ${sortedTodos.map(todo => this.createTodoItem(todo)).join('')}
                </ul>
            `;
        }
    }

    // TODO 정렬
    sortTodos(todoList) {
        return [...todoList].sort((a, b) => {
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;

            if (!a.completed && !b.completed) {
                if (a.priority && !b.priority) return -1;
                if (!a.priority && b.priority) return 1;
                if (a.priority && b.priority) return a.priority - b.priority;
            }

            return 0;
        });
    }

    // TODO 아이템 생성
    createTodoItem(todo) {
        const hasMemo = todo.memo && todo.memo.trim();
        const escapedText = UIUtils.escapeHtml(todo.text);
        const escapedMemo = hasMemo ? UIUtils.escapeHtml(todo.memo.substring(0, 30) + (todo.memo.length > 30 ? '...' : '')) : '';
        
        return `
            <li class="todo-item ${todo.completed ? 'completed' : ''}" onclick="todoController.toggleTodo(${todo.id})">
                <div class="checkbox ${todo.completed ? 'checked' : ''}"></div>
                <span class="todo-text">${escapedText}</span>
                ${!todo.completed && todo.priority ? `<span class="todo-priority">${todo.priority}순위</span>` : ''}
                ${hasMemo ? `<span class="todo-memo-indicator" title="메모: ${escapedMemo}" onclick="event.stopPropagation(); memoController.viewMemoModal(${todo.id})">📝</span>` : ''}
            </li>
        `;
    }

    // 날짜 표시 업데이트
    updateDateDisplay() {
        const dateElement = document.getElementById('currentDate');
        if (!dateElement) return;
        
        const showAll = window.appState.isShowingAll();
        const selectedDate = window.appState.getSelectedDate();
        
        if (showAll) {
            dateElement.textContent = '전체 기간';
        } else {
            dateElement.textContent = DateUtils.formatDate(selectedDate);
        }
    }

    // 화면 전환 UI 업데이트
    updateScreenUI() {
        const hateScreen = document.getElementById('hateScreen');
        const todoScreen = document.getElementById('todoScreen');
        const switchBtn = document.getElementById('switchBtn');
        const currentScreen = window.appState.getCurrentScreen();

        if (currentScreen === 'hate') {
            hateScreen.classList.remove('hidden');
            todoScreen.classList.add('hidden');
            switchBtn.textContent = '리스트 보기';
        } else {
            hateScreen.classList.add('hidden');
            todoScreen.classList.remove('hidden');
            switchBtn.textContent = '하기 싫은 일 보기 😫';
        }
    }
}

// Export UI controller globally
window.uiController = new UIController();