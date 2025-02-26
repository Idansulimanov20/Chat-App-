const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('public'));

const server = app.listen(4000, () => console.log('Server running on port 4000'));

const wss = new WebSocketServer({ server });
const clients = new Map();

wss.on('connection', (ws) => {
    console.log('New client connected');

    function requestUsername() {
        ws.send('Enter your username:');
    }

    function handleUsername(message) {
        const username = message.toString().trim();

        if ([...clients.values()].includes(username)) {
            ws.send('Username already taken. Try another one.');
            return;
        }

        clients.set(ws, username);
        console.log(`User connected: ${username}`);

        ws.removeListener('message', handleUsername);

        broadcastUserList();
        broadcast(`${username} joined the chat!`);

        ws.on('message', (msg) => {
            const text = msg.toString();

            if (text.startsWith('@')) {
                const [targetUser, ...messageParts] = text.split(' ');
                const recipientName = targetUser.slice(1);
                const messageText = messageParts.join(' ');

                const recipientSocket = [...clients.entries()].find(([client, name]) => name === recipientName)?.[0];

                if (recipientSocket) {
                    recipientSocket.send(`(Private) ${username}: ${messageText}`);
                    ws.send(`(Private to ${recipientName}) ${messageText}`);
                } else {
                    ws.send(`User ${recipientName} not found.`);
                }
            } else {
                broadcast(`${username}: ${text}`);
            }
        });

        ws.on('close', () => {
            console.log(`User disconnected: ${username}`);
            clients.delete(ws);
            broadcast(`${username} left the chat.`);
            broadcastUserList();
        });
    }

    ws.on('message', handleUsername);
    requestUsername();
});

function broadcast(message) {
    clients.forEach((username, client) => {
        if (client.readyState === 1) {
            client.send(message);
        }
    });
}

function broadcastUserList() {
    const userList = [...clients.values()].join(', ');
    clients.forEach((username, client) => {
        if (client.readyState === 1) {
            client.send(`Users online: ${userList}`);
        }
    });
}
