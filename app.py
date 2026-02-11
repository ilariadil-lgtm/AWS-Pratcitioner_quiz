from flask import Flask, jsonify, render_template, abort
import json
import os

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

def get_answer_index(letter):
    """Converts a letter (a, b, c, ...) to an index (0, 1, 2, ...)."""
    return ord(letter.lower()) - ord('a')

def load_quiz_data(filename):
    """Loads and parses a quiz JSON file."""
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        return None
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        quizzes = []
        if 'results' in data:
            for item in data['results']:
                # Parse correct responses
                correct_indices = []
                if 'correct_response' in item:
                    for resp in item['correct_response']:
                        correct_indices.append(get_answer_index(resp))
                
                quiz_item = {
                    'id': item.get('id'),
                    'question': item.get('prompt', {}).get('question', ''),
                    'answers': item.get('prompt', {}).get('answers', []),
                    'explanation': item.get('prompt', {}).get('explanation', ''),
                    'correct_indices': correct_indices,
                    'assessment_type': item.get('assessment_type', 'multiple-choice')
                }
                quizzes.append(quiz_item)
        return quizzes
    except Exception as e:
        print(f"Error loading {filename}: {e}")
        return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/quizzes')
def get_quizzes():
    """Returns a list of available quiz files."""
    files = []
    if os.path.exists(DATA_DIR):
        for f in sorted(os.listdir(DATA_DIR)):
            if f.endswith('.json'):
                files.append(f)
    return jsonify(files)

@app.route('/api/quiz/<filename>')
def get_quiz(filename):
    """Returns the content of a specific quiz."""
    # Security check to prevent directory traversal
    if '..' in filename or filename.startswith('/'):
        abort(400)
        
    data = load_quiz_data(filename)
    if data is None:
        abort(404)
        
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
