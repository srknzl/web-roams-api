const WebSocketServer = require('websocket').server;

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return process.env.NODE_ENV === "production" ? origin === "https://web-roams.herokuapp.com" : "http://localhost:8080";
}

module.exports.setupWs = function (httpServer) {
    const wsServer = new WebSocketServer({
        httpServer: httpServer,
        autoAcceptConnections: false
    });

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
}

