// node_modules
import ws from 'ws';

// modules
import makeConnection from './wrappers/connection.js';

/**
 * Колбэк каждого нового подключения (сокета)
 * 
 * @param {WebSocket} socket
 * @param {IncomingMessage} req
 */
const onConnection = (socket, req) => {
    const connection = makeConnection(socket, req);

    // Пихнуть конекшена в пул конекшенов
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
