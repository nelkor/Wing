import { log } from '../journal/index';

/**
 * @param {object} player
 * @returns {function} функция чтения входящих сообщений
 */
const makeReader = player => {
    return async message => {
        const connection = player.connection;

        switch (message.event) {
            case 'logout':
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
 * @param {number} userId
 * @returns {object} объект-плеер
 */
export default userId => {
    const player = Object.create(null);

    player.userId = userId;
    player.state = Object.create(null);

    player.connect = connection => {
        connection.player = player;
        connection.dispatcher.set(makeReader(player));

        player.connection = connection;
    };

    player.disconnect = () => {
        player.connection.dispatcher.rollback();
        player.connection.player = null;

        player.connection = null;
        player.dcTime = Date.now();

        log('logout!', player.userId);
    };

    return player;
};
