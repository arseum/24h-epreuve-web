import json

from model.player import Player


def load_json_file(name):
    with open(f'ressources/{name}.json', 'r') as f:
        return json.load(f)


class Serveur(object):
    def __init__(self):
        self.state = load_json_file('state')
        self.map_dev = load_json_file('map-dev')

    def add_player(self, player: Player):
        self.state['players'].append(player.to_json_format())

    def get_state(self, x: int, y: int):

        temp_state = self.state

        layers = [[x["data"][x['width'] * i:x['width'] * (i + 1)] for i in range(x['height'])] for x in
                  self.map_dev['layers']]
        pov = [[[0 for _ in range(21)] for _ in range(21)] for _ in range(3)]

        for i in range(-10, 11):
            for j in range(-10, 11):
                for k in range(3):
                    pov[k][i + 10][j + 10] = layers[k][y + i][x + j] - 1 if (0 <= y + i <= len(
                        layers[k]) and 0 <= x + j <= len(layers[k][y + i])) else -1

        for k in range(3):
            temp_state["layers"][k]["view"] = pov[k]

        return temp_state

    def put_principale_player(self, player: Player):
        self.state['player']['id'] = player.id
        self.state['player']['x'] = player.x
        self.state['player']['y'] = player.y
        self.state['player']['messages'] = player.messages

        ids = [p['id'] for p in self.state['players']]

        if player.id in ids:
            index = ids.index(player.id)
            self.state['players'][index]['x'] = player.x
            self.state['players'][index]['y'] = player.y
            self.state['players'][index]['messages'] = player.messages
            self.state['players'][index]['last_direction'] = player.last_direction
        else:
            self.state['players'].append(player.to_json_format())
