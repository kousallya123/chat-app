# Real-Time Chat Application Documentation

## Project Overview:

The Real-Time Chat Application is a simple web-based chat system that enables users to engage in one-on-one real-time conversations. The application is built using native WebSockets in Node.js without relying on third-party libraries like Socket.io.

## Requirements and Features:

### Key Requirements:
1. Use Node.js as the backend server framework.
2. Implement the chat application using native WebSockets.
3. Enable two users to exchange messages in real time.
4. Implement basic error handling for disconnections and invalid usernames.

### Additional Features:

* User signup and login functionality.
* Logout functionality.
* Fetch and display a list of all users.
* Ability to start a chat with a specific user.
* Display of messages with sender-based styling.


### Installation:

1. Clone the project repository.
2. Ensure Node.js is installed on your system.
3. Run npm install to install project dependencies.
4. Start the server by running node server.js.
5. Open login.html in a web browser using http://localhost:3000/.

### Usage:

#### Signup:

1. Enter a username and password.
2. Click the signup button.
3. If successful, you will be redirected to the login page.

#### Login:

1. Enter your username and password.
2. Click the login button.
3. If successful, you will be redirected to the chat page.

#### Chat:

1. After logging in, you will see a list of all users.
2. Click on a username to start a chat.
3. Send messages using the input field at the bottom.
4. Messages are displayed in a conversation-style format.

#### Logout:

1. Click the logout button to log out and return to the login/signup page.

### Code Overview:

#### Frontend (app.js):

* Handles user interactions, including signup, login, and chat initiation.
* Manages WebSocket connections for real-time communication.
* Implements message sending and display functionalities.

#### Backend (server.js):

* Serves static files (HTML, CSS, JS) and handles WebSocket connections.

### Error Handling:
* Errors during signup and login are displayed to the user.
* WebSocket disconnection results in a page reload with a alert.

### Best Practices:

* Code is organized into separate functions for clarity and maintainability.
* Consistent coding style and indentation.
* Proper use of async/await for asynchronous operations.

### Conclusion:
The Real-Time Chat Application successfully implements the specified requirements, providing a seamless one-on-one chat experience. The code is well-organized, follows best practices, and includes error handling for a smoother user experience.