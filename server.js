const WebSocket = require('ws');
const server = new WebSocket.Server({port: 3000});
let users = [];

server.on('connection', ws => {
    ws.on('message', message => {
        server.clients.forEach(client => {
            if(client.readyState === WebSocket.OPEN) {
                let model = JSON.parse(message);
                let command = model.command;
                // delete model.command;
                let user = findUserByName(model.name);

                if (command === 'removeUser') {
                    removeUser(model.name);
                } else if (command === 'setPosition' && model.name) {
                    removeUser(model.name);
                    users.push(model);
                } else if (command === 'saveName' && !user) {
                    users.push(model);
                } else if (command === 'restoreName' && user) {
                    user.command = command;
                }

                console.log('users', command, users);
                client.send(JSON.stringify(users));
            }
        })
    });

    // console.log('boom', users);
    // ws.send(JSON.stringify(users));
});

function findUserByName(name) {
    return users.find(i => i.name === name);
}
function removeUser(name) {
    users = users.filter(function(obj) {
        return obj.name !== name;
    });
}