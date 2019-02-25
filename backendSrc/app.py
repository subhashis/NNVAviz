from flask import Flask
import json
from flask import jsonify
from flask import request
import surrogateModel as model

app = Flask(__name__)

@app.route("/data")
def defaultData():
    data = {}
    with open('./data/2/NNVA_data.json') as f:
        data = json.load(f)
    return jsonify(data)

@app.route("/prev")
def previewData():
    paras = []
    for value in request.args.values():
        paras.append(float(value))
    res = model.main(paras)
    return jsonify(res)

