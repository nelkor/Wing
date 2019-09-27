// Пул конекшенов - шоб пинговать

const connections = [];

export const connectionToPool = connection => connections.push(connection);

export const rmConFromPool = connection => {
    const index = connections.indexOf(connection);

    if (index == -1) return;

    connections.splice(index, 1);
};
