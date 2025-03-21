document.addEventListener('DOMContentLoaded', () => {
    const status = document.getElementById('status');
    const messages = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    // Prompt for username
    const username = prompt('Enter your username:') || 'Anonymous';
    
    // Create WebSocket connection
    const socket = new WebSocket(`ws://localhost:3000`);
    
    // Connection opened
    socket.addEventListener('open', (event) => {
        updateStatus(true);
    });
    
    // Listen for messages
    socket.addEventListener('message', (event) => {
        const message = event.data;
        
        // Check if it's the welcome message
        if (message === 'Connected to WebSocket server!') {
            displayMessage(message, 'server');
            // Announce this user joined the chat
            socket.send(JSON.stringify({
                type: 'system',
                content: `${username} has joined the chat`
            }));
        } else {
            try {
                // Try to parse as JSON
                const parsedMessage = JSON.parse(message);
                
                if (parsedMessage.type === 'system') {
                    // System message
                    displayMessage(parsedMessage.content, 'system');
                } else if (parsedMessage.type === 'chat') {
                    // Chat message from another user
                    const fromSelf = parsedMessage.username === username;
                    displayMessage(`${parsedMessage.username}: ${parsedMessage.content}`, fromSelf ? 'user' : 'received');
                }
            } catch (e) {
                // Legacy format or plain text
                displayMessage(message, 'received');
            }
        }
    });
    
    // Connection closed
    socket.addEventListener('close', (event) => {
        updateStatus(false);
        displayMessage('Disconnected from server', 'server');
    });
    
    // Connection error
    socket.addEventListener('error', (event) => {
        updateStatus(false);
        displayMessage('WebSocket error', 'server');
        console.error('WebSocket error:', event);
    });
    
    // Send message when button is clicked
    sendButton.addEventListener('click', sendMessage);
    
    // Send message when Enter key is pressed
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Send message function
    function sendMessage() {
        const content = messageInput.value.trim();
        
        if (content && socket.readyState === WebSocket.OPEN) {
            // Create a message object with username
            const messageObj = {
                type: 'chat',
                username: username,
                content: content
            };
            
            // Send as JSON
            socket.send(JSON.stringify(messageObj));
            
            // Clear the input field
            messageInput.value = '';
        }
    }
    
    // Update connection status
    function updateStatus(connected) {
        status.textContent = connected ? 'Connected' : 'Disconnected';
        status.className = `status ${connected ? 'connected' : 'disconnected'}`;
    }
    
    // Display message in the UI
    function displayMessage(message, type) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.className = `message ${type}-message`;
        messages.appendChild(messageElement);
        
        // Scroll to bottom
        messages.scrollTop = messages.scrollHeight;
    }
});