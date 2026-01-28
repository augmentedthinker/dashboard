const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const verifyBtn = document.getElementById('verify-btn');
const apiKeyInput = document.getElementById('api-key');
const modelSelect = document.getElementById('model-select');

// Add the Image Generation models to the dropdown from the documentation
const imageModels = [
    { value: 'gemini-2.5-flash-image', text: 'Gemini 2.5 Flash Image' },
    { value: 'gemini-3-pro-image-preview', text: 'Gemini 3 Pro Image (Preview)' }
];

imageModels.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.value;
    opt.innerText = m.text;
    modelSelect.appendChild(opt);
});

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
        console.log("Gemini API Response:", data); // Helpful for debugging in the browser console

        if (data.error) {
            appendMessage('system', `Error: ${data.error.message}`);
        } else if (!data.candidates || data.candidates.length === 0) {
            appendMessage('system', 'No response from model. This usually happens if the prompt is blocked by safety filters.');
        } else {
            const candidate = data.candidates[0];
            
            if (candidate.finishReason === 'SAFETY') {
                appendMessage('system', 'Warning: The response was blocked by safety filters.');
            }

            if (candidate.content && candidate.content.parts) {
                appendMessage('ai', candidate.content.parts);
            }
        }
    } catch (error) {
        appendMessage('system', `Failed to connect: ${error.message}`);
    }
}

function appendMessage(role, content) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    
    // Handle AI response which might be an array (Text + Images)
    if (role === 'ai' && Array.isArray(content)) {
        let textForSpeech = "";
        
        content.forEach(part => {
            if (part.text) {
                const textDiv = document.createElement('div');
                // Use marked if available to render code blocks nicely
                textDiv.innerHTML = typeof marked !== 'undefined' ? marked.parse(part.text) : part.text;
                msgDiv.appendChild(textDiv);
                textForSpeech += part.text + " ";

                // Add "Run Code" buttons to any code blocks found in the AI response
                const codeBlocks = textDiv.querySelectorAll('pre');
                codeBlocks.forEach(pre => {
                    const runBtn = document.createElement('button');
                    runBtn.innerHTML = '<span>▶</span> Run Code';
                    runBtn.className = 'run-code-btn';
                    runBtn.onclick = () => {
                        const code = pre.querySelector('code').innerText;
                        updatePreview(code);
                    };
                    pre.appendChild(runBtn);
                });
            } else if (part.inlineData) {
                const img = document.createElement('img');
                img.src = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                img.className = 'generated-image';
                // Ensure we scroll to the bottom once the image actually loads
                img.onload = () => {
                    chatWindow.scrollTop = chatWindow.scrollHeight;
                };
                msgDiv.appendChild(img);
            }
        });

        // Add Manual "Read Aloud" Button only if there is text to read
        if (textForSpeech.trim()) {
            const ttsBtn = document.createElement('button');
            ttsBtn.className = 'tts-btn';
            ttsBtn.innerHTML = '🔊'; 
            ttsBtn.onclick = () => speakText(textForSpeech);
            msgDiv.appendChild(ttsBtn);
        }

    } else {
        // Fallback for simple string messages (User/System)
        if (role === 'ai' && typeof marked !== 'undefined') {
             msgDiv.innerHTML = marked.parse(content);
        } else {
            msgDiv.innerText = content;
        }
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

// --- Voice Interaction Features ---

// 1. Setup Text-to-Speech
function speakText(text) {
    if (!window.speechSynthesis) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();

    // Create a new utterance
    // We strip out some markdown symbols (* and #) so it doesn't read them literally
    const cleanText = text.replace(/[*#`]/g, ''); 
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Optional: Select a voice (usually the default is fine, but we can list them if needed)
    utterance.rate = 1.0; 
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
}

// 2. Setup Speech-to-Text (Microphone)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop after one sentence
    recognition.lang = 'en-US';

    // Create the Mic Button and inject it before the Send button
    const micBtn = document.createElement('button');
    micBtn.id = 'mic-btn';
    micBtn.innerHTML = '🎤';
    sendBtn.parentNode.insertBefore(micBtn, sendBtn);

    micBtn.addEventListener('click', () => {
        recognition.start();
        micBtn.classList.add('listening');
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        micBtn.classList.remove('listening');
        userInput.focus(); // Focus input so you can press Enter
    };

    recognition.onend = () => {
        micBtn.classList.remove('listening');
    };
} else {
    console.log("Web Speech API not supported in this browser.");
}

// --- Preview Environment Logic ---

function updatePreview(code) {
    const frame = document.getElementById('preview-frame');
    const pane = document.getElementById('preview-pane');
    if (!frame || !pane) return;

    // 1. Automatically open the pane if it's hidden
    pane.classList.remove('collapsed');

    // 2. Use srcdoc to safely render the code (fixes the "not functional" issue)
    frame.srcdoc = code;
}

function initPreview() {
    const container = document.querySelector('.container');
    if (!container || document.getElementById('chat-pane')) return;

    // 1. Wrap existing content into a chat pane
    const chatPane = document.createElement('div');
    chatPane.id = 'chat-pane';
    while (container.firstChild) {
        chatPane.appendChild(container.firstChild);
    }

    // 2. Create the preview pane
    const previewPane = document.createElement('div');
    previewPane.id = 'preview-pane';
    previewPane.innerHTML = `
        <div class="preview-header">
            <h1 style="font-size: 0.9rem;">Live Preview</h1>
            <div style="display: flex; gap: 5px;">
                <button id="clear-preview" style="padding: 4px 12px; font-size: 0.7rem;">Clear</button>
                <button id="minimize-preview" style="padding: 4px 12px; font-size: 0.7rem;">_</button>
            </div>
        </div>
        <iframe id="preview-frame" sandbox="allow-scripts allow-modals"></iframe>
    `;

    container.appendChild(chatPane);
    container.appendChild(previewPane);
    
    // Start collapsed so it doesn't take up space until needed
    previewPane.classList.add('collapsed');

    document.getElementById('clear-preview').onclick = () => updatePreview('');
    document.getElementById('minimize-preview').onclick = () => previewPane.classList.toggle('collapsed');
}

// --- Background Particle Animation ---

const canvas = document.createElement('canvas');
canvas.id = 'bg-canvas';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

let particles = [];
let ripples = [];
const particleCount = 80; // Slightly more particles
const rippleCount = 5;    // Number of simultaneous ripples

class Particle {
    constructor() {
        this.init();
    }

    init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 2; // Larger particles
        this.speedX = Math.random() * 1.2 - 0.6; // Faster movement
        this.speedY = Math.random() * 1.2 - 0.6;
        this.hue = Math.random() * 360;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Faster color cycling
        this.hue += 0.5;

        // If particle goes off screen, reset it to a new position
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.init();
        }
    }

    draw() {
        ctx.fillStyle = `hsla(${this.hue}, 90%, 70%, 0.5)`; // More vibrant and opaque
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Ripple {
    constructor() {
        this.init();
    }

    init() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = 0;
        this.maxRadius = Math.random() * 400 + 200;
        this.speed = Math.random() * 1 + 0.5;
        this.opacity = 0.4;
        this.hue = Math.random() * 360;
    }

    update() {
        this.radius += this.speed;
        this.opacity -= 0.002; // Fade out slowly
        this.hue += 0.3;

        if (this.opacity <= 0) {
            this.init();
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${this.hue}, 80%, 60%, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    ripples.forEach(r => {
        r.update();
        r.draw();
    });
    requestAnimationFrame(animate);
}

window.addEventListener('resize', handleResize);
handleResize();
initPreview(); // Initialize the split-pane layout
for (let i = 0; i < particleCount; i++) particles.push(new Particle());
for (let i = 0; i < rippleCount; i++) ripples.push(new Ripple());
animate();