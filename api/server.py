from flask import Flask, request, jsonify
from flask_cors import CORS
import openai

app = Flask(__name__)
CORS(app)

# 配置OpenAI
openai.api_key = "sk-276d5267971644bca803a9130d6db1ac"
openai.api_base = "https://api.deepseek.com"

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message')
        
        if not user_message:
            return jsonify({'error': '消息不能为空'}), 400
            
        response = openai.ChatCompletion.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "你是一个友好的助手，请用简短的语言回答用户的问题。"},
                {"role": "user", "content": user_message}
            ]
        )
        
        ai_reply = response.choices[0].message.content
        return jsonify({'reply': ai_reply})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/')
def home():
    return "Server is running"

# 为 Vercel 提供入口点
app = app.wsgi_app 