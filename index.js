// DOM
const chatForm = document.querySelector('#chat-form');
const chatInput = document.querySelector('#chat-input');
const chatSend = document.querySelector('#chat-send');
const messageContainer = document.querySelector('.messages');
const sendImg = document.querySelector('#send-img');
const loader = document.querySelector('.loader');

// OpenAI API
const OPENAI_MODEL = 'gpt-3.5-turbo'; 
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
let apiKey = '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';
const messages = [];

// Google Calendar
async function initializeGoogleApi() {
    try {
        await gapi.load('client:auth2');
        await gapi.client.init({
            apiKey: "AIzaSyDyPrQz4_vogabKuLybXuzWJaL0ZX1doP4",
            clientId: "260877479525-i312eu1r4c0kc2n92r6rp9de5flkp99q.apps.googleusercontent.com",
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
            scope: "https://www.googleapis.com/auth/calendar.events"
        });
        console.log("Google API client loaded.");
    } catch (error) {
        console.error("Error loading Google API client", error);
    }
}

function authenticateGoogleApi() {
    return new Promise((resolve, reject) => {
        const authInstance = gapi.auth2.getAuthInstance();
        if (!authInstance) {
            reject(new Error("Google Auth instance not initialized"));
            return;
        }
        authInstance.signIn().then(resolve, error => {
            console.error("Detailed Google Auth signIn error:", error);
            reject(new Error(`Authentication failed: ${error ? error.error : 'unknown error'}`));
        });
    });
}

function createGoogleCalendarEvent(dateInfo) {
    return new Promise((resolve, reject) => {
        const event = {
            'summary': 'Scheduled Appointment',
            'start': {
                'dateTime': `${dateInfo.year}-${dateInfo.month}-${dateInfo.day}T${dateInfo.time}:00`, 
                'timeZone': 'America/Los_Angeles'
            },
            'end': {
                'dateTime': `${dateInfo.year}-${dateInfo.month}-${dateInfo.day}T${(parseInt(dateInfo.time.split(':')[0]) + 1).toString().padStart(2, '0')}:00`, 
                'timeZone': 'America/Los_Angeles'
            },
        };

        var request = gapi.client.calendar.events.insert({
            'calendarId': 'primary',
            'resource': event
        });

        request.execute(function(event) {
            resolve(event);
            window.open(event.htmlLink);
        }, function(error) {
            console.error("Error creating event on Google Calendar", error);
            reject(error);
        });
    });
}

async function scheduleEvent() {
    const month = document.getElementById("month").value;
    const day = document.getElementById("day").value;
    const year = document.getElementById("year").value;
    const time = document.getElementById("time").value;

    const dateInfo = {
        month: month, 
        day: day,
        year: year,
        time: time
    };

    try {
        await initializeGoogleApi();
        await authenticateGoogleApi();
        await createGoogleCalendarEvent(dateInfo);
    } catch (error) {
        console.error("There was an error scheduling the event:", error);
    }
}

function addMessage(message, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
    messageDiv.textContent = message;
    messageContainer.appendChild(messageDiv);

    // Scroll to the bottom of the chat container
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function handleUserInput(event) {
    event.preventDefault();
    const message = chatInput.value.trim();
    const INSTRUCTIONS = "Roleplay as a doctor..."; // [Keep your instructions here]
    
    if (message !== '') {
        messages.push({
            'role': 'user',
            'content': INSTRUCTIONS + message
        });
        addMessage(message, true);
        chatInput.value = '';
        showLoader();

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

function showLoader() {
    loader.style.display = 'inline-block';
    chatSend.disabled = true;
}

function hideLoader() {
    loader.style.display = 'none';
    chatSend.disabled = false;
}

function checkAPIKey() {
    if (!apiKey) apiKey = prompt('Please input OpenAI API Key.');
    if (!apiKey) alert('You have not entered the API Key. The application will not work.');
}

initializeGoogleApi();

// Add an event listener to the form
chatForm.addEventListener('submit', handleUserInput);

// check
checkAPIKey();

