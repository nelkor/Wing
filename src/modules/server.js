// node_modules
import ws from 'ws';

// modules
import makeConnection from './wrappers/connection';
import log from './journal/index';
import connectionToPool from './pools/connections';

/**
 * Колбэк каждого нового подключения (сокета)
 * 
 * @param {WebSocket} socket
 * @param {IncomingMessage} req
 */
const onConnection = (socket, req) => {
    const connection = makeConnection(socket, req);

    log('connection', connection.ip);

    connectionToPool(connection);
};

/**
 * Начинает слушать указанный порт  
 * 
 * @param {number} port
 */
export default port => {
    const server = new ws.Server({ port });

    server.on('connection', onConnection);

    console.log(`Server started! Port: ${port}`);
};
