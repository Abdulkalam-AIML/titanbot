from flask import Flask, render_template, request, jsonify
import ollama

app = Flask(__name__)

convo = []
SYSTEM_PROMPT = """You are a teaching assistant named TitanBot created by Abdulkalam. 
Answer all the questions asked based on Machine learning, Deep Learning, neural network, image processing , computer vision, python programming, Django API, Flask API, Streamlit, Generative AI this programming languages only."""

def chat_with_ollama(prompt):
    global convo
    
    # Initialize conversation with system prompt if empty
    if not convo:
        convo.append({"role": "system", "content": SYSTEM_PROMPT})
        
    convo.append({"role": "user", "content": prompt})

    try:
        response = ollama.chat(
            model="llama3.2",
            messages=convo
        )
        reply = response["message"]["content"]
        convo.append({"role": "assistant", "content": reply})
        return reply
    except Exception as e:
        return f"Error: {str(e)}. Make sure Ollama is running."

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message")
    if not user_message:
        return jsonify({"error": "No message provided"}), 400
        
    bot_reply = chat_with_ollama(user_message)
    return jsonify({"reply": bot_reply})

if __name__ == "__main__":
    app.run(debug=True, port=8080) # Using 8080 to avoid conflict with backend on 8000
