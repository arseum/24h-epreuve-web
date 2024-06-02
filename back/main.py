from flask_socketio import SocketIO
from app import create_app

app = create_app()
socketio = SocketIO(app, async_mode='eventlet')


if __name__ == '__main__':
    socketio.run(app, host='127.0.0.1', port=8080, use_reloader=False, log_output=True)
