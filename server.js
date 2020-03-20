const WebSocket = require('ws');
const server = new WebSocket.Server({port: 3000});
let users = [];

server.on('connection', ws => {
    ws.on('message', message => {
        server.clients.forEach(client => {
            if(client.readyState === WebSocket.OPEN) {
                let data = JSON.parse(message);
                let user = findUserByName(data.name);
                if (data.command === 'removeUser') {
                    removeUser(data.name);
                } else if (user) {
                    console.log('update', data);
                    user.score = data.score;
                    user.top = data.top;
                    user.left = data.left;
                    // user = data;
                } else {
                    users.push(data);
                }

                console.log('update', users);
                client.send(JSON.stringify(users));
            }
        })
    });

    console.log('boom', users);
    ws.send(JSON.stringify(users));
});

function findUserByName(name) {
    return users.find(i => i.name === name);
}
function removeUser(name) {
    users = users.filter(function(obj) {
        return obj.name !== name;
    });
}