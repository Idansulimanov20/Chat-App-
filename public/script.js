const chat = document.getElementById('chat');
const users = document.getElementById('users');
const input = document.getElementById('input');
const sendBtn = document.getElementById('sendBtn');
const ws = new WebSocket('ws://localhost:4000');
let username = '';

ws.addEventListener('message', (event) => {
    const message = event.data;

    if (message.startsWith('Users online:')) {
        users.innerHTML = `<strong>Users Online:</strong><br>${message.replace('Users online: ', '').replace(/, /g, '<br>')}`;
    } else {
        const msgDiv = document.createElement('div');
        msgDiv.textContent = message;
        msgDiv.className = message.includes(username) ? 'my-message' : 'other-message';
        chat.appendChild(msgDiv);
        chat.scrollTop = chat.scrollHeight;
    }
});

sendBtn.addEventListener('click', () => {
    if (!username) {
        username = input.value.trim();
        if (!username) return;
        ws.send(username);
        input.placeholder = 'Type a message...';
        input.value = '';
    } else {
        if (input.value.trim()) {
            ws.send(input.value);
            input.value = '';
        }
    }
});

input.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') sendBtn.click();
})
