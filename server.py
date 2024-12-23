from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os

app = Flask(__name__)
CORS(app)  # 启用跨域支持

# 初始化OpenAI客户端
client = OpenAI(
    api_key="sk-276d5267971644bca803a9130d6db1ac",
    base_url="https://api.deepseek.com"
)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message')
        
        if not user_message:
            return jsonify({'error': '消息不能为空'}), 400
            
        # 调用AI接口
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "你是一个友好的助手，请用简短的语言回答用户的问题。"},
                {"role": "user", "content": user_message}
            ],
            stream=False
        )
        
        # 获取AI回复
        ai_reply = response.choices[0].message.content
        
        return jsonify({
            'reply': ai_reply
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Vercel 需要的健康检查路由
@app.route('/')
def home():
    return "Server is running"

# Vercel 使用 WSGI 应用
app.debug = False