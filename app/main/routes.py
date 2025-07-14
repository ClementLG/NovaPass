from flask import render_template, jsonify, request, Blueprint
from app.core.password_generator import generate_secure_password

main = Blueprint('main', __name__)


@main.route('/')
def index():
    """Displays the main page."""
    return render_template('index.html')


@main.route('/api/generate', methods=['POST'])
def api_generate_password():
    """
    API endpoint to generate a password.
    Takes options in JSON and returns the password and strength data.
    """
    options = request.get_json()

    result_data = generate_secure_password(
        length=options.get('length', 16),
        upper=bool(options.get('upper', True)),
        lower=bool(options.get('lower', True)),
        digits=bool(options.get('digits', True)),
        symbols=bool(options.get('symbols', True)),
        exclude_chars=options.get('exclude', '')
    )

    return jsonify(result_data)