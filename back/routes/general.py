from flask import Blueprint, request, jsonify

from model.player import Player
from model.serveur import Serveur

main_bp = Blueprint('general', __name__)
SERVEUR = Serveur()
PLAYER = Player(1, 0, 0)


@main_bp.route('/hello', methods=['GET'])
def index():
    name = request.args.get('hello', 'World')
    return f"Hello {name}", 200


@main_bp.route('/get-update', methods=['GET'])
def get_update():
    return jsonify(SERVEUR.get_state(3, 5)), 200


@main_bp.route('/move', methods=['POST'])
def move():
    print(request.data)
    return


@main_bp.route('/teleport', methods=['POST'])
def teleport():
    PLAYER.x = request.values['x']
    PLAYER.y = request.values['y']
    SERVEUR.put_principale_player(PLAYER)
    try:
        state = SERVEUR.get_state(int(PLAYER.x), int(PLAYER.y))
        SERVEUR.put_principale_player(PLAYER)
        return jsonify(state), 200
    except ValueError:
        erreur = "ERREUR x ou y n'est pas au format int : x={}, y={}".format(PLAYER.x, PLAYER.y)
        print(erreur)
        return erreur, 500
