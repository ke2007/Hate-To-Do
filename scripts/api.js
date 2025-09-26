// API layer for communicating with Electron main process

class TodoAPI {
    // 초기 로드
    async loadTodos() {
        try {
            const todos = await window.todoAPI.getTodos();
            window.appState.setTodos(todos);
            return todos;
        } catch (error) {
            console.error('Failed to load todos:', error);
            return [];
        }
    }

    // 하기 싫은 일 추가
    async addTodo(text) {
        try {
            const todos = await window.todoAPI.addTodo(text);
            
            // 기존 데이터 마이그레이션 (date 필드가 없는 경우)
            const today = new Date().toISOString().split('T')[0];
            const migratedTodos = todos.map(todo => {
                if (!todo.date) {
                    todo.date = today;
                }
                return todo;
            });

            window.appState.setTodos(migratedTodos);
            return migratedTodos;
        } catch (error) {
            console.error('Failed to add todo:', error);
            throw error;
        }
    }

    // TODO 토글
    async toggleTodo(id) {
        try {
            const todos = await window.todoAPI.toggleTodo(id);
            window.appState.setTodos(todos);
            return todos;
        } catch (error) {
            console.error('Failed to toggle todo:', error);
            throw error;
        }
    }

    // TODO 삭제
    async deleteTodo(id) {
        try {
            const todos = await window.todoAPI.deleteTodo(id);
            window.appState.setTodos(todos);
            return todos;
        } catch (error) {
            console.error('Failed to delete todo:', error);
            throw error;
        }
    }

    // TODO 수정
    async updateTodo(id, newText) {
        try {
            const todos = await window.todoAPI.updateTodo(id, newText);
            window.appState.setTodos(todos);
            return todos;
        } catch (error) {
            console.error('Failed to update todo:', error);
            throw error;
        }
    }

    // 우선순위 설정
    async setPriority(id, priority) {
        try {
            const todos = await window.todoAPI.setPriority(id, priority);
            window.appState.setTodos(todos);
            return todos;
        } catch (error) {
            console.error('Failed to set priority:', error);
            throw error;
        }
    }

    // 메모 설정
    async setMemo(id, memo) {
        try {
            const todos = await window.todoAPI.setMemo(id, memo);
            window.appState.setTodos(todos);
            return todos;
        } catch (error) {
            console.error('Failed to set memo:', error);
            throw error;
        }
    }

    // 메모 삭제
    async deleteMemo(id) {
        try {
            const todos = await window.todoAPI.deleteMemo(id);
            window.appState.setTodos(todos);
            return todos;
        } catch (error) {
            console.error('Failed to delete memo:', error);
            throw error;
        }
    }

    // 종료일 설정
    async setDueDate(id, dueDate) {
        try {
            const todos = await window.todoAPI.setDueDate(id, dueDate);
            window.appState.setTodos(todos);
            return todos;
        } catch (error) {
            console.error('Failed to set due date:', error);
            throw error;
        }
    }

    // 모든 TODO 삭제
    async clearAll() {
        try {
            const todos = await window.todoAPI.clearAll();
            window.appState.setTodos(todos);
            return todos;
        } catch (error) {
            console.error('Failed to clear all todos:', error);
            throw error;
        }
    }
}

// Window controls
class WindowAPI {
    static minimize() {
        try {
            window.windowAPI.minimize();
        } catch (error) {
            console.error('Failed to minimize window:', error);
        }
    }

    static close() {
        try {
            window.windowAPI.close();
        } catch (error) {
            console.error('Failed to close window:', error);
        }
    }
}

// Export API instances globally
window.todoApiClient = new TodoAPI();
window.WindowAPI = WindowAPI;