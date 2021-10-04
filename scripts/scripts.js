// Open a new websocket
var webSocket = new WebSocket("wss://localhost:44322/ws/1");

// Manually open a new websocket
function OpenSocket(){
    webSocket = new WebSocket("wss://localhost:44322/ws/1");
}

// OnOpen change a field in the html page to indicate that the socket is open
webSocket.onopen = function () {
    webSocket.send("Establishing connection");
    document.getElementById("socketstatus").innerHTML = "DEBUG: SOCKET OPEN";
}

// Listen for incoming messages
webSocket.onmessage = function (event) {
    // Convert the incoming message
    var socketmessage = JSON.parse(event.data);
    // Check what type of message you are receiving
    switch(socketmessage.MessageType){
        case "IncomingMessage":
            // In case of an incoming message, add the message to the screen
            var tr = "<tr><td>"+ new Date(socketmessage.Message.Timestamp).toLocaleTimeString()+"</td><td><p>"+socketmessage.Message.UserName +"<br>" + socketmessage.Message.MessageText + "</p></td><td></td></tr>";
            document.getElementById("returnthing").innerHTML += tr;
            break;
        case "PostResponse":
            // In case of a response for a newly posted message, change the spinning icon
            if (socketmessage.Message.Success) {
                document.getElementById("New").classList.remove('spinner-border');
                document.getElementById("New").innerHTML = new Date(socketmessage.Message.Data.Timestamp).toLocaleTimeString();
                document.getElementById("New").removeAttribute("id");
                document.getElementById("NewMessageBtn").disabled = false;
            } else {
                document.getElementById("New").parentElement.style.backgroundColor = "Red";
                document.getElementById("New").classList.remove('spinner-border');
                document.getElementById("NewMessageBtn").disabled = false;
                document.getElementById("New").removeAttribute("id");
            }
            break;
    }
}

// Send new messages
function SendMessage() {
    // Create an object with the required parameters
    var msg = {
        messageType: "NewMessage",
        messageText: document.getElementById("SendField").value,
        userID: document.getElementById("UserField").value,
    };
    // Send the object as a string through the websocket
    webSocket.send(JSON.stringify(msg));
    // Handle the message to post it on the screen
    var tr = "<tr><td></td><td><p class=\"chatmessage\">" + msg.messageText + "</p></td><td class=\"chatdate spinner-border spinner-border-sm\" id=\"New\"></td></tr>";
    document.getElementById("returnthing").innerHTML += tr;
    document.getElementById("NewMessageBtn").disabled = true;
}

// Close the websocket
function Close() {
    webSocket.send("Closing connection");
    webSocket.close();
    document.getElementById("socketstatus").innerHTML = "DEBUG: SOCKET CLOSED";
}