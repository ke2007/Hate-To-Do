// Utility functions for date formatting and common operations

class DateUtils {
    // 날짜 포맷팅
    static formatDate(dateStr) {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (dateStr === today.toISOString().split('T')[0]) return '오늘';
        if (dateStr === yesterday.toISOString().split('T')[0]) return '어제';
        if (dateStr === tomorrow.toISOString().split('T')[0]) return '내일';

        // 350px 모드에서는 간단한 형식으로 표시 (너비 또는 높이 기준)
        if (window.innerWidth <= 350 || window.innerHeight <= 350) {
            const year = date.getFullYear().toString().substr(-2);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}.${month}.${day}`;
        }

        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekDay = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

        return `${year}년 ${month}월 ${day}일 (${weekDay})`;
    }

    // 간단한 날짜 포맷팅 (하기 싫은 일 목록용)
    static formatSimpleDate(dateStr) {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (dateStr === today.toISOString().split('T')[0]) return '오늘';
        if (dateStr === yesterday.toISOString().split('T')[0]) return '어제';

        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        // 올해인지 확인
        if (date.getFullYear() === today.getFullYear()) {
            return `${month}/${day}`;
        } else {
            return `${date.getFullYear()}/${month}/${day}`;
        }
    }
}

class UIUtils {
    // 커스텀 팝업 표시
    static showCustomConfirm(message, onConfirm) {
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';

        overlay.innerHTML = `
        <div class="popup">
            <h3>🗑️ 삭제 확인</h3>
            <p>${message}</p>
            <div class="popup-buttons">
                <button class="popup-btn cancel" onclick="closePopup()">취소</button>
                <button class="popup-btn confirm" onclick="confirmAction()">삭제</button>
            </div>
        </div>
    `;

        document.body.appendChild(overlay);

        // 전역 함수로 정의 (팝업 내에서 호출하기 위해)
        window.closePopup = function() {
            overlay.remove();
            delete window.closePopup;
            delete window.confirmAction;
        };

        window.confirmAction = function() {
            overlay.remove();
            onConfirm();
            delete window.closePopup;
            delete window.confirmAction;
        };

        // 오버레이 클릭 시 닫기
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                window.closePopup();
            }
        });
    }

    // HTML 이스케이프 처리
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export utilities globally
window.DateUtils = DateUtils;
window.UIUtils = UIUtils;