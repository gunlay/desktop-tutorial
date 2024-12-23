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
            print("Error: Empty message received")
            return jsonify({'error': '消息不能为空'}), 400
            
        print(f"Received message: {user_message}")
        
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
        print(f"AI reply: {ai_reply}")
        
        return jsonify({
            'reply': ai_reply
        })
        
    except Exception as e:
        print(f"Detailed Error: {str(e)}")
        return jsonify({'error': '服务器错误'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 