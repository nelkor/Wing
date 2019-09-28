// modules
import { log } from '../journal/index';
import makePlayer from './player';
import { findPlayer, playerToPool } from '../pools/players';
import { rmConFromPool } from '../pools/connections';
import { logIn } from '../auth/index';

/**
 * @param {object} socket
 * @returns {function} функция отправки JSON-сообщений по сокету
 */
const makeSend = socket => {
    return (event, data = null) => {
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
    return async message => {
        switch (message.event) {
            // Нечитаемая ифовая логика (но работает как часы).
            // Надеюсь, что когда-нибудь смогу переделать красиво
            case 'auth':
                if (!message.data) return;

                const { name, password } = message.data;
                const result = await logIn(name, password);

                if (!result.ok) {
                    const data = { reason: result.reason };

                    connection.send('auth', data);

                    return;
                }

                const { id: userId, name: userName } = result;
                const inPool = findPlayer(userId);

                if (inPool) {
                    if (inPool.connection) {
                        const attempts = connection.authAttempts;
                        const id = inPool.userId;

                        const replace = attempts[id]
                            && attempts[id] < Date.now() + 6e4;

                        if (replace) {
                            const notice = { replacement: true };

                            inPool.connection.send('logout', notice);

                            inPool.disconnect();
                            inPool.connect(connection);

                            const data = {
                                ok: true,
                                name: userName,
                                replacement: true,
                            };

                            connection.send('auth', data);

                            return;
                        }

                        attempts[id] = Date.now();

                        const cpNotice = { replacement: true };

                        const ccNotice = {
                            name: userName,
                            replacement: true,
                        };

                        inPool.connection.send('notice', cpNotice);

                        connection.send('auth', ccNotice);

                        return;
                    }

                    inPool.connect(connection);

                    const data = {
                        ok: true,
                        name: userName,
                        reconnect: true,
                    };

                    connection.send('auth', data);
                } else {

                    const player = makePlayer(userId);

                    player.connect(connection);

                    playerToPool(player);

                    const data = {
                        ok: true,
                        name: userName,
                    };

                    connection.send('auth', data);
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
 * @param {{ on, ping, terminate }} socket
 * @param {{ connection: { remoteAddress } }} req
 *
 * @returns {object} объект-connection
 */
export default (socket, req) => {
    const connection = Object.create(null);

    connection.ip = req.connection.remoteAddress;
    connection.send = makeSend(socket);
    connection.state = Object.create(null);
    connection.dispatcher = makeDispatcher();
    connection.authAttempts = {};
    connection.isAlive = true;
    connection.terminate = () => socket.terminate();
    connection.ping = () => socket.ping();

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

    const onClose = () => {
        log('disconnect!', connection.ip);

        if (connection.player) connection.player.disconnect();

        rmConFromPool(connection);
    };

    socket.on('message', onMessage);
    socket.on('close', onClose);
    socket.on('pong', () => connection.isAlive = true);

    return connection;
};
