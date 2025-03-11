from flask import Flask, jsonify
from routes.search import search_bp


app = Flask(__name__)


# Register the search route
app.register_blueprint(search_bp)
@app.route("/")
def home():
    return jsonify({"message": "AI Search Engine Backend is Running!"})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
