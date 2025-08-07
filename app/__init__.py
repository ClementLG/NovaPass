# app/__init__.py
from flask import Flask
from flasgger import Swagger
from .config import Config


def create_app():
    """Crée et configure l'instance de l'application Flask."""
    app = Flask(__name__)
    app.config.from_object(Config)
    swagger = Swagger(app)

    # La SECRET_KEY peut être définie dans le fichier de config, mais on la garde ici pour l'exemple
    if 'SECRET_KEY' not in app.config:
        app.config['SECRET_KEY'] = 'une-cle-secrete-tres-difficile-a-deviner'

    # Importer et enregistrer le blueprint
    from .main.routes import main as main_blueprint
    app.register_blueprint(main_blueprint)

    return app