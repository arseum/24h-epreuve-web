let start = false;
const codeDejaEnvoyer = []

function sendMessage(message) {
    fetch('https://24hweb.iutv.univ-paris13.fr/server/say', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'TeamPassword': localStorage.getItem('teamPassword'),
            'TeamPlayerNb': localStorage.getItem('playerNumber')
        },
        body: JSON.stringify(message)
    })
        .then(response => {
            if (response["status"] === 200) {
                console.log("message envoyer !")
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function updateMessagerie(message) {
    document.getElementById('general-message').innerHTML = '';
    document.getElementById('important-message').innerHTML = '';
    for (let index = 0; index < message["messages"].length; index++) {
        if (message["messages"][index]["important"]) {
            let text = message["messages"][index]["text"];
            document.getElementById('important-message').innerHTML += text + '<br>';
            if (text.startsWith("Code anti-poison") || text.startsWith("Nouveau code")) {
                let code = text.match(/\d+/g);
                for (const v of code) {
                    if (!codeDejaEnvoyer.includes(v)) {
                        let m = {
                            'message': v
                        }
                        codeDejaEnvoyer.push(v);
                        console.log(m);
                        sendMessage(m);
                    }
                }
            }


        }
    }
}

async function fetchData() {
    try {
        const response = await fetch('https://24hweb.iutv.univ-paris13.fr/server/get-update', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer votre_token',
                'Custom-Header': 'ValeurCustom',
                'TeamPassword': localStorage.getItem('teamPassword'),
                'TeamPlayerNb': localStorage.getItem('playerNumber')
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('There was a problem with your fetch operation:', error);
        return null;
    }
}

function innitMap(map) {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const tileSize = 16
    const tileset = new Image();
    tileset.src = '../ressources/tileset.png';

    canvas.width = map["layers"][0]["view"].length * tileSize
    canvas.height = map["layers"][0]["view"].length * tileSize
    tileset.onload = function () {
        for (let index = 0; index < map["layers"].length; index++) {
            layer = map["layers"][index]["view"]
            for (let row = 0; row < layer.length; row++) {
                for (let col = 0; col < layer[row].length; col++) {
                    const tileId = layer[row][col];
                    if (tileId !== -1) {
                        const tilesPerRow = tileset.width / tileSize;
                        const sourceX = (tileId % tilesPerRow) * tileSize;
                        const sourceY = Math.floor(tileId / tilesPerRow) * tileSize;
                        const destX = col * tileSize;
                        const destY = row * tileSize;
                        ctx.drawImage(tileset, sourceX, sourceY, tileSize, tileSize, destX, destY, tileSize, tileSize);
                    }
                }
            }
        }
        for (let i = 0; i < map["players"].length; i++) {
            player = map["players"][i]
            if (player["team"] === "Bober Kurwa") {
                const tilesPerRow = tileset.width / tileSize;
                tileId = 99
                const sourceX = (tileId % tilesPerRow) * tileSize;
                const sourceY = Math.floor(tileId / tilesPerRow) * tileSize;
                const destX = player["viewX"] * tileSize;
                const destY = player["viewY"] * tileSize;
                ctx.drawImage(tileset, sourceX, sourceY, tileSize, tileSize, destX, destY, tileSize, tileSize)
            }
        }
    };
}

function updateMap() {
    console.log('update');
    fetchData().then(data => {
        if (data) {
            innitMap(data);
            updateMessagerie(data["player"])
        } else {
            console.log('Failed to fetch the map.');
        }
    });
}

// Initialisation de la connexion WebSocket
function innitWebSocket() {
    function throttle(func, limit) {
        let lastFunc;
        let lastRan;
        return function (...args) {
            const context = this;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(function () {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }

    function sendMessage(message) {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(message);
        } else {
            console.log('WebSocket is not open.');
        }
    }

    const socket = new WebSocket('wss://24hweb.iutv.univ-paris13.fr/server');

    socket.onopen = function (event) {
        console.log('WebSocket is open now.');
        let auth = {
            action: "register",
            teamPassword: localStorage.getItem('teamPassword'),
            teamPlayerNb: localStorage.getItem('playerNumber')
        }
        sendMessage(JSON.stringify(auth))
    };

// Événement déclenché lorsque la connexion est fermée
    socket.onclose = function (event) {
        console.log('WebSocket is closed now.');
    };

    const throttledUpdateMap = throttle(updateMap, 1000);
// Événement déclenché lorsque des données sont reçues du serveur
    socket.onmessage = function (event) {
        // console.log(event.data);
        if (event.data === 'redraw' && start) {
            // updateMap();
            throttledUpdateMap();
        }
    };

// Événement déclenché en cas d'erreur
    socket.onerror = function (error) {
        console.log('WebSocket error: ', error);
    };
}

document.addEventListener('DOMContentLoaded', function () {
    const playerForm = document.getElementById('player-form');
    const messageForm = document.getElementById('message-form');

    playerForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const playerName = document.getElementById('playerName').value;
        const playerNumber = document.getElementById('playerNumber').value;
        const teamPassword = document.getElementById('teamPassword').value;

        localStorage.setItem('playerName', playerName);
        localStorage.setItem('playerNumber', playerNumber);
        localStorage.setItem('teamPassword', teamPassword);

        start = true;
        updateMap();
        innitWebSocket()
    });

    messageForm.addEventListener('submit', function (event) {
        event.preventDefault();

        let m = {
            'message': document.getElementById('message').value
        }
        sendMessage(m);
    });
});

function sendMoveRequest(direction) {
    fetch('https://24hweb.iutv.univ-paris13.fr/server/move', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'TeamPassword': localStorage.getItem('teamPassword'),
            'TeamPlayerNb': localStorage.getItem('playerNumber')
        },
        body: JSON.stringify(direction)
    })
        .then(response => {
            if (response["status"] === 200) {
                updateMap()
            }
        })

        .catch(error => {
            console.error('Error:', error);
        });
}


document.addEventListener('keydown', function (event) {

    const directionMap = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right'
    };
    if (event.key in directionMap) {
        const direction = directionMap[event.key];
        const body = {
            'direction': direction
        }
        sendMoveRequest(body);
    }
});
