function parseWebSocketFrame(buffer) {
    const isFinalFrame = (buffer[0] & 0x80) !== 0;
    const opcode = buffer[0] & 0x0F;
    const mask = (buffer[1] & 0x80) !== 0;
    let payloadLength = buffer[1] & 0x7F;
    let payloadOffset = 2;
  
    // Handle extended payload length cases
    if (payloadLength === 126) {
      payloadLength = buffer.readUInt16BE(payloadOffset);
      payloadOffset += 2;
    } else if (payloadLength === 127) {
      // Note: 64-bit length is not supported here
      payloadLength = buffer.readUInt32BE(payloadOffset + 4);
      payloadOffset += 8;
    }
  
    const maskingKey = mask ? buffer.slice(payloadOffset, payloadOffset + 4) : null;
    payloadOffset += mask ? 4 : 0;
  
    // Extract payload and apply masking if necessary
    const payload = mask ? applyMask(buffer.slice(payloadOffset), maskingKey) : buffer.slice(payloadOffset);
  
    return {
      isFinalFrame,
      opcode,
      payload,
    };
  }
  
  function applyMask(payload, mask) {
    for (let i = 0; i < payload.length; i++) {
      payload[i] ^= mask[i % 4];
    }
    return payload;
  }
  
  module.exports = {
    parseWebSocketFrame,
  };
  