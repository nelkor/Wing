// modules
import { log } from '../journal/index';

const connections = [];

const connectionExplorer = (connection, index) => {
    if (!connection.isAlive) {
        connections.splice(index, 1);
        connection.terminate();

        return;
    }

    connection.isAlive = false;
    connection.ping();
};

const connectionsTick = () => {
    console.log('Connections tick!');

    connections.forEach(connectionExplorer);

    // Вести подсчёт и логировать количество соединений
    // и число разрывов за тик.
    // Это позволит знать онлайн сервера за любое время
    // и статистику отвалов соединений.
};

setInterval(connectionsTick, 1e4);

export const connectionToPool = connection => connections.push(connection);

export const rmConFromPool = connection => {
    const index = connections.indexOf(connection);

    if (index == -1) return;

    connections.splice(index, 1);
};
