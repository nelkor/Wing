/**
 * @param {object} socket
 * @returns {function} функция отправки JSON-сообщений по сокету
 */
const makeSend = socket => {
    return (event, data) => {
        const str = JSON.stringify({ event, data });

        socket.send(str);
    };
};

/**
 * @returns {object} объект-диспетчер
 */
const makeDispatcher = () => {
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
const makeReader = connection => {
    return message => {
        switch (message.event) {
            case 'auth':

                // Возможно этот плеер уже сидит в пуле плееров
                // Чи да и он имеет конекшена - например, запретить вход
                // (либо выкинуть того конекшена и подменить этим)
                // Чи не, про пихнуть конекшена в этого плеера

                // Если в пуле плееров этого плеера нет:
                // Создать обёртку-плеер на основе конекшена
                // Пихнуть плеера в пул плееров
                // Ответить клиенту

                break;
            // case 'reg':
            //     break;
            case 'token':
                break;
            case 'logout':
                break;
            case 'getState':
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
    connection.send = makeSend(socket);
    connection.state = Object.create(null);
    connection.dispatcher = makeDispatcher();

    connection.dispatcher.set(makeReader(connection));

    const onMessage = message => {
        try {
            message = JSON.parse(message);
        } catch (e) {
            return;
        }

        const reader = connection.dispatcher.get();

        reader(message);
    };

    // TODO: Добавить обработчик дисконекта
    // Если конекшен обёрнут в плеера, плееру конекшен надо отсоединить
    // Потом удалить конекшена из пула конекшенов
    const onClose = () => {
        console.log('Disconnect!', connection.ip);
    };

    socket.on('message', onMessage);
    socket.on('close', onClose);

    // TODO придумать логику пингования
    connection.ping = () => socket.ping();

    return connection;
};
