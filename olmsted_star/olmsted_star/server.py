from flask import Flask, jsonify, request
import os
import json
import csv
from flask_cors import CORS , cross_origin
import logging


app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
logging.getLogger('flask_cors').level = logging.DEBUG

@app.route('/api/data', methods=['GET'])
@cross_origin()
def get_data():
    state = request.args.get('state')
    file_name = request.args.get('file')  

    if not state or not file_name:
        return jsonify({"error": "State and file parameters are required"}), 400

    # Construct the full file path
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    file_path = os.path.join(project_root, 'data', 'processed', state, file_name)
    
    if not os.path.exists(file_path):
        return jsonify({"error": f"File {file_name} not found in {state}"}), 404

    data = []
    if file_name.endswith('.json'):
        with open(file_path) as f:
            data = json.load(f)
    elif file_name.endswith('.csv'):
        with open(file_path, mode='r') as f:
            reader = csv.DictReader(f)
            data = [row for row in reader]
    else:
        return jsonify({"error": "Unsupported file type"}), 400

    return jsonify(data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)
