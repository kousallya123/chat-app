// WebSocket connection and chat variables
let ws;
let currentChatUser;
const username = localStorage.getItem('username');
const messageHistory = {};

// Event listener for signup button
async function signup() {
  // Retrieve signup input elements
  const signupUsernameInput = document.getElementById('signupUsername');
  const signupPasswordInput = document.getElementById('signupPassword');
  const errorDisplay = document.getElementById('signupErrorDisplay')

  errorDisplay.textContent = '';

  if (!signupUsernameInput || !signupPasswordInput) {
    console.error('Error: Input elements not found');
    return;
  }

  const signupUsername = signupUsernameInput.value;
  const signupPassword = signupPasswordInput.value;

  try {
    const response = await fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: signupUsername, password: signupPassword }),
    });

    if (response.ok) {
      console.log('Signup successful');
      window.location.href = '/'
    } else {
      const errorMessage = await response.text();
      console.error('Signup failed:', errorMessage);
      // Display the error message to the user
      errorDisplay.textContent = errorMessage;
    }
  } catch (error) {
    console.error('Error during signup:', error);
    // Handle other errors
  }
}

// Event listener for login button
async function login() {
  const loginUsernameInput = document.getElementById('loginUsername');
  const loginPasswordInput = document.getElementById('loginPassword');
  const loginErrorDisplay = document.getElementById('loginErrorDisplay');

  const loginUsername = loginUsernameInput.value;
  const loginPassword = loginPasswordInput.value;

  loginErrorDisplay.textContent = '';

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: loginUsername, password: loginPassword }),
    });

    if (response.ok) {
      console.log('Login successful');
      localStorage.setItem('username', loginUsername);
      window.location.href = '/chat';
    } else {
      const errorMessage = await response.text();
      console.error('Login failed:', errorMessage);

      // Display the login error message
      loginErrorDisplay.textContent = errorMessage;
    }
  } catch (error) {
    console.error('Error during login:', error);
    // Handle other errors
  }
}


// Initialize WebSocket connection for chat
function initializeChat() {
  ws = new WebSocket(`ws://localhost:3000/${username}`);
  // WebSocket event listeners
  ws.onopen = () => {
    console.log('Connected to the server');
  };

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      if (message && message.type === 'message') {
        // Save the received message in the message history
        const receivedMessage = { content: message.content, to: username, from: message.from };
        if (!messageHistory[message.from]) {
          messageHistory[message.from] = []; // Initialize as an array if not exists
        }
        messageHistory[message.from].push(receivedMessage);

        // Display the received message in the chat
        if (currentChatUser === message.from) {
          displayMessage(receivedMessage);
        }


      } else {
        console.error('Invalid message format:', message);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  ws.onclose = () => {
    console.log('Connection closed');
    alert('WebSocket connection closed. Please refresh the page.');
    location.reload();
  };
}
// Check if a username is present in localStorage
const storedUsername = localStorage.getItem('username');


// Logout function
function logout() {
  localStorage.removeItem('username')
  window.location.href = '/';
}

// Fetch user list and initialize chat
async function fetchUsers() {
  try {
    const response = await fetch('/allusers');
    const allUsers = await response.json();

    // Get the current user's username from localStorage
    const currentUser = localStorage.getItem('username');

    // Initialize chat after fetching user list
    initializeChat();

    const allUsersList = document.getElementById('allUsers');
    allUsersList.innerHTML = '';

    // Create list items for each user, excluding the current user
    allUsers
      .filter((username) => username !== currentUser)
      .forEach((username) => {
        const listItem = document.createElement('li');
        listItem.textContent = username;
        listItem.className = 'cursor-pointer mt-2 hover:bg-blue-300 bg-gray-300 p-2 rounded transition duration-300';
        listItem.onclick = () => startChat(username);
        allUsersList.appendChild(listItem);
      });
  } catch (error) {
    console.error('Error fetching user list:', error);
    // Handle error fetching user list
  }
}


// Start chat with a specific user
function startChat(recipientUsername) {
  currentChatUser = recipientUsername;
  const chatHeader = document.getElementById('chatHeader');
  chatHeader.innerHTML = `Chatting with ${recipientUsername}<br>`;
  chatHeader.className = 'cursor-pointer text-lg mt-2 p-2 rounded font-bold text-blue-700 transition duration-300';

  // Clear previous messages
  const chatMessages = document.getElementById('chatMessages');
  chatMessages.innerHTML = '';

  // Display messages for the selected user
  if (messageHistory[recipientUsername]) {
    messageHistory[recipientUsername].forEach(message => displayMessage(message));
  }
}

// Send a message
function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const messageContent = messageInput.value.trim();

  if (messageContent && currentChatUser && ws && ws.readyState === WebSocket.OPEN) {
    // Save the sent message in the message history
    const sentMessage = { content: messageContent, to: currentChatUser, from: username };
    if (!messageHistory[currentChatUser]) {
      messageHistory[currentChatUser] = [];
    }
    messageHistory[currentChatUser].push(sentMessage);

    // Send the message via WebSocket
    ws.send(JSON.stringify({
      type: 'message',
      content: messageContent,
      to: currentChatUser,
    }));

    // Display the sent message in the chat
    displayMessage(sentMessage);

    // Clear the input field
    messageInput.value = '';
  }
}


// Display a message in the chat
function displayMessage(message) {
  const chatMessages = document.getElementById('chatMessages');

  // Create a div element for the message container
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('mb-4', 'clear-both');

  // Create a div element for the message
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('p-1', 'text-white', 'mt-2', 'font-semibold', 'text-md', 'mx-[2rem]');

  // Set the content of the message
  const messageContent = document.createElement('p');
  messageContent.textContent = message.content
  // Determine alignment and style based on the sender
  if (message.to !== username) {
    messageDiv.classList.add('bg-gray-400', 'rounded-br-lg', 'rounded-tl-lg', 'float-right');
  } else {
    messageDiv.classList.add('bg-blue-400', 'rounded-bl-lg', 'rounded-tr-lg', 'float-left');
  }

  // Append the message content to the message div
  messageDiv.appendChild(messageContent);

  // Append the message div to the message container
  messageContainer.appendChild(messageDiv);

  // Append the message container to the chatMessages container
  chatMessages.appendChild(messageContainer);

  // Scroll to the bottom to show the latest message
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

