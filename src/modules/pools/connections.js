// Пул конекшенов - шоб пинговать

const connections = [];

export default connection => {
    connections.push(connection);
};
