// modules
import { log } from '../journal/index';
import makePlayer from './player';
import { findPlayer, playerToPool } from '../pools/players';

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

                // Положительный результат авторизации
                const userId = 1;
                const name = 'Nelkor';

                // Возможно этот плеер уже сидит в пуле плееров
                const inPool = findPlayer(userId);

                if (!inPool) {
                    // Не сидит

                    // Создать обёртку-плеер на основе конекшена
                    const player = makePlayer(connection, userId);
                    // Пихнуть плеера в пул плееров
                    playerToPool(player);

                    // Ответить клиенту
                    const data = {
                        name,
                        ok: true,
                        // reconnect: false,
                        // replacement: false,
                    };

                    connection.send('auth', data);
                } else {
                    // Сидит

                    // Чи он имеет конекшена -
                    // выкинуть того конекшена и подменить этим
                    // Чи не имеет, пихнуть конекшена в этого плеера

                    // Ответить клиенту
                }

                break;
            case 'reg':
                break;
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
 *
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
        log('disconnect!', connection.ip);
    };

    socket.on('message', onMessage);
    socket.on('close', onClose);

    // TODO придумать логику пингования
    connection.ping = () => socket.ping();

    return connection;
};
