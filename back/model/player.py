class Player(object):
    id: int
    x: int
    y: int
    last_direction: str
    messages: []

    def __init__(self, inp_id, x, y):
        self.id = inp_id
        self.x = x
        self.y = y
        self.last_direction = ""
        self.messages = []

    def to_json_format(self):
        return {
            "id": self.id,
            "x": self.x,
            "y": self.y,
            "last_direction": self.last_direction,
            "messages": self.messages
        }
