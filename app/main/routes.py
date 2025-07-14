# app/main/routes.py
from flask import render_template, jsonify, request, Blueprint
from app.core.password_generator import generate_secure_password

# On crée un Blueprint pour mieux organiser notre code
main = Blueprint('main', __name__)


@main.route('/')
def index():
    """Affiche la page principale."""
    return render_template('index.html')


@main.route('/api/generate', methods=['POST'])
def api_generate_password():
    """
    Point d'API pour générer un mot de passe.
    Prend les options en JSON et retourne le mot de passe.
    """
    options = request.get_json()

    password = generate_secure_password(
        length=int(options.get('length', 16)),
        upper=bool(options.get('upper', True)),
        lower=bool(options.get('lower', True)),
        digits=bool(options.get('digits', True)),
        symbols=bool(options.get('symbols', True))
    )

    return jsonify({'password': password})