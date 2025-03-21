const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
 
// Keep track of all connected clients
const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('New client connected');
    
    ws.send('Connected to WebSocket server!');

    ws.on('message', (message) => {
        try {
            // Broadcast the message to all connected clients
            const messageData = JSON.parse(message);
            clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(messageData));
                }
            });
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});