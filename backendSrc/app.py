from flask import Flask
import json
from flask import jsonify
app = Flask(__name__)

@app.route("/")
def hello():
    data = {}
    with open('./data/1/NNVA_data.json') as f:
        data = json.load(f)
    return jsonify(data)