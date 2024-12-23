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
    const voiceIcon = voiceBtn.querySelector('.icon');
    const voiceText = voiceBtn.querySelector('span');
    let mediaRecorder;
    let isRecording = false;
    let audioChunks = [];

    voiceBtn.addEventListener('click', async () => {
        if (!isRecording) {
            try {
                // 请求麦克风权限并开始录音
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                
                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    // 录音结束后的处理
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    audioChunks = [];
                    
                    // 创建音频URL
                    const audioUrl = URL.createObjectURL(audioBlob);
                    
                    // 添加语音消息
                    addVoiceMessage(audioUrl, audioBlob.size);
                    
                    // 模拟语音转文字（实际项目中需要调用语音识别API）
                    setTimeout(() => {
                        const mockText = "这是一段语音转换的文字";
                        addVoiceTranscript(mockText);
                    }, 1000);
                };

                // 开始录音
                mediaRecorder.start();
                isRecording = true;
                voiceIcon.textContent = '⏺';  // 改变图标为录音中
                voiceText.textContent = '点击结束';
                voiceBtn.style.backgroundColor = '#ff3b30';  // 改变按钮颜色为红色

            } catch (err) {
                console.error('无法访问麦克风：', err);
                alert('无法访问麦克风，请确保已授予麦克风权限。');
            }
        } else {
            // 停止录音
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            isRecording = false;
            voiceIcon.textContent = '🎤';  // 恢复原始图标
            voiceText.textContent = '语音输入';
            voiceBtn.style.backgroundColor = '#007aff';  // 恢复原始颜色
        }
    });

    // 添加文本输入处理
    const textInput = document.querySelector('.text-input');
    const chatMessages = document.getElementById('chatMessages');

    // 添加自动回复的示例回复列表
    const autoReplies = [
        "好的，我明白了",
        "这是一个很好的问题",
        "让我想想怎么回答",
        "需要我为您详细解释吗？",
        "我来帮您解决这个问题"
    ];

    textInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && textInput.value.trim()) {
            const userMessage = textInput.value.trim();
            
            // 添加用户消息
            addMessage(userMessage, 'user');
            
            // 清空输入框
            textInput.value = '';
            
            try {
                // 修改为线上地址
                const response = await fetch('http://your_actual_server:5001/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: userMessage
                    })
                });
                
                if (!response.ok) {
                    throw new Error('网络请求失败');
                }
                
                const data = await response.json();
                
                // 添加AI回复消息
                addMessage(data.reply, 'bot');
                
            } catch (error) {
                console.error('Error:', error);
                addMessage('抱歉，发生了一些错误，请稍后重试。', 'bot');
            }
        }
    });

    function addMessage(text, type) {
        // 当添加第一条消息时，隐藏欢迎文案
        const welcomeSection = document.querySelector('.content-section');
        if (welcomeSection && welcomeSection.style.display !== 'none') {
            welcomeSection.style.display = 'none';
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        
        // 滚动到最新消息
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
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

// 添加新的函数用于创建语音消息
function addVoiceMessage(audioUrl, size) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user voice';
    
    // 计算语音时长（这里简单估算，实际项目中需要获取真实时长）
    const duration = Math.round(size / 1000); // 简单估算，实际需要根据实际音频时长计算
    
    // 创建语音波形动画
    const waveDiv = document.createElement('div');
    waveDiv.className = 'voice-wave';
    for (let i = 0; i < 4; i++) {
        const bar = document.createElement('div');
        bar.className = 'wave-bar';
        bar.style.height = `${6 + Math.random() * 6}px`; // 随机高度
        waveDiv.appendChild(bar);
    }
    
    // 添加时长显示
    const durationSpan = document.createElement('span');
    durationSpan.className = 'voice-duration';
    durationSpan.textContent = `${duration}"`;
    
    messageDiv.appendChild(waveDiv);
    messageDiv.appendChild(durationSpan);
    
    // 添加播放功能
    const audio = new Audio(audioUrl);
    messageDiv.addEventListener('click', () => {
        audio.play();
        
        // 播放时添加动画效果
        const bars = waveDiv.querySelectorAll('.wave-bar');
        bars.forEach(bar => {
            bar.style.animation = 'waveAnimation 1s ease-in-out infinite';
        });
        
        // 播放结束时移除动画
        audio.onended = () => {
            bars.forEach(bar => {
                bar.style.animation = '';
            });
        };
    });
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 添加语音转文字显示
function addVoiceTranscript(text) {
    const transcriptDiv = document.createElement('div');
    transcriptDiv.className = 'message user voice-text';
    transcriptDiv.textContent = text;
    
    chatMessages.appendChild(transcriptDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 添加波形动画样式
const style = document.createElement('style');
style.textContent = `
@keyframes waveAnimation {
    0% { transform: scaleY(1); }
    50% { transform: scaleY(1.5); }
    100% { transform: scaleY(1); }
}
`;
document.head.appendChild(style); 