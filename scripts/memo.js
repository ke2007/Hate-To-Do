// Memo functionality

class MemoController {
    constructor() {
        this.currentMemoModal = null;
        this.currentMemoPreview = null;
        this.previewHideTimer = null; // 타이머 추가
    }

    // 메모 모달 열기
    openMemoModal(id) {
        const todo = window.appState.getTodos().find(t => t.id === id);
        if (!todo) return;

        this.closeMemoModal(); // 기존 모달이 있으면 닫기

        const modal = document.createElement('div');
        modal.className = 'memo-modal';
        modal.innerHTML = `
            <div class="memo-content">
                <div class="memo-header">
                    <h3 class="memo-title">메모</h3>
                    <button class="memo-close" onclick="memoController.closeMemoModal()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <textarea 
                    class="memo-textarea" 
                    placeholder="메모를 입력하세요... (최대 300자)"
                    maxlength="300"
                    spellcheck="false"
                    autocomplete="off"
                    oninput="memoController.updateCharCount(this)"
                    onkeydown="memoController.handleMemoKeydown(event, ${id})"
                >${todo.memo || ''}</textarea>
                <div class="memo-char-count">
                    <span id="charCount">${(todo.memo || '').length}</span>/300
                </div>
                <div class="memo-buttons">
                    ${todo.memo ? `<button class="memo-btn delete" onclick="memoController.deleteMemo(${id})">삭제</button>` : ''}
                    <button class="memo-btn cancel" onclick="memoController.closeMemoModal()">취소</button>
                    <button class="memo-btn save" onclick="memoController.saveMemo(${id})">저장</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.currentMemoModal = modal;
        
        // 모달 외부 클릭 시 닫기
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeMemoModal();
            }
        });

        // textarea에 포커스
        const textarea = modal.querySelector('.memo-textarea');
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }

    // 완료된 TODO의 메모 보기 (읽기 전용)
    viewMemoModal(id) {
        const todo = window.appState.getTodos().find(t => t.id === id);
        if (!todo || !todo.memo) return;

        this.closeMemoModal(); // 기존 모달이 있으면 닫기

        const modal = document.createElement('div');
        modal.className = 'memo-modal';
        const modalTitle = todo.completed ? '메모 (완료된 항목)' : '메모 보기';
        modal.innerHTML = `
            <div class="memo-content">
                <div class="memo-header">
                    <h3 class="memo-title">${modalTitle}</h3>
                    <button class="memo-close" onclick="memoController.closeMemoModal()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border: 2px solid #e9ecef; font-size: 18px; line-height: 1.4; min-height: 80px;">
                    ${UIUtils.escapeHtml(todo.memo)}
                </div>
                <div class="memo-buttons" style="margin-top: 20px;">
                    <button class="memo-btn cancel" onclick="memoController.closeMemoModal()">닫기</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.currentMemoModal = modal;
        
        // 모달 외부 클릭 시 닫기
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeMemoModal();
            }
        });
    }

    // 메모 모달 닫기
    closeMemoModal() {
        if (this.currentMemoModal) {
            this.currentMemoModal.remove();
            this.currentMemoModal = null;
        }
    }

    // 글자 수 업데이트
    updateCharCount(textarea) {
        const charCount = document.getElementById('charCount');
        if (!charCount) return;
        
        const count = textarea.value.length;
        charCount.textContent = count;
        
        if (count >= 285) { // 300자의 95%
            charCount.parentElement.classList.add('warning');
        } else {
            charCount.parentElement.classList.remove('warning');
        }
    }

    // 메모 키보드 이벤트
    handleMemoKeydown(event, id) {
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            this.saveMemo(id);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            this.closeMemoModal();
        }
    }

    // 메모 저장
    async saveMemo(id) {
        const textarea = document.querySelector('.memo-textarea');
        if (!textarea) return;
        
        const memo = textarea.value.trim();

        try {
            if (memo) {
                await window.todoApiClient.setMemo(id, memo);
            } else {
                await window.todoApiClient.deleteMemo(id);
            }
            
            window.uiController.renderHateList();
            window.uiController.renderTodoList();
            this.closeMemoModal();
        } catch (error) {
            console.error('메모 저장 실패:', error);
        }
    }

    // 메모 삭제
    async deleteMemo(id) {
        try {
            await window.todoApiClient.deleteMemo(id);
            window.uiController.renderHateList();
            window.uiController.renderTodoList();
            this.closeMemoModal();
        } catch (error) {
            console.error('메모 삭제 실패:', error);
        }
    }

    // 메모 미리보기 표시 (리스트 카드 호버 시)
    showMemoPreview(event, todoId) {
        const todo = window.appState.getTodos().find(t => t.id === todoId);
        if (!todo || !todo.memo || !todo.memo.trim()) return;

        // 기존 숨김 타이머 취소
        if (this.previewHideTimer) {
            clearTimeout(this.previewHideTimer);
            this.previewHideTimer = null;
        }

        // 기존 미리보기 즉시 제거
        this.hidePreviewImmediately();

        // 새로운 미리보기 팝업 생성
        const preview = document.createElement('div');
        preview.className = 'memo-preview-popup';
        preview.innerHTML = `
            <div class="memo-preview-content">
                <div class="memo-preview-header">📝 "${UIUtils.escapeHtml(todo.text)}" 메모</div>
                <div class="memo-preview-text">${UIUtils.escapeHtml(todo.memo)}</div>
            </div>
        `;

        document.body.appendChild(preview);
        this.currentMemoPreview = preview;

        // 위치 계산 (화면 중앙 상단)
        preview.style.position = 'fixed';
        preview.style.top = '12%';
        preview.style.left = '50%';
        preview.style.transform = 'translateX(-50%)';
        preview.style.zIndex = '1500';

        // 애니메이션 효과
        setTimeout(() => {
            if (this.currentMemoPreview === preview) { // 현재 프리뷰가 맞는지 확인
                preview.classList.add('show');
            }
        }, 100);
    }

    // 메모 미리보기 숨김 (호버 아웃 시)
    hideMemoPreview() {
        if (this.previewHideTimer) {
            clearTimeout(this.previewHideTimer);
        }

        if (this.currentMemoPreview) {
            this.currentMemoPreview.classList.remove('show');
            this.previewHideTimer = setTimeout(() => {
                if (this.currentMemoPreview && this.currentMemoPreview.parentNode) {
                    this.currentMemoPreview.remove();
                    this.currentMemoPreview = null;
                }
                this.previewHideTimer = null;
            }, 300);
        }
    }

    // 미리보기 즉시 제거 (내부 사용)
    hidePreviewImmediately() {
        if (this.currentMemoPreview) {
            this.currentMemoPreview.remove();
            this.currentMemoPreview = null;
        }
        if (this.previewHideTimer) {
            clearTimeout(this.previewHideTimer);
            this.previewHideTimer = null;
        }
    }
}

// Export memo controller globally
window.memoController = new MemoController();