// 在 textInput.addEventListener 中修改 fetch 部分
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
                throw new Error('网络请求失败');
            }
            
            const data = await response.json();
            addMessage(data.reply, 'bot');
            
        } catch (error) {
            console.error('Error:', error);
            addMessage('抱歉，发生了一些错误，请稍后重试。', 'bot');
        }
    }
}); 