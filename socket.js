const crypto = require('crypto');
const { parseWebSocketFrame } = require('./util/util');
const clients = new Map(); // Using Map to associate user IDs with WebSocket connections

function configureWebSocket(server) {
  function createWebSocketFrame(payload) {
    const payloadString = JSON.stringify(payload);
    const payloadLength = Buffer.from(payloadString, 'utf8').length;

    // Prepare the frame header
    const header = Buffer.alloc(2);
    header.writeUInt8(0x81, 0); // FIN + Text frame opcode

    // Set payload length and mask flag
    if (payloadLength <= 125) {
      header.writeUInt8(payloadLength, 1);
    } else if (payloadLength <= 0xFFFF) {
      header.writeUInt8(126, 1);
      header.writeUInt16BE(payloadLength, 2);
    }

    // Concatenate header and payload
    const frame = Buffer.concat([header, Buffer.from(payloadString, 'utf8')]);

    return frame;
  }

  server.on('upgrade', (req, socket) => {
    if (req.headers['upgrade'] !== 'websocket') {
      socket.end('HTTP/1.1 400 Bad Request');
      return;
    }

    const userId = req.url.substr(1); // Use a local variable for userId
    const acceptKey = req.headers['sec-websocket-key'];

    if (!acceptKey) {
      console.error('WebSocket key not found in headers');
      socket.end('HTTP/1.1 400 Bad Request');
      return;
    }

    const acceptHash = crypto
      .createHash('sha1')
      .update(acceptKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary')
      .digest('base64');

    const responseHeaders = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${acceptHash}`,
      '\r\n',
    ];

    socket.write(responseHeaders.join('\r\n'));

    clients.set(userId, socket);

    socket.on('data', handleWebSocketData);
    socket.on('end', () => handleWebSocketEnd(userId));

    function handleWebSocketData(data) {
      try {
        const parsedFrame = parseWebSocketFrame(data);

        if (parsedFrame.opcode === 0x1 || parsedFrame.opcode === 0x8) {
          handleTextFrame(parsedFrame.payload);
        } else {
          console.error('Received non-text frame. Currently only handling text frames.');
        }
      } catch (error) {
        console.error('Error parsing WebSocket frame:', error);
        // Handle the error here, e.g., log it or implement a fallback mechanism
      }
    }

    function handleTextFrame(payload) {
      const payloadString = payload.toString('utf8');

      try {
        const jsonData = JSON.parse(payloadString);
        console.log(jsonData, 'Received JSON data');

        const recipientUserId = jsonData.to;
        const recipient = clients.get(recipientUserId);
        const response = {
          type: 'message',
          content: jsonData.content,
          from: userId,
        };

        const frame = createWebSocketFrame(response);
    
        if (recipient && !recipient.destroyed) {
          recipient.write(frame);
        }
      } catch (error) {
        console.error('Error parsing payload to JSON:', error);
        console.error('Payload that caused the error:', payloadString);
        // Handle the error here, e.g., log it or implement a fallback mechanism
      }
    }

    function handleWebSocketEnd(userId) {
      clients.delete(userId);
      console.log(`WebSocket connection closed for user ${userId}`);
    }
  });
}

module.exports = {
  configureWebSocket,
};
