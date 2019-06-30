/**
 * @param {object} socket
 * @returns {function} функция отправки JSON-сообщений по сокету
 */
const make_send = socket => {
    return (event, data) => {
        const str = JSON.stringify({ event, data });

        socket.send(str);
    };
};

/**
 * @returns {object} объект-диспетчер
 */
const make_dispatcher = () => {
    const stack = [];

    // Методы диспетчера:
    // set: назначить активный reader
    // get: получить активный reader
    // rollback: откатить reader
    // (последний будет удалён, предпоследний станет активным)
    return {
        set: reader => stack.push(reader),
        get: () => stack[stack.length - 1],
        rollback: () => stack.pop(),
    };
};

/**
 * @param {object} connection
 * @returns {function} функция чтения входящих сообщений
 */
const make_reader = connection => {
    return message => {
        switch (message.event) {
            case 'auth':
                break;
            case 'reg':
                break;
            case 'token':
                break;
            case 'get_state':
                connection.send('state', 'connection');
                break;
        }
    };
};

/**
 * @param {WebSocket} socket
 * @param {IncomingMessage} req
 * @returns {object} объект-connection
 */
export default (socket, req) => {
    const connection = Object.create(null);

    connection.ip = req.connection.remoteAddress;
    connection.send = make_send(socket);
    connection.state = Object.create(null);
    connection.dispatcher = make_dispatcher();

    connection.dispatcher.set(make_reader(connection));

    const on_message = message => {
        try {
            message = JSON.parse(message);
        } catch (e) {
            return;
        }

        const reader = connection.dispatcher.get();

        reader(message);
    }

    socket.on('message', on_message);

    // TODO придумать логику пингования
    connection.ping = () => socket.ping();

    return connection;
};
