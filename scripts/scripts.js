// Open a new websocket
var webSocket = new WebSocket("wss://localhost:44322/ws/1");

var AuthKey = "AUTHORIZATIONKEY";

// Manually open a new websocket
function OpenSocket() {
    webSocket = new WebSocket("wss://localhost:44322/ws/1");
}

// OnOpen change a field in the html page to indicate that the socket is open
webSocket.onopen = function () {
    //Send the authentication key in a JSON object as the first message
    var msg = {
        AuthenticationKey: "AUTHORIZATIONKEY",
    };
    webSocket.send(JSON.stringify(msg));
}

// Listen for incoming messages
webSocket.onmessage = function (event) {
    // Convert the incoming message
    try {
        var socketmessage = JSON.parse(event.data);
        // Check what type of message you are receiving
        switch (socketmessage.MessageType) {
            case "IncomingMessage":
                // In case of an incoming message, add the message to the screen
                DisplayNewMessage(socketmessage.Message, false);
                break;
            case "InteractionUpdate":
                // In case of an update of the interactions, process the interaction counts into the page
                console.log(socketmessage.Message)
                break;
            case "MessageResponse":
                if (socketmessage.Message.Success) {
                    // In case of a response for a posted message, add the message if successful
                    DisplayNewMessage(socketmessage.Message.Data, true);
                    document.getElementById("NewMessageBtn").disabled = false;
                    document.getElementById("MessageSending").hidden = true;
                } else {
                    // In case of a response for a posted message, show an alert if unsuccessful
                    alert("Failed to post message, error code(s): " + socketmessage.Message.ErrorMessage.toString())
                    document.getElementById("NewMessageBtn").disabled = false;
                    document.getElementById("MessageSending").hidden = true;
                }
                break;
            case "InteractionResponse":
                if (!socketmessage.Message.Success) {
                    alert("Failed to post interaction, error code(s): " + socketmessage.Message.ErrorMessage.toString())
                }
                break;
            default:

                break;
        }
    } catch {
        if (event.data == "Authorization passed, connection now open") {
            document.getElementById("socketstatus").innerHTML = "DEBUG: SOCKET OPEN";
        }
        alert(event.data);
    }
}

function DisplayNewMessage(Message, OwnMessage) {
    //Create the required elements
    var tr = document.createElement("tr")
    var td1 = document.createElement("td");
    var td2 = document.createElement("td");
    var td3 = document.createElement("td");
    //Populate the elements
    tr.setAttribute("id", Message.MessageID);
    if (OwnMessage) {
        td3.innerHTML = new Date(Message.Timestamp).toLocaleTimeString();
        td3.classList.add("chatdate");
        td2.innerHTML = Message.MessageText;
        td2.classList.add("OwnMessage");
    } else {
        td1.innerHTML = new Date(Message.Timestamp).toLocaleTimeString();
        td1.classList.add("chatdate");
        td2.innerHTML = `${Message.UserName}<br>${Message.MessageText}<br><button onclick="InteractWithMessage(${Message.MessageID}, 1)">Like</button><button onclick="InteractWithMessage(${Message.MessageID}, 2)">Dislike</button>`;
    }
    //Append the children
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    document.getElementById("returnthing").appendChild(tr);
}

// Send new messages
function SendMessage() {
    // Create an object with the required parameters
    var msg = {
        messageType: "PostMessage",
        messageText: document.getElementById("SendField").value,
        userID: document.getElementById("UserField").value,
    };
    // Send the object as a string through the websocket
    webSocket.send(JSON.stringify(msg));
    // Handle the message to post it on the screen
    document.getElementById("NewMessageBtn").disabled = true;
    document.getElementById("MessageSending").hidden = false;
}

// Send new messages
function InteractWithMessage(MessageID, InteractionType) {
    // Create an object with the required parameters
    var msg = {
        messageType: "PostInteraction",
        messageID: MessageID,
        userID: document.getElementById("UserField").value,
        InteractionType: InteractionType
    };
    // Send the object as a string through the websocket
    webSocket.send(JSON.stringify(msg));
}

// Close the websocket
function Close() {
    webSocket.send("Closing connection");
    webSocket.close();
    document.getElementById("socketstatus").innerHTML = "DEBUG: SOCKET CLOSED";
}