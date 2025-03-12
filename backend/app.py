from flask import Flask, jsonify
from routes.search import search_bp
import os


app = Flask(__name__)


# Register the search route
app.register_blueprint(search_bp)
@app.route("/")
def home():
    return jsonify({"message": "AI Search Engine Backend is Running!"})

if __name__ == "__main__":
    port = int(os.getenv("PORT", 10000))
    app.run(host="0.0.0.0", debug=False, port=port)
