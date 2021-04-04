const express = require('express');
const bodyParser = require('body-parser');
var WebSocketServer = require('websocket').server;

const PROD = false;

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.use('/', (req, res, next) => {
    console.log(req.headers);
    const body = req.body;
    res.send(body);
});

const httpServer = app.listen(PORT, () => {
    console.log(`Up and running on port ${PORT}`);
});

const wsServer = new WebSocketServer({
    httpServer: httpServer,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return process.env.NODE_ENV === "production" ? origin === "web-roams.herokuapp.com" : "localhost:8080";
}

wsServer.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    const connection = request.accept('protocol1', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
        }
    });
    connection.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});