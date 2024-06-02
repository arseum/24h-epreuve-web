from flask import Flask
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config['SECRET_KEY'] = 'secret!'

    from routes.general import main_bp
    app.register_blueprint(main_bp)

    return app
