import { log } from '../journal/index';

/**
 * @param {object} player
 * @returns {function} функция чтения входящих сообщений
 */
const makeReader = player => {
    return message => {
        const connection = player.connection;

        switch (message.event) {
            case 'logout':
                connection.dispatcher.rollback();
                connection.player = null;

                player.disconnect();

                connection.send('logout');
                break;
            case 'startSearch':
                break;
            case 'cancelSearch':
                break;
            case 'getState':
                connection.send('state', 'player');
                break;
        }
    };
};

/**
 * @param {Object} connection
 * @param {number} userId
 *
 * @returns {object} объект-плеер
 */
export default (connection, userId) => {
    const player = Object.create(null);

    connection.player = player;
    connection.dispatcher.set(makeReader(player));

    player.connection = connection;
    player.userId = userId;
    player.state = Object.create(null);

    player.disconnect = () => {
        player.connection = null;
        player.dcTime = Date.now();

        log('logout!', player.userId);
    };

    return player;
};
