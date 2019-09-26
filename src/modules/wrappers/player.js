/**
 * @param {Object} connection
 * @param {number} userId
 *
 * @returns {object} объект-плеер
 */
export default (connection, userId) => {
    const player = Object.create(null);

    connection.player = player;

    player.connection = connection;
    player.userId = userId;

    return player;
};
