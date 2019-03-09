from flask import Flask, jsonify, request, send_from_directory
import json
import surrogateModel as model
import os

app = Flask(__name__, static_folder='../build')

@app.route("/defaultData")
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

@app.route("/matrix/<index>")
def previewMatrix(index):
    return 'test'

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    print(path)
    if path != "" and os.path.exists("../build/" + path):
        return send_from_directory('../build/', path)
    else:
        return send_from_directory('../build/', 'index.html')

