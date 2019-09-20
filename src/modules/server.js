// node_modules
import ws from 'ws';

// modules
import makeConnection from './wrappers/connection.js';

/**
 * Колбэк каждого нового подключения (сокета)  
 * 
 * Асинк: логирование подключений в БД  
 * 
 * @param {WebSocket} socket
 * @param {IncomingMessage} req
 */
const onConnection = async (socket, req) => {
    const connection = makeConnection(socket, req);
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
