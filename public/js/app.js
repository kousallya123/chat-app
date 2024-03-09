// WebSocket connection and chat variables
let ws;
let currentChatUser;
const username = localStorage.getItem('username');

// Event listener for signup button
async function signup() {
  // Retrieve signup input elements
  const signupUsernameInput = document.getElementById('signupUsername');
  const signupPasswordInput = document.getElementById('signupPassword');

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
      console.error('Signup failed:', response.statusText);
      // Handle signup failure
    }
  } catch (error) {
    console.error('Error during signup:', error);
    // Handle other errors
  }
}

// Event listener for login button
async function login() {
  const loginUsername = document.getElementById('loginUsername').value;
  const loginPassword = document.getElementById('loginPassword').value;

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
      console.error('Login failed:', response.statusText);
      // Handle login failure
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
        if (message.from === currentChatUser ) {
          displayMessage({'content': `${message.content}`});
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
  const chatMessages = document.getElementById('chatMessages');
  chatMessages.innerHTML = `Chatting with ${recipientUsername}<br>`;
}

// Send a message
function sendMessage() {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();

  if (message && currentChatUser && ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'message',
      content: message,
      to: currentChatUser,
    }));
    displayMessage({ content: `${message}`,to:username });
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
  messageDiv.classList.add('p-1', 'text-white','mt-2');

  // Set the content of the message
  const messageContent = document.createElement('p');
  messageContent.textContent = message.content 
  // Determine alignment and style based on the sender
  if (message.to === username) {
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

