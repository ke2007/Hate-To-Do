// Main TODO controller for business logic

class TodoController {
    constructor() {
        this.isEditingTodo = null;
    }

    // 초기 로드
    async loadTodos() {
        try {
            await window.todoApiClient.loadTodos();
            window.uiController.renderHateList();
            window.uiController.renderTodoList();
            window.uiController.updateDateDisplay();
        } catch (error) {
            console.error('Failed to load todos:', error);
        }
    }

    // 하기 싫은 일 추가
    async addHate() {
        const input = document.getElementById('hateInput');
        if (!input) return;
        
        const text = input.value.trim();
        if (!text) return;

        try {
            await window.todoApiClient.addTodo(text);
            input.value = '';
            window.uiController.renderHateList();
            window.uiController.renderTodoList();
        } catch (error) {
            console.error('Failed to add hate:', error);
        }
    }

    // 우선순위 설정
    async setPriority(id) {
        const todos = window.appState.getTodos();
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        try {
            if (todo.priority) {
                // 이미 우선순위가 있으면 제거
                const removedPriority = todo.priority;
                await window.todoApiClient.setPriority(id, null);

                // 제거된 우선순위보다 높은 것들을 하나씩 낮춤
                const currentTodos = window.appState.getTodos();
                for (const t of currentTodos) {
                    if (t.priority && t.priority > removedPriority && !t.completed) {
                        await window.todoApiClient.setPriority(t.id, t.priority - 1);
                    }
                }

                // 다시 로드하여 상태 동기화
                await window.todoApiClient.loadTodos();
            } else {
                // 우선순위 추가
                const nextPriority = window.appState.getNextPriority();
                await window.todoApiClient.setPriority(id, nextPriority);
            }

            window.uiController.renderHateList();
            window.uiController.renderTodoList();
        } catch (error) {
            console.error('Failed to set priority:', error);
        }
    }

    // 하기 싫은 일 삭제
    async deleteHate(id) {
        const todos = window.appState.getTodos();
        const todo = todos.find(t => t.id === id);
        
        try {
            if (todo && todo.priority) {
                // 삭제된 항목의 우선순위보다 높은 것들을 하나씩 낮춤
                const removedPriority = todo.priority;
                await window.todoApiClient.deleteTodo(id);

                const currentTodos = window.appState.getTodos();
                for (const t of currentTodos) {
                    if (t.priority && t.priority > removedPriority && !t.completed) {
                        await window.todoApiClient.setPriority(t.id, t.priority - 1);
                    }
                }

                // 다시 로드하여 상태 동기화
                await window.todoApiClient.loadTodos();
            } else {
                await window.todoApiClient.deleteTodo(id);
            }

            window.uiController.renderHateList();
            window.uiController.renderTodoList();
        } catch (error) {
            console.error('Failed to delete hate:', error);
        }
    }

    // 하기 싫은 일 수정 시작
    startEditHate(id) {
        const todos = window.appState.getTodos();
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        const hateItem = document.querySelector(`[onclick*="todoController.setPriority(${id})"]`);
        if (!hateItem) return;

        // 이미 편집 중인 다른 항목이 있으면 취소
        if (this.isEditingTodo && this.isEditingTodo !== id) {
            this.cancelEditHate(this.isEditingTodo);
        }

        this.isEditingTodo = id;

        // 편집 상태로 변경
        hateItem.classList.add('editing');
        hateItem.onclick = null; // 우선순위 설정 비활성화

        const hateTextContainer = hateItem.querySelector('.hate-text-container');
        const hateText = hateTextContainer.querySelector('.hate-text');
        const originalText = hateText.textContent;
        const dateElement = hateTextContainer.querySelector('.hate-date');
        const dateText = dateElement.textContent;

        // 원본 텍스트를 데이터 속성에 저장
        hateItem.setAttribute('data-original-text', originalText);

        // 입력 필드로 교체 (날짜는 그대로 유지)
        hateTextContainer.innerHTML = `
            <input type="text" class="hate-edit-input" value="${originalText.replace(/"/g, '&quot;')}" spellcheck="false" autocomplete="off" onkeydown="todoController.handleEditKeydown(event, ${id})" onfocus="this.select()">
            <span class="hate-date">${dateText}</span>
        `;

        // 액션 버튼들을 저장/취소 버튼으로 교체
        const actions = hateItem.querySelector('.hate-item-actions');
        actions.innerHTML = `
            <div class="hate-edit-actions">
                <button class="hate-edit-save" onclick="todoController.saveEditHate(${id})" title="저장">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                </button>
                <button class="hate-edit-cancel" onclick="todoController.cancelEditHate(${id})" title="취소">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `;

        // 입력 필드에 포커스
        const input = hateItem.querySelector('.hate-edit-input');
        if (input) {
            input.focus();
        }
    }

    // 수정 키보드 이벤트 처리
    handleEditKeydown(event, id) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.saveEditHate(id);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            this.cancelEditHate(id);
        }
    }

    // 하기 싫은 일 수정 저장
    async saveEditHate(id) {
        const hateItem = document.querySelector('.hate-item.editing');
        if (!hateItem) return;

        const input = hateItem.querySelector('.hate-edit-input');
        if (!input) return;
        
        const newText = input.value.trim();

        if (!newText) {
            // 빈 텍스트면 취소
            this.cancelEditHate(id);
            return;
        }

        try {
            await window.todoApiClient.updateTodo(id, newText);
            this.isEditingTodo = null;
            window.uiController.renderHateList();
            window.uiController.renderTodoList();
        } catch (error) {
            console.error('수정 저장 실패:', error);
            this.cancelEditHate(id);
        }
    }

    // 하기 싫은 일 수정 취소
    cancelEditHate(id) {
        this.isEditingTodo = null;
        window.uiController.renderHateList();
    }

    // 종료일 설정
    async setDueDate(id, dueDate) {
        try {
            // 빈 문자열인 경우 null로 처리
            const dateValue = dueDate === '' ? null : dueDate;
            
            // 과거 날짜 검증
            if (dateValue) {
                const selectedDate = new Date(dateValue);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정하여 날짜만 비교
                
                if (selectedDate < today) {
                    alert('⚠️ 과거 날짜는 종료일로 설정할 수 없습니다.\n오늘 이후의 날짜를 선택해주세요.');
                    // UI 복원
                    window.uiController.renderHateList();
                    return;
                }
            }
            
            await window.todoApiClient.setDueDate(id, dateValue);
            
            // UI 업데이트
            window.uiController.renderHateList();
            window.uiController.renderTodoList();
            
            // 캘린더가 열려있다면 이벤트 새로고침
            if (window.calendarController && window.calendarController.isOpen) {
                window.calendarController.calendar.refetchEvents();
            }
            
            console.log(`Due date ${dateValue ? 'set to ' + dateValue : 'cleared'} for todo ID: ${id}`);
        } catch (error) {
            console.error('Failed to set due date:', error);
            // 에러 발생 시 UI 복원
            window.uiController.renderHateList();
        }
    }

    // 날짜 선택기 열기
    openDatePicker(todoId) {
        const selector = event.target.closest('.due-date-selector');
        if (!selector) return;

        const hiddenInput = selector.querySelector('.hidden-date-input');
        if (hiddenInput) {
            hiddenInput.click();
        }
    }

    // TODO 토글
    async toggleTodo(id) {
        const todos = window.appState.getTodos();
        const todo = todos.find(t => t.id === id);
        const wasCompleted = todo?.completed;
        
        try {
            await window.todoApiClient.toggleTodo(id);
            window.uiController.renderTodoList();

            // 완료 시 연속 완료 처리
            const updatedTodos = window.appState.getTodos();
            const updatedTodo = updatedTodos.find(t => t.id === id);
            
            if (!wasCompleted && updatedTodo?.completed) {
                this.handleConsecutiveCompletion();
            } else if (wasCompleted && !updatedTodo?.completed) {
                // 완료 해제 시 연속 완료 초기화
                this.resetConsecutiveCompletions();
            }
        } catch (error) {
            console.error('Failed to toggle todo:', error);
        }
    }

    // 연속 완료 처리
    handleConsecutiveCompletion() {
        const count = window.appState.incrementConsecutiveCompletions();
        
        // 기존 타이머가 있으면 취소
        const existingTimer = window.appState.completionTimer;
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        // 8개 이하일 때만 축하 표시
        if (count <= 8) {
            window.animationController.showEnhancedCelebration(count);
        }

        // 3초 후 연속 완료 초기화
        const timer = setTimeout(() => {
            this.resetConsecutiveCompletions();
        }, 3000);
        
        window.appState.setCompletionTimer(timer);
    }

    // 연속 완료 초기화
    resetConsecutiveCompletions() {
        window.appState.resetConsecutiveCompletions();
    }

    // 날짜 변경
    changeDate(direction) {
        window.appState.setShowAll(false);
        const currentDate = new Date(window.appState.getSelectedDate());
        currentDate.setDate(currentDate.getDate() + direction);
        const newDate = currentDate.toISOString().split('T')[0];
        
        window.appState.setSelectedDate(newDate);
        window.uiController.updateDateDisplay();
        window.uiController.renderTodoList();
    }

    // 특정 날짜 선택 (캘린더에서 사용)
    selectDate(dateString) {
        window.appState.setShowAll(false);
        window.appState.setSelectedDate(dateString);
        window.uiController.updateDateDisplay();
        window.uiController.renderTodoList();
    }

    // 전체 보기
    showAllDates() {
        const showAll = !window.appState.isShowingAll();
        window.appState.setShowAll(showAll);
        
        const showAllBtn = document.getElementById('showAllBtn');
        if (showAllBtn) {
            showAllBtn.classList.toggle('active', showAll);
        }
        
        window.uiController.updateDateDisplay();
        window.uiController.renderTodoList();
    }

    // 화면 전환
    switchScreen() {
        // 화면 전환 시 먼저 데이터 다시 로드
        this.loadTodos();
        
        // 화면 전환 시 연속 완료 초기화
        this.resetConsecutiveCompletions();
        
        const currentScreen = window.appState.getCurrentScreen();
        
        if (currentScreen === 'hate') {
            // 첫 전환 시 애니메이션 효과
            if (!window.appState.hasSeenTransformAnimation()) {
                window.animationController.showTransformAnimation();
                window.appState.setHasSeenTransform(true);
            }

            window.appState.setCurrentScreen('todo');
        } else {
            window.appState.setCurrentScreen('hate');
        }
        
        window.uiController.updateScreenUI();
    }

    // 일괄 삭제
    async clearAllWithConfirm() {
        const currentScreen = window.appState.getCurrentScreen();
        const message = currentScreen === 'hate'
            ? '모든 하기 싫은 일을 삭제하시겠습니까?'
            : '모든 TODO를 삭제하시겠습니까?';

        UIUtils.showCustomConfirm(message, async () => {
            try {
                await window.todoApiClient.clearAll();
                window.uiController.renderHateList();
                window.uiController.renderTodoList();

                // 포커스 복원
                setTimeout(() => {
                    if (currentScreen === 'hate') {
                        const input = document.getElementById('hateInput');
                        if (input) input.focus();
                    }
                }, 100);
            } catch (error) {
                console.error('Failed to clear all:', error);
            }
        });
    }
}

// Export todo controller globally
window.todoController = new TodoController();