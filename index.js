const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const { setupWs } = require('./ws');

let client;

/*
Connects to postgres db in heroku 
*/
function connectToDb() {
    client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
    client.connect();
}

connectToDb();


client
    .query('SELECT * FROM users;')
    .then(res => console.log(res.rows))
    .catch(e => console.error(e.stack))


/*
Sets up express server and returns http server for 
use in websocket server 
*/
function setupExpress() {
    const app = express();
    app.use(bodyParser.json());

    const PORT = process.env.PORT || 3000;

    app.use(express.static('dist'));

    const httpServer = app.listen(PORT, () => {
        console.log(`Up and running on port ${PORT}`);
    });
    return httpServer;
}

const httpServer = setupExpress();

setupWs(httpServer);