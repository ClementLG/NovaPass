import os
from flask import render_template, jsonify, request, Blueprint, current_app
from app.core.password_generator import generate

main = Blueprint('main', __name__)


@main.route('/')
def index():
    return render_template('index.html')


@main.route('/api/dictionaries')
def get_dictionaries():
    """
    Get the list of available dictionaries
    ---
    responses:
      200:
        description: A list of available dictionaries
        schema:
          type: array
          items:
            type: string
    """
    try:
        dict_path = current_app.config['DICTIONARY_DIR']
        if not os.path.exists(dict_path):
            return jsonify([])

        # Only list .txt files for security
        available_dicts = [f for f in os.listdir(dict_path) if f.endswith('.txt')]
        return jsonify(available_dicts)
    except Exception as e:
        print(f"Error reading dictionaries: {e}")
        return jsonify([]), 500


@main.route('/api/generate', methods=['POST'])
def api_generate_password():
    """
    Generate a password
    ---
    parameters:
      - name: body
        in: body
        required: true
        schema:
          id: PasswordOptions
          required:
            - mode
          properties:
            mode:
              type: string
              description: The generation mode (e.g., 'password', 'passphrase')
              enum: ['password', 'passphrase']
            length:
              type: integer
              description: The length of the password or the number of words for a passphrase
            dictionary:
              type: string
              description: The dictionary to use for passphrase generation
            exclude_chars:
              type: string
              description: Characters to exclude from the password
    responses:
      200:
        description: The generated password
    """
    options = request.get_json()
    if 'num_words' in options:
        options['length'] = options.pop('num_words')

    # Get the mode and pass all other options
    mode = options.pop('mode', 'password')

    result_data = generate(mode=mode, **options)

    return jsonify(result_data)