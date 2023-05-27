import { sendMessage, MessageType } from "./video connection.js";

document.getElementById('withdraw').addEventListener('click', function() {
    sendOperationMessage(1);
});

document.getElementById('delete').addEventListener('click', function() {
    sendOperationMessage(2);
});

function sendOperationMessage(operationData) {
    var message = {
      MessageType: MessageType.Control,
      Data: operationData
    }
    sendMessage(message);
  }