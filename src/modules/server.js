// node_modules
import ws from 'ws';

// modules
import make_connection from './connection.js';

/**
 * Колбэк каждого нового подключения (сокета)  
 * 
 * Асинк: логирование подключений в БД  
 * 
 * @param {WebSocket} socket
 * @param {IncomingMessage} req
 */
const on_connection = async (socket, req) => {
    const connection = make_connection(socket, req);
};

/**
 * Начинает слушать указанный порт  
 * 
 * @param {number} port
 */
export default port => {
    const server = new ws.Server({ port });

    server.on('connection', on_connection);

    console.log(`Server started! Port: ${port}`);
};
