// DOM
const chatForm = document.querySelector('#chat-form');
const chatInput = document.querySelector('#chat-input');
const chatSend = document.querySelector('#chat-send');
const messageContainer = document.querySelector('.messages');
const sendImg = document.querySelector('#send-img');
const loader = document.querySelector('.loader');

// OpenAI API
const OPENAI_MODEL = 'gpt-3.5-turbo'; // gpt-3.5-turbo, gpt-3.5-turbo-0301
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
// Input Your OpenAI API Key Here. 
// You can sign up and get API Key from here 
// https://platform.openai.com/account/api-keys
let apiKey = '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';
const messages = []; // store previous messages to remember whole conversation

// Function to add a chat message to the container
function addMessage(message, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
    messageDiv.textContent = message;
    messageContainer.appendChild(messageDiv);

    // Scroll to the bottom of the chat container
    messageContainer.scrollTop = messageContainer.scrollHeight;
}


// Function to handle user input
function handleUserInput(event) {
    event.preventDefault();
    const message = chatInput.value.trim();
    INSTRUCTIONS = "Roleplay as a doctor answering a patient's questions who doesn't understand complicated medical terminology. You are the doctor, not the patient. Respond to my questions accordingly."
    if (message !== '') {
        messages.push({
            'role': 'user',
            'content': INSTRUCTIONS + message
        });
        addMessage(message, true);
        chatInput.value = '';
        showLoader();
        // Other request body from here https://platform.openai.com/docs/api-reference/chat/create
        fetch(OPENAI_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify({ 
                'model': OPENAI_MODEL,
                'messages': messages
            })
        })
        .then(response => response.json())
        .then(data => {
            hideLoader();
            const responseMessage = data.choices[0].message;
            addMessage(responseMessage.content, false);
            messages.push(responseMessage);
        })
        .catch(() => {
            hideLoader();
            addMessage('Oops! Something went wrong. Please try again later.', false);
        });
    }
}

function addMessage(text, isUser) {
    const chatbubbleDiv = document.createElement('div');
    const chatbubbleContent = document.createElement('p'); 

    chatbubbleDiv.classList.add('chatbubble');
    chatbubbleDiv.classList.add(isUser ? 'user-message' : 'bot-message');

    chatbubbleContent.textContent = text;
    chatbubbleDiv.appendChild(chatbubbleContent);
    messageContainer.appendChild(chatbubbleDiv);

    // Scroll to the bottom of the chat container
    messageContainer.scrollTop = messageContainer.scrollHeight;
}



// Function to show the loader icon
function showLoader() {
    loader.style.display = 'inline-block';
    chatSend.disabled = true;
}

// Function to hide the loader icon
function hideLoader() {
    loader.style.display = 'none';
    chatSend.disabled = false;
}

// Ask user to input his/her API Key
function checkAPIKey() {
    if (!apiKey) apiKey = prompt('Please input OpenAI API Key.');
    if (!apiKey) alert('You have not entered the API Key. The application will not work.');
}

// Add an event listener to the form
chatForm.addEventListener('submit', handleUserInput);

// check
checkAPIKey();