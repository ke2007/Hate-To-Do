// Calendar Controller using FullCalendar (Modal version)

class CalendarController {
    constructor() {
        this.calendar = null;
        this.isOpen = false;
        this.modal = document.getElementById('calendar-modal');
        this.closeBtn = document.getElementById('close-calendar-btn');
        this.calendarEl = document.getElementById('calendar');
    }

    init() {
        console.log('Calendar: Initializing calendar controller');
        
        if (!this.modal || !this.closeBtn || !this.calendarEl) {
            console.error('Calendar modal elements not found:', {
                modal: !!this.modal,
                closeBtn: !!this.closeBtn,
                calendarEl: !!this.calendarEl
            });
            return;
        }

        console.log('Calendar: All DOM elements found, setting up event listeners');
        
        this.closeBtn.addEventListener('click', () => this.closeCalendar());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeCalendar();
            }
        });

        if (typeof FullCalendar === 'undefined') {
            console.error('Calendar: FullCalendar library not loaded');
            return;
        }

        console.log('Calendar: Creating FullCalendar instance');
        this.calendar = new FullCalendar.Calendar(this.calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'ko',
            height: 'auto',
            contentHeight: 'auto',
            aspectRatio: 1.35,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,listWeek'
            },
            events: this.getTodoEvents.bind(this),
            dateClick: this.handleDateClick.bind(this),
            eventClick: (info) => {
                info.jsEvent.preventDefault(); // 이벤트 클릭 방지
            }
        });

        console.log('Calendar: Rendering calendar');
        this.calendar.render();
        console.log('Calendar: Calendar rendered successfully');
    }

    openCalendar() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            // 약간의 지연 후 show 클래스 추가로 애니메이션 효과
            setTimeout(() => {
                this.modal.classList.add('show');
            }, 10);
            this.isOpen = true;
            this.calendar.refetchEvents();
        }
    }

    closeCalendar() {
        if (this.modal) {
            this.modal.classList.remove('show');
            // 애니메이션 완료 후 모달 숨김
            setTimeout(() => {
                this.modal.style.display = 'none';
            }, 300);
            this.isOpen = false;
        }
    }

    getTodoEvents(fetchInfo, successCallback, failureCallback) {
        try {
            const todos = window.appState.getTodos();
            console.log('Calendar: Loading todos for calendar:', todos);

            const events = [];
            todos.forEach(todo => {
                const todoDate = todo.date || new Date().toISOString().split('T')[0];
                let endDate = todoDate;

                if(todo.dueDate){
                    const dueDate = new Date(todo.dueDate);
                    dueDate.setDate(dueDate.getDate() + 1);
                    endDate = dueDate.toISOString().split('T')[0];
                }

                events.push({
                    id: `todo-${todo.id}`,
                    title: `${todo.text}`,
                    start: todoDate,
                    end: endDate,
                    classNames: todo.completed ? ['completed-event'] : ['todo-event'],
                    backgroundColor: todo.completed ? '#a5d6a7' : '#667eea',
                    borderColor: todo.completed ? '#a5d6a7' : '#667eea'
                });
            });
            
            console.log('Calendar: Total events created:', events.length);
            successCallback(events);
        } catch (error) {
            console.error('Error fetching todo events:', error);
            failureCallback(error);
        }
    }

    handleDateClick(info) {
        window.todoController.selectDate(info.dateStr);
        this.closeCalendar();
    }
}
