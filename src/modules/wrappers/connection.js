// modules
import { log } from '../journal/index';
import makePlayer from './player';
import { findPlayer, playerToPool } from '../pools/players';
import { rmConFromPool } from '../pools/connections';
import { logIn, checkToken } from '../auth/index';

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
 * @returns {{ set, get, rollback }} объект-диспетчер
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

// Нечитаемая ифовая логика (но работает как часы).
// Надеюсь, что когда-нибудь смогу переделать красиво
/**
 * Производит все нужные проверки при аутентификации,
 * отправляет сообщения, создаёт плеера, кладёт в пул и т.д.
 *
 * @param {{ ok, reason, userId, userName, token }} auth
 * @param {{ authAttempts, send }} connection
 *
 * @returns void
 */
const checkAuth = (auth, connection) => {
    if (!auth.ok) {
        const data = { reason: auth.reason };

        connection.send('auth', data);

        return;
    }

    const { userId, userName, token } = auth;
    const inPool = findPlayer(userId);

    if (inPool) {
        if (inPool.connection) {
            const attempts = connection.authAttempts;

            const replace = attempts[userId]
                && attempts[userId] < Date.now() + 6e4;

            if (replace) {
                const notice = { replacement: true };

                inPool.connection.send('logout', notice);

                inPool.disconnect();
                inPool.connect(connection);

                const data = {
                    ok: true,
                    token,
                    id: userId,
                    name: userName,
                    replacement: true,
                };

                connection.send('auth', data);

                return;
            }

            attempts[userId] = Date.now();

            const data = {
                token,
                name: userName,
                reason: 'replacement',
            };

            inPool.connection.send('notice', 'replacement');
            connection.send('auth', data);

            return;
        }

        inPool.connect(connection);

        const data = {
            ok: true,
            token,
            id: userId,
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
            token,
            id: userId,
            name: userName,
        };

        connection.send('auth', data);
    }
};

/**
 * @param {object} connection
 * @returns {function} функция чтения входящих сообщений
 */
const makeReader = connection => {
    return async message => {
        switch (message.event) {
            case 'auth':
                if (!message.data) return;

                const { name, password } = message.data;

                return checkAuth(await logIn(name, password), connection);
            case 'token':
                if (!message.data) return;

                return checkAuth(await checkToken(message.data), connection);
            case 'reg':
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
