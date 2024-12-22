document.addEventListener('DOMContentLoaded', function() {
    const tabItems = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');

    tabItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有active类
            tabItems.forEach(tab => tab.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // 添加active类到当前选中的tab
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // 初始化轮播图
    initCarousel();

    // 初始化日历
    initCalendar();

    document.querySelectorAll('.profile-item').forEach(item => {
        item.addEventListener('click', function() {
            const text = this.querySelector('span').textContent;
            alert(`点击了${text}选项`);
        });
    });
});

// 轮播图功能
function initCarousel() {
    const container = document.querySelector('.carousel-container');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;

    function updateCarousel() {
        container.style.transform = `translateX(-${currentSlide * 33.333}%)`;
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    // 自动轮播
    setInterval(() => {
        currentSlide = (currentSlide + 1) % 3;
        updateCarousel();
    }, 3000);

    // 添加语音输入按钮点击事件
    const voiceBtn = document.querySelector('.voice-input-btn');
    voiceBtn.addEventListener('click', () => {
        // 这里添加语音输入相关代码
        alert('启动语音输入');
    });
}

// 日历功能
function initCalendar() {
    const calendarDays = document.getElementById('calendarDays');
    const calendarTitle = document.querySelector('.calendar-title');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    function renderCalendar(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDay = firstDay.getDay();
        const monthLength = lastDay.getDate();
        
        calendarTitle.textContent = `${year}年${month + 1}月`;
        calendarDays.innerHTML = '';

        // 上个月的最后几天
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            const dayElement = createDayElement(prevMonthLastDay - i, 'other-month');
            calendarDays.appendChild(dayElement);
        }

        // 当前月的天数
        for (let i = 1; i <= monthLength; i++) {
            const isToday = year === currentDate.getFullYear() && 
                           month === currentDate.getMonth() && 
                           i === currentDate.getDate();
            const dayElement = createDayElement(i, isToday ? 'today' : '');
            
            // 示例：随机添加一些事件标记
            if (Math.random() < 0.3) {
                dayElement.classList.add('has-event');
            }
            
            calendarDays.appendChild(dayElement);
        }

        // 下个月的开始几天
        const remainingDays = 42 - (startingDay + monthLength); // 保持6行布局
        for (let i = 1; i <= remainingDays; i++) {
            const dayElement = createDayElement(i, 'other-month');
            calendarDays.appendChild(dayElement);
        }
    }

    function createDayElement(day, className) {
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day ${className}`;
        dayElement.textContent = day;
        dayElement.addEventListener('click', () => showDayDetail(day));
        return dayElement;
    }

    function showDayDetail(day) {
        alert(`查看 ${currentYear}年${currentMonth + 1}月${day}日 的详细记录`);
        // 这里可以实现查看详情的具体逻辑
    }

    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentYear, currentMonth);
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentYear, currentMonth);
    });

    // 初始渲染
    renderCalendar(currentYear, currentMonth);
} 