const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const verifyBtn = document.getElementById('verify-btn');
const apiKeyInput = document.getElementById('api-key');
const modelSelect = document.getElementById('model-select');

async function sendMessage() {
    const text = userInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    const model = modelSelect.value;

    if (!text) return;
    if (!apiKey) {
        alert("Please enter an API key first!");
        return;
    }

    // 1. Add user message to UI
    appendMessage('user', text);
    userInput.value = '';

    // 2. Prepare the API request
    // The URL includes the model name and your API key
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [{
            parts: [{ text: text }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (data.error) {
            appendMessage('system', `Error: ${data.error.message}`);
        } else {
            // Gemini's response is nested deep in the object:
            const aiResponse = data.candidates[0].content.parts[0].text;
            appendMessage('ai', aiResponse);
        }
    } catch (error) {
        appendMessage('system', `Failed to connect: ${error.message}`);
    }
}

function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    
    // If it's the AI, parse the Markdown into HTML. Otherwise, keep it plain text.
    if (role === 'ai' && typeof marked !== 'undefined') {
        msgDiv.innerHTML = marked.parse(text);
    } else {
        msgDiv.innerText = text;
    }

    chatWindow.appendChild(msgDiv);
    
    // Scroll to the bottom so we see the new message
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function verifyConnection() {
    const apiKey = apiKeyInput.value.trim();
    const model = modelSelect.value;

    if (!apiKey) {
        alert("Please enter an API key first!");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // We ask the model to echo its ID to confirm the pipeline is working
    const requestBody = {
        contents: [{
            parts: [{ text: `Reply with exactly this string and nothing else: ${model}` }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (data.error) {
            appendMessage('system', `Verification Error: ${data.error.message}`);
        } else {
            const aiResponse = data.candidates[0].content.parts[0].text;
            appendMessage('system', `Verified: ${aiResponse}`);
        }
    } catch (error) {
        appendMessage('system', `Connection Failed: ${error.message}`);
    }
}

sendBtn.addEventListener('click', sendMessage);
verifyBtn.addEventListener('click', verifyConnection);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});