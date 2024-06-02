from flask import Blueprint, request, jsonify

from serveur import Serveur

main_bp = Blueprint('general', __name__)
SERVEUR = Serveur()


@main_bp.route('/hello', methods=['GET'])
def index():
    name = request.args.get('hello', 'World')
    return f"Hello {name}", 200


@main_bp.route('/get-update', methods=['GET'])
def get_update():
    data = SERVEUR.map_dev
    data['test_get_update_0'] = True
    return jsonify(data), 200
