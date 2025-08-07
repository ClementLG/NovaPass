# app/__init__.py
from flask import Flask
from flasgger import Swagger


def create_app():
    """Crée et configure l'instance de l'application Flask."""
    app = Flask(__name__)
    swagger = Swagger(app)

    # Il est bon de définir une clé secrète, même si non utilisée directement ici
    app.config['SECRET_KEY'] = 'une-cle-secrete-tres-difficile-a-deviner'

    # Importer et enregistrer le blueprint
    from .main.routes import main as main_blueprint
    app.register_blueprint(main_blueprint)

    return app