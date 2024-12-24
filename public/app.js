document.addEventListener('DOMContentLoaded', function() {
    const tabItems = document.querySelectorAll('.tab-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const textInput = document.querySelector('.text-input');
    const chatMessages = document.getElementById('chatMessages');

    // 初始化语音输入
    initVoiceInput();
    
    // 初始化轮播图
    initCarousel();
    
    // 初始化日历
    initCalendar();

    // Tab 切换逻辑
    tabItems.forEach(item => {
        item.addEventListener('click', function() {
            tabItems.forEach(tab => tab.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // 塔罗牌按钮点击事件
    const tarotBtn = document.querySelector('.tarot-btn');
    tarotBtn.addEventListener('click', () => {
        const cozeAppUrl = 'https://www.coze.cn/space/7382101453072302143/ui-builder-preview/7451807835614199827/mobile/home';
        window.open(cozeAppUrl, '_blank');
    });

    // 文本输入处理
    textInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && textInput.value.trim()) {
            handleUserInput(textInput.value.trim());
        }
    });
});

// 语音输入初始化函数
function initVoiceInput() {
    const voiceBtn = document.querySelector('.voice-input-btn');
    const voiceIcon = voiceBtn.querySelector('.icon');
    const voiceText = voiceBtn.querySelector('span');
    const waveContainer = document.querySelector('.voice-wave-container');
    const wavesDiv = document.querySelector('.voice-waves');
    const cancelTip = document.querySelector('.cancel-tip');
    const finishBtn = document.querySelector('.finish-record-btn');
    const textInput = document.querySelector('.text-input');
    
    let recognition = null;
    let isRecording = false;

    // 检查是否支持原生语音识别
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'zh-CN';
    } else if ('SpeechRecognition' in window) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'zh-CN';
    }

    // 如果支持语音识别，设置事件处理
    if (recognition) {
        recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            if (result.isFinal) {
                const text = result[0].transcript;
                handleUserInput(text);
                stopRecording();
            }
        };

        recognition.onend = () => {
            if (isRecording) {
                startRecording();
            }
        };

        recognition.onerror = (event) => {
            console.error('语音识别错误:', event.error);
            if (event.error === 'no-speech') {
                if (isRecording) {
                    startRecording();
                }
            } else {
                stopRecording();
                addMessage('语音识别失败，请重试。', 'bot');
            }
        };
    }

    // 开始录音
    async function startRecording() {
        try {
            if (!recognition) {
                // 如果不支持 Web Speech API，尝试调用系统语音输入
                if (isMobile()) {
                    startMobileVoiceInput();
                    return;
                }
                throw new Error('设备不支持语音识别');
            }

            recognition.start();
            isRecording = true;
            waveContainer.classList.add('active');
            voiceIcon.textContent = '⏺';
            voiceText.textContent = '录音中';
            voiceBtn.style.backgroundColor = '#ff3b30';
        } catch (err) {
            console.error('录音启动失败:', err);
            addMessage('录音启动失败，请重试。', 'bot');
            stopRecording();
        }
    }

    // 停止录音
    function stopRecording() {
        if (!isRecording) return;
        
        isRecording = false;
        if (recognition) {
            recognition.stop();
        }
        waveContainer.classList.remove('active');
        cancelTip.classList.remove('active');
        voiceIcon.textContent = '🎤';
        voiceText.textContent = '语音输入';
        voiceBtn.style.backgroundColor = '#007aff';
    }

    // 检查是否为移动设备
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // 启动移动设备原生语音输入
    function startMobileVoiceInput() {
        const input = document.createElement('input');
        input.type = 'text';
        input.style.position = 'absolute';
        input.style.opacity = '0';
        input.style.height = '1px';
        input.style.width = '1px';
        input.style.top = '-100px';
        document.body.appendChild(input);

        input.focus();
        
        // 触发移动设备的语音输入
        if (typeof window.webkit !== 'undefined' && 
            window.webkit.messageHandlers && 
            window.webkit.messageHandlers.keyboard) {
            // iOS 设备
            window.webkit.messageHandlers.keyboard.postMessage('showVoice');
        } else if (window.chrome && window.chrome.webview) {
            // Android 设备
            window.chrome.webview.postMessage('showVoice');
        } else {
            // 尝试使用 speech-to-text 输入类型
            input.setAttribute('x-webkit-speech', '');
            input.setAttribute('speech', '');
        }

        input.addEventListener('input', () => {
            if (input.value) {
                handleUserInput(input.value);
                input.value = '';
                document.body.removeChild(input);
            }
        });

        // 5秒后移除输入框
        setTimeout(() => {
            if (document.body.contains(input)) {
                document.body.removeChild(input);
            }
        }, 5000);
    }

    // 语音按钮点击事件
    voiceBtn.addEventListener('click', () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    });

    // 完成按钮点击事件
    finishBtn.addEventListener('click', () => {
        if (isRecording) {
            stopRecording();
        }
    });
}

// 处理用户输入
async function handleUserInput(text) {
    const textInput = document.querySelector('.text-input');
    
    addMessage(text, 'user');
    textInput.value = '';
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: text
            })
        });
        
        if (!response.ok) {
            throw new Error(await response.text());
        }
        
        const data = await response.json();
        addMessage(data.reply, 'bot');
    } catch (error) {
        console.error('Error:', error);
        addMessage('抱歉，发生了错误，请稍后重试。', 'bot');
    }
}

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
    const waveContainer = document.querySelector('.voice-wave-container');
    const wavesDiv = document.querySelector('.voice-waves');
    const cancelTip = document.querySelector('.cancel-tip');
    let recognition = null;
    let audioContext = null;
    let mediaStream = null;
    let analyser = null;
    let isRecording = false;
    let longPressTimer = null;
    let startY = 0;

    // 创建波形条
    for (let i = 0; i < 20; i++) {
        const bar = document.createElement('div');
        bar.className = 'voice-wave-bar';
        wavesDiv.appendChild(bar);
    }

    // 初始化音频上下文
    function initAudioContext() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
    }

    // 更新波形显示
    function updateWaveform() {
        if (!isRecording) return;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const bars = wavesDiv.children;
        
        for (let i = 0; i < bars.length; i++) {
            const value = dataArray[i] || 0;
            const height = Math.max(3, value / 2);
            bars[i].style.height = `${height}px`;
        }

        requestAnimationFrame(updateWaveform);
    }

    // 检查浏览器是否支持语音识别
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'zh-CN';  // 设置语音识别为中文

        // 语音识别结果处理
        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            textInput.value = text;  // 将识别结果填入输入框
            
            // 自动发送识别结果
            const enterEvent = new KeyboardEvent('keypress', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true
            });
            textInput.dispatchEvent(enterEvent);
        };

        // 语音识别结束处理
        recognition.onend = () => {
            isRecording = false;
            voiceIcon.textContent = '🎤';
            voiceText.textContent = '语音输入';
            voiceBtn.style.backgroundColor = '#007aff';
        };

        // 语音识别错误处理
        recognition.onerror = (event) => {
            console.error('语音识别错误:', event.error);
            isRecording = false;
            voiceIcon.textContent = '🎤';
            voiceText.textContent = '语音输入';
            voiceBtn.style.backgroundColor = '#007aff';
            addMessage('语音识别失败，请重试。', 'bot');
        };
    }

    // 添加文本输入处理
    const textInput = document.querySelector('.text-input');
    const chatMessages = document.getElementById('chatMessages');

    // 添加自动回复的例回复列表
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
                // 使用相对路径
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: userMessage
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API Error:', errorData);
                    throw new Error(errorData.error || '网络请求失败');
                }
                
                const data = await response.json();
                
                // 添加AI回复消息
                addMessage(data.reply, 'bot');
                
            } catch (error) {
                console.error('Error details:', error);
                addMessage(`错误信息: ${error.message}`, 'bot');
            }
        }
    });

    function addMessage(text, type) {
        // 获取欢迎文案区域
        const welcomeSection = document.querySelector('.content-section');
        
        // 如果欢迎文案还在显示，则隐藏它
        if (welcomeSection && !welcomeSection.classList.contains('hidden')) {
            welcomeSection.classList.add('hidden');
            
            // 重新计算聊天容器的高度
            const chatContainer = document.querySelector('.chat-container');
            if (chatContainer) {
                chatContainer.style.height = 'calc(100vh - 330px)';  // 调整高度
            }
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        
        // 滚动到最新消息
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 在 initCarousel 函数中添加塔罗牌按钮事件处理
    const tarotBtn = document.querySelector('.tarot-btn');
    tarotBtn.addEventListener('click', () => {
        // 替换为你 Coze 应用链接
        const cozeAppUrl = 'https://www.coze.cn/space/7382101453072302143/ui-builder-preview/7451807835614199827/mobile/home';  // 替换 YOUR_BOT_ID
        // 在新窗口打开 Coze 应用
        window.open(cozeAppUrl, '_blank');
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