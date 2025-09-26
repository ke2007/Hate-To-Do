// Dashboard functionality

class DashboardController {
    constructor() {
        this.modal = null;
        this.closeBtn = null;
        this.currentPeriod = 'weekly'; // 'weekly' or 'monthly'
        this.currentWeek = this.getCurrentWeek();
        this.currentMonth = this.getCurrentMonth();
    }

    init() {
        this.modal = document.getElementById('dashboard-modal');
        this.closeBtn = document.getElementById('close-dashboard-btn');
        
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeDashboard());
        }
        
        // 모달 바깥 클릭시 닫기
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeDashboard();
                }
            });
        }

        // 기간 탭 이벤트 리스너
        this.setupPeriodTabs();
    }

    setupResizeListener() {
        // 리사이징 디바운스 함수
        let resizeTimeout;
        const resizeHandler = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log('Window resized, redrawing charts...');
                
                // 강제로 레이아웃 재계산
                const weeklyChart = document.querySelector('#weekly-chart');
                const monthlyChart = document.querySelector('#monthly-chart');
                
                if (weeklyChart) {
                    weeklyChart.style.width = '100%';
                }
                if (monthlyChart) {
                    monthlyChart.style.width = '100%';
                }
                
                // 짧은 지연 후 차트 다시 그리기
                setTimeout(() => {
                    this.updateStatistics();
                }, 50);
            }, 250);
        };

        // 리사이징 이벤트 리스너 추가
        window.addEventListener('resize', resizeHandler);
        
        // 모달이 닫힐 때 이벤트 리스너 제거
        const originalClose = this.closeDashboard.bind(this);
        this.closeDashboard = () => {
            window.removeEventListener('resize', resizeHandler);
            originalClose();
        };
    }

    openDashboard() {
        if (!this.modal) return;
        
        console.log('Opening dashboard...');
        console.log('Rough.js available:', typeof rough !== 'undefined');
        console.log('D3.js available:', typeof d3 !== 'undefined');
        
        // 통계 데이터 업데이트
        this.updateStatistics();
        
        // 모달 표시
        this.modal.style.display = 'flex';
        setTimeout(() => {
            this.modal.classList.add('show');
            // 리사이징 이벤트 리스너 추가
            this.setupResizeListener();
        }, 10);
    }

    closeDashboard() {
        if (!this.modal) return;
        
        this.modal.classList.remove('show');
        setTimeout(() => {
            this.modal.style.display = 'none';
        }, 300);
    }

    async updateStatistics() {
        try {
            console.log('Updating statistics for period:', this.currentPeriod);
            const todos = await window.todoAPI.getTodos();
            console.log('Retrieved todos:', todos);
            
            if (this.currentPeriod === 'weekly') {
                await this.updateWeeklyStats(todos);
            } else {
                await this.updateMonthlyStats(todos);
            }
            
        } catch (error) {
            console.error('Failed to update statistics:', error);
        }
    }

    async updateWeeklyStats(todos) {
        console.log('Updating weekly stats...');
        const weekData = this.getWeeklyData(todos, this.currentWeek);
        console.log('Week data:', weekData);
        
        // 주간 통계 카드 업데이트
        this.updateWeeklyStatsDOM(weekData);
        
        // 주간 차트 그리기
        this.drawWeeklyChart(weekData.chartData);
    }

    async updateMonthlyStats(todos) {
        const monthData = this.getMonthlyData(todos, this.currentMonth);
        
        // 월간 통계 카드 업데이트  
        this.updateMonthlyStatsDOM(monthData);
        
        // 월간 차트 그리기
        this.drawMonthlyChart(monthData.chartData);
    }

    // 유틸리티 함수들
    getCurrentWeek() {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek;
    }

    getCurrentMonth() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }

    getWeeklyData(todos, weekStart) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        // 이번 주 TODO들 필터링
        const weekTodos = todos.filter(todo => {
            // date 필드를 우선 사용 (YYYY-MM-DD 형식)
            const dateStr = todo.date || new Date().toISOString().split('T')[0];
            const todoDate = new Date(dateStr + 'T00:00:00');
            return todoDate >= weekStart && todoDate <= weekEnd;
        });

        // 요일별 데이터 생성 (일요일 = 0)
        const chartData = [];
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(weekStart);
            currentDay.setDate(weekStart.getDate() + i);
            currentDay.setHours(0, 0, 0, 0);
            
            const nextDay = new Date(currentDay);
            nextDay.setDate(currentDay.getDate() + 1);
            
            const dayTodos = weekTodos.filter(todo => {
                const dateStr = todo.date || new Date().toISOString().split('T')[0];
                const todoDate = new Date(dateStr + 'T00:00:00');
                return todoDate >= currentDay && todoDate < nextDay;
            });

            const completed = dayTodos.filter(t => t.completed).length;
            
            chartData.push({
                day: dayNames[i],
                date: currentDay.toISOString().split('T')[0],
                total: dayTodos.length,
                completed: completed,
                completionRate: dayTodos.length > 0 ? (completed / dayTodos.length) * 100 : 0
            });
        }

        return {
            total: weekTodos.length,
            completed: weekTodos.filter(t => t.completed).length,
            pending: weekTodos.length - weekTodos.filter(t => t.completed).length,
            completionRate: weekTodos.length > 0 ? Math.round((weekTodos.filter(t => t.completed).length / weekTodos.length) * 100) : 0,
            chartData: chartData,
            priorityStats: this.calculatePriorityStats(weekTodos)
        };
    }

    getMonthlyData(todos, monthStart) {
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);

        // 이번 달 TODO들 필터링
        const monthTodos = todos.filter(todo => {
            const dateStr = todo.date || new Date().toISOString().split('T')[0];
            const todoDate = new Date(dateStr + 'T00:00:00');
            return todoDate >= monthStart && todoDate <= monthEnd;
        });

        // 주차별 데이터 생성 (월 첫째 날부터 정확한 주차 계산)
        const chartData = [];
        let currentWeekStart = new Date(monthStart);
        let weekNumber = 1;
        
        while (currentWeekStart <= monthEnd) {
            // 일주일 후 날짜 계산
            const currentWeekEnd = new Date(currentWeekStart);
            currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
            currentWeekEnd.setHours(23, 59, 59, 999);
            
            // 월말을 넘어가면 월말로 조정
            const weekEndDate = currentWeekEnd > monthEnd ? monthEnd : currentWeekEnd;

            const weekTodos = monthTodos.filter(todo => {
                const dateStr = todo.date || new Date().toISOString().split('T')[0];
                const todoDate = new Date(dateStr + 'T00:00:00');
                return todoDate >= currentWeekStart && todoDate <= weekEndDate;
            });

            const completed = weekTodos.filter(t => t.completed).length;
            
            chartData.push({
                week: `${weekNumber}주차`,
                startDate: currentWeekStart.toISOString().split('T')[0],
                endDate: weekEndDate.toISOString().split('T')[0],
                total: weekTodos.length,
                completed: completed,
                completionRate: weekTodos.length > 0 ? (completed / weekTodos.length) * 100 : 0
            });
            
            // 다음 주 시작일로 이동
            currentWeekStart = new Date(currentWeekEnd);
            currentWeekStart.setDate(currentWeekEnd.getDate() + 1);
            currentWeekStart.setHours(0, 0, 0, 0);
            weekNumber++;
        }

        return {
            total: monthTodos.length,
            completed: monthTodos.filter(t => t.completed).length,
            pending: monthTodos.length - monthTodos.filter(t => t.completed).length,
            completionRate: monthTodos.length > 0 ? Math.round((monthTodos.filter(t => t.completed).length / monthTodos.length) * 100) : 0,
            chartData: chartData,
            priorityStats: this.calculatePriorityStats(monthTodos)
        };
    }

    calculatePriorityStats(todos) {
        const stats = {
            high: 0,   // 1-3
            medium: 0, // 4-6  
            low: 0     // 7-8
        };
        
        todos.forEach(todo => {
            if (todo.priority) {
                if (todo.priority <= 3) stats.high++;
                else if (todo.priority <= 6) stats.medium++;
                else stats.low++;
            }
        });
        
        return stats;
    }

    drawWeeklyChart(data) {
        this.drawChartForElement('#weekly-chart', data);
    }

    drawMonthlyChart(data) {
        const svg = d3.select('#monthly-chart');
        svg.selectAll('*').remove();

        // 데이터 매핑하여 차트 그리기
        const mappedData = data.map(d => ({ 
            day: d.week, 
            total: d.total, 
            completed: d.completed 
        }));
        
        // 월간 차트는 주간 차트와 동일한 구조 사용
        this.drawChartForElement('#monthly-chart', mappedData);
    }

    drawChartForElement(elementId, data) {
        console.log(`Drawing chart for ${elementId} with data:`, data);
        
        // 라이브러리 체크
        if (typeof d3 === 'undefined') {
            console.error('D3.js is not loaded!');
            return;
        }
        
        const svg = d3.select(elementId);
        if (svg.empty()) {
            console.error(`SVG element ${elementId} not found!`);
            return;
        }
        
        svg.selectAll('*').remove();

        const container = svg.node().parentElement;
        // 컨테이너의 실제 크기를 정확히 측정
        const containerRect = container.getBoundingClientRect();
        const width = Math.max(containerRect.width, 200); // 최소 너비 보장
        
        console.log(`Container width: ${width}, elementId: ${elementId}`);
        
        // 고정 높이와 반응형 마진 설정 (범례 공간 확보)
        const height = 240;
        let margin;
        if (width <= 400) {
            margin = { top: 15, right: 15, bottom: 40, left: 80 };
        } else if (width <= 600) {
            margin = { top: 15, right: 20, bottom: 45, left: 90 };
        } else {
            margin = { top: 15, right: 25, bottom: 50, left: 100 };
        }
        
        // SVG 크기 설정 - viewBox도 함께 설정하여 반응형 지원
        svg.attr('width', width)
           .attr('height', height)
           .attr('viewBox', `0 0 ${width} ${height}`)
           .attr('preserveAspectRatio', 'xMidYMid meet');
           
        const chartWidth = Math.max(width - margin.left - margin.right, 50);
        const chartHeight = Math.max(height - margin.top - margin.bottom, 50);
        
        console.log(`Chart dimensions: ${chartWidth} x ${chartHeight}, margin:`, margin);

        // Rough.js 사용 가능 여부 확인
        const useRough = typeof window.rough !== 'undefined';
        console.log('Using Rough.js:', useRough);
        
        if (useRough) {
            this.drawRoughChart(svg, data, margin, chartWidth, chartHeight, width);
        } else {
            this.drawSVGChart(svg, data, margin, chartWidth, chartHeight, width);
        }
    }

    drawRoughChart(svg, data, margin, chartWidth, chartHeight, width) {
        const rc = window.rough.svg(svg.node());
        
        // 스케일 설정
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.day))
            .range([0, chartWidth])
            .padding(0.3);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => Math.max(d.total, 5))])
            .range([chartHeight, 0]);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // 그리드 라인 (더 거친 손그림 느낌)
        const yTicks = yScale.ticks(5);
        yTicks.forEach(tick => {
            if (tick > 0) {
                const gridLine = rc.line(0, yScale(tick), chartWidth, yScale(tick), {
                    stroke: '#e8e8e8',
                    strokeWidth: 1,
                    roughness: 1.2
                });
                g.node().appendChild(gridLine);
            }
        });

        // 축 그리기 (더 거친 손그림 느낌)
        const xAxis = rc.line(0, chartHeight, chartWidth, chartHeight, {
            stroke: '#666',
            strokeWidth: 2.5,
            roughness: 1.5
        });
        g.node().appendChild(xAxis);

        const yAxis = rc.line(0, 0, 0, chartHeight, {
            stroke: '#666', 
            strokeWidth: 2.5,
            roughness: 1.5
        });
        g.node().appendChild(yAxis);

        // 막대 차트로 변경 (연필 그림 스타일) - 나란히 배치
        data.forEach(d => {
            const barWidth = xScale.bandwidth() / 2.2; // 두 막대를 나란히 배치하기 위해 너비 조정
            const barX = xScale(d.day);
            const spacing = barWidth * 0.1; // 막대 사이 간격
            
            // 전체 일 막대 (왼쪽)
            if (d.total > 0) {
                const totalBarHeight = chartHeight - yScale(d.total);
                const totalBar = rc.rectangle(barX, yScale(d.total), barWidth, totalBarHeight, {
                    fill: '#f0f4ff',
                    fillStyle: 'hachure',
                    hachureAngle: 35,
                    hachureGap: 4,
                    stroke: '#667eea',
                    strokeWidth: 2,
                    roughness: 2.0,
                    fillWeight: 1.5
                });
                g.node().appendChild(totalBar);
            }
            
            // 완료된 일 막대 (오른쪽)
            if (d.completed > 0) {
                const completedBarHeight = chartHeight - yScale(d.completed);
                const completedBar = rc.rectangle(barX + barWidth + spacing, yScale(d.completed), barWidth, completedBarHeight, {
                    fill: '#d4edda',
                    fillStyle: 'hachure',
                    hachureAngle: -45,
                    hachureGap: 3,
                    stroke: '#28a745',
                    strokeWidth: 2.5,
                    roughness: 2.2,
                    fillWeight: 2
                });
                g.node().appendChild(completedBar);
            }
        });

        this.addChartLabels(svg, g, data, xScale, yScale, yTicks, chartHeight, chartWidth, width);
    }

    drawSVGChart(svg, data, margin, chartWidth, chartHeight, width) {

        // 스케일 설정
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.day))
            .range([0, chartWidth])
            .padding(0.3);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => Math.max(d.total, 5))])
            .range([chartHeight, 0]);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // 그리드 라인 (일반 SVG)
        const yTicks = yScale.ticks(5);
        yTicks.forEach(tick => {
            if (tick > 0) {
                g.append('line')
                    .attr('x1', 0)
                    .attr('x2', chartWidth)
                    .attr('y1', yScale(tick))
                    .attr('y2', yScale(tick))
                    .style('stroke', '#e8e8e8')
                    .style('stroke-width', 1)
                    .style('opacity', 0.7);
            }
        });

        // 축 그리기 (일반 SVG)
        g.append('line')
            .attr('x1', 0)
            .attr('x2', chartWidth)
            .attr('y1', chartHeight)
            .attr('y2', chartHeight)
            .style('stroke', '#666')
            .style('stroke-width', 2);

        g.append('line')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', chartHeight)
            .style('stroke', '#666')
            .style('stroke-width', 2);

        // 막대 차트 (SVG 버전) - 나란히 배치
        data.forEach(d => {
            const barWidth = xScale.bandwidth() / 2.2; // 두 막대를 나란히 배치하기 위해 너비 조정
            const barX = xScale(d.day);
            const spacing = barWidth * 0.1; // 막대 사이 간격
            
            // 전체 일 막대 (왼쪽)
            if (d.total > 0) {
                const totalBarHeight = chartHeight - yScale(d.total);
                g.append('rect')
                    .attr('x', barX)
                    .attr('y', yScale(d.total))
                    .attr('width', barWidth)
                    .attr('height', totalBarHeight)
                    .style('fill', '#f0f4ff')
                    .style('stroke', '#667eea')
                    .style('stroke-width', 2)
                    .style('opacity', 0.8);
            }
            
            // 완료된 일 막대 (오른쪽)
            if (d.completed > 0) {
                const completedBarHeight = chartHeight - yScale(d.completed);
                g.append('rect')
                    .attr('x', barX + barWidth + spacing)
                    .attr('y', yScale(d.completed))
                    .attr('width', barWidth)
                    .attr('height', completedBarHeight)
                    .style('fill', '#d4edda')
                    .style('stroke', '#28a745')
                    .style('stroke-width', 2)
                    .style('opacity', 0.9);
            }
        });

        this.addChartLabels(svg, g, data, xScale, yScale, yTicks, chartHeight, chartWidth, width);
    }

    addChartLabels(svg, g, data, xScale, yScale, yTicks, chartHeight, chartWidth, width) {
        // 반응형 폰트 크기 및 마진 계산 (width는 매개변수로 받음)
        let xLabelSize, yLabelSize, legendSize, margin;
        
        if (width <= 400) {
            xLabelSize = '10px';
            yLabelSize = '9px';
            legendSize = '9px';
            margin = { top: 15, right: 15, bottom: 40, left: 80 };
        } else if (width <= 600) {
            xLabelSize = '11px';
            yLabelSize = '10px';
            legendSize = '10px';
            margin = { top: 15, right: 20, bottom: 45, left: 90 };
        } else {
            xLabelSize = '12px';
            yLabelSize = '11px';
            legendSize = '11px';
            margin = { top: 15, right: 25, bottom: 50, left: 100 };
        }

        // X축 레이블
        g.selectAll('.x-label')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'x-label')
            .attr('x', d => xScale(d.day) + xScale.bandwidth() / 2)
            .attr('y', chartHeight + 20)
            .attr('text-anchor', 'middle')
            .style('font-family', 'GmarketSans')
            .style('font-size', xLabelSize)
            .style('fill', '#666')
            .text(d => d.day);

        // Y축 레이블
        g.selectAll('.y-label')
            .data(yTicks)
            .enter()
            .append('text')
            .attr('class', 'y-label')
            .attr('x', -10)
            .attr('y', d => yScale(d) + 4)
            .attr('text-anchor', 'end')
            .style('font-family', 'GmarketSans')
            .style('font-size', yLabelSize)
            .style('fill', '#666')
            .text(d => d);

        // 범례 (좌측 세로 배치)
        const rectSize = width <= 400 ? 10 : width <= 600 ? 12 : 14;
        const legend = g.append('g')
            .attr('transform', `translate(-${margin.left - 10}, ${chartHeight / 2 - 30})`);

        // 완료된 일 범례
        legend.append('rect')
            .attr('x', 0).attr('y', 0)
            .attr('width', rectSize).attr('height', rectSize * 0.8)
            .style('fill', '#d4edda')
            .style('stroke', '#28a745')
            .style('stroke-width', 1.5);

        legend.append('text')
            .attr('x', 0).attr('y', rectSize + 15)
            .style('font-family', 'GmarketSans')
            .style('font-size', legendSize)
            .style('fill', '#666')
            .style('text-anchor', 'start')
            .text('완료된 일');

        // 전체 일 범례
        legend.append('rect')
            .attr('x', 0).attr('y', 35)
            .attr('width', rectSize).attr('height', rectSize * 0.8)
            .style('fill', '#f0f4ff')
            .style('stroke', '#667eea')
            .style('stroke-width', 1.5);

        legend.append('text')
            .attr('x', 0).attr('y', 35 + rectSize + 15)
            .style('font-family', 'GmarketSans')
            .style('font-size', legendSize)
            .style('fill', '#666')
            .style('text-anchor', 'start')
            .text('전체 일');
    }

    setupPeriodTabs() {
        const weeklyTab = document.querySelector('.period-tab[data-period="weekly"]');
        const monthlyTab = document.querySelector('.period-tab[data-period="monthly"]');

        if (weeklyTab) {
            weeklyTab.addEventListener('click', () => this.switchPeriod('weekly'));
        }
        if (monthlyTab) {
            monthlyTab.addEventListener('click', () => this.switchPeriod('monthly'));
        }
    }

    switchPeriod(period) {
        console.log('Switching period to:', period);
        this.currentPeriod = period;
        
        // 탭 활성화 상태 변경
        document.querySelectorAll('.period-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.period-tab[data-period="${period}"]`)?.classList.add('active');

        // 컨테이너 표시/숨김
        document.getElementById('weekly-stats').classList.toggle('hidden', period !== 'weekly');
        document.getElementById('monthly-stats').classList.toggle('hidden', period !== 'monthly');

        // 통계 업데이트
        this.updateStatistics();
    }

    updateWeeklyStatsDOM(data) {
        console.log('Updating weekly stats DOM with data:', data);
        
        const elements = {
            total: document.querySelector('#weekly-stats #total-todos .stat-number'),
            completed: document.querySelector('#weekly-stats #completed-todos .stat-number'),
            pending: document.querySelector('#weekly-stats #pending-todos .stat-number'),
            rate: document.querySelector('#weekly-stats #completion-rate .stat-number')
        };

        console.log('Found DOM elements:', elements);

        if (elements.total) elements.total.textContent = data.total;
        if (elements.completed) elements.completed.textContent = data.completed;
        if (elements.pending) elements.pending.textContent = data.pending;
        if (elements.rate) elements.rate.textContent = data.completionRate + '%';
        
        this.updatePriorityBars(data.priorityStats, data.total);
    }

    updateMonthlyStatsDOM(data) {
        const elements = {
            total: document.querySelector('#month-total'),
            completed: document.querySelector('#month-completed'),
            pending: document.querySelector('#month-deleted'),
            rate: document.querySelector('#month-rate')
        };

        console.log('Updating monthly stats:', data);
        console.log('Monthly elements found:', elements);

        if (elements.total) elements.total.textContent = data.total;
        if (elements.completed) elements.completed.textContent = data.completed;
        if (elements.pending) elements.pending.textContent = data.pending;
        if (elements.rate) elements.rate.textContent = data.completionRate + '%';
    }

    updatePriorityBars(priorityStats, total) {
        const bars = {
            high: document.querySelector('.bar.high'),
            medium: document.querySelector('.bar.medium'),
            low: document.querySelector('.bar.low')
        };

        const values = {
            high: document.querySelector('.bar.high .bar-value'),
            medium: document.querySelector('.bar.medium .bar-value'),
            low: document.querySelector('.bar.low .bar-value')
        };

        if (total > 0) {
            // 높은 우선순위
            if (bars.high && values.high) {
                const highPercent = (priorityStats.high / total) * 100;
                bars.high.style.width = highPercent + '%';
                values.high.textContent = priorityStats.high;
            }

            // 중간 우선순위
            if (bars.medium && values.medium) {
                const mediumPercent = (priorityStats.medium / total) * 100;
                bars.medium.style.width = mediumPercent + '%';
                values.medium.textContent = priorityStats.medium;
            }

            // 낮은 우선순위
            if (bars.low && values.low) {
                const lowPercent = (priorityStats.low / total) * 100;
                bars.low.style.width = lowPercent + '%';
                values.low.textContent = priorityStats.low;
            }
        } else {
            // 데이터가 없을 때 초기화
            Object.values(bars).forEach(bar => {
                if (bar) bar.style.width = '0%';
            });
            Object.values(values).forEach(value => {
                if (value) value.textContent = '0';
            });
        }
    }

}

// 전역 함수로 노출 (HTML onclick에서 사용)
function openDashboard() {
    if (window.dashboardController) {
        window.dashboardController.openDashboard();
    }
}

function closeDashboard() {
    if (window.dashboardController) {
        window.dashboardController.closeDashboard();
    }
}

// 컨트롤러 인스턴스를 전역으로 노출
window.dashboardController = new DashboardController();