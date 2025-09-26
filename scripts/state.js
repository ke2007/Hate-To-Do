// Application State Management
class AppState {
    constructor() {
        this.todos = [];
        this.currentScreen = 'hate';
        this.hasSeenTransform = false;
        this.nextPriority = 1;
        this.selectedDate = new Date().toISOString().split('T')[0];
        this.showAll = false;
        this.consecutiveCompletions = 0;
        this.completionTimer = null;
    }

    // State getters
    getTodos() {
        return this.todos;
    }

    getCurrentScreen() {
        return this.currentScreen;
    }

    getSelectedDate() {
        return this.selectedDate;
    }

    isShowingAll() {
        return this.showAll;
    }

    getNextPriority() {
        // 완룼되지 않은 일들의 최대 우선순위 + 1
        const incompleteTodos = this.todos.filter(t => !t.completed && t.priority);
        const maxPriority = Math.max(...incompleteTodos.map(t => t.priority), 0);
        return maxPriority + 1;
    }

    getConsecutiveCompletions() {
        return this.consecutiveCompletions;
    }

    // State setters
    setTodos(todos) {
        this.todos = todos;
        // Recalculate next priority - 완료되지 않은 일만 고려
        const incompletePriorizedTodos = todos.filter(t => t.priority && !t.completed).sort((a, b) => a.priority - b.priority);
        this.nextPriority = incompletePriorizedTodos.length + 1;
    }

    setCurrentScreen(screen) {
        this.currentScreen = screen;
    }

    setSelectedDate(date) {
        this.selectedDate = date;
    }

    setShowAll(showAll) {
        this.showAll = showAll;
    }

    setHasSeenTransform(seen) {
        this.hasSeenTransform = seen;
    }

    incrementConsecutiveCompletions() {
        this.consecutiveCompletions++;
        return this.consecutiveCompletions;
    }

    resetConsecutiveCompletions() {
        this.consecutiveCompletions = 0;
        if (this.completionTimer) {
            clearTimeout(this.completionTimer);
            this.completionTimer = null;
        }
    }

    setCompletionTimer(timer) {
        this.completionTimer = timer;
    }

    hasSeenTransformAnimation() {
        return this.hasSeenTransform;
    }
}

// Create and export global state instance
window.appState = new AppState();