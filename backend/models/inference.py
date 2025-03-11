import sys
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import together
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add backend directory to Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Get environment variables
together.api_key = os.getenv("TOGETHER_API_KEY")
PORT = int(os.getenv("PORT", 5000))
PRODUCTION = os.getenv("PRODUCTION", "false").lower() == "true"
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app = Flask(__name__)
# Configure CORS with specific origins in production
CORS(app, origins=ALLOWED_ORIGINS if PRODUCTION else "*")

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Flask server is running!"})

@app.route("/search", methods=["POST"])
def search():
    data = request.get_json()
    query = data.get("query", "")

    if not query:
        return jsonify({"error": "No query provided"}), 400

    try:
        # Improved prompt template
        prompt = f"""You are a helpful AI assistant with expertise in programming, technology, and general knowledge. 
Please provide a clear, direct, and accurate answer to the following question. 
If the question is about code or technical topics, include relevant code examples or step-by-step instructions.

Question: {query}

Answer: """

        response = together.Completion.create(
            model="meta-llama/Meta-Llama-3-70B-Instruct-Turbo",
            prompt=prompt,
            max_tokens=800,
            temperature=0.7,
            top_k=50,
            top_p=0.7,
        )

        ai_response = response.choices[0].text.strip()
        return jsonify({"response": ai_response})

    except Exception as e:
        print(f"Error in search endpoint: {str(e)}")  # Add logging
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Use production server in production mode
    if PRODUCTION:
        from waitress import serve
        print(f"Starting production server on port {PORT}")
        serve(app, host="0.0.0.0", port=PORT)
    else:
        print(f"Starting development server on port {PORT}")
        app.run(debug=True, port=PORT)
