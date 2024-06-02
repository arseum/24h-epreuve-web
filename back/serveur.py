import json


def load_map_dev():
    with open('ressources/map_dev.json', 'r') as f:
        return json.load(f)


class Serveur(object):
    def __init__(self):
        self.map_dev = load_map_dev()
