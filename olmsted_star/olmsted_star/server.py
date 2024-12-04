from flask import Flask, jsonify, request, send_from_directory
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

@app.route('/api/geojson', methods=['GET'])
@cross_origin()
def serve_geojson():
    state = request.args.get('state')
    subdir = request.args.get('subdir')
    file_name = request.args.get('file')  

    if not state or not file_name:
        return jsonify({"error": "State and file parameters are required"}), 400

    external_geojson_directory = '/Users/elvyyang/Documents/parks-qgis'
    file_path = os.path.join(external_geojson_directory, state, subdir or '')

    if not os.path.exists(os.path.join(external_geojson_directory, file_path)):
        return jsonify({"error": f"GeoJSON file {file_path} not found"}), 404

    return send_from_directory(file_path, file_name)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)
