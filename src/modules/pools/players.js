// Пул плееров - шоб находить тех, кто ищет игру
// Шоб плеер оставался в системе при отвале конекшена
// Если плеер остался без конекшена - удалить его через 5 минут

const players = [];

export const findPlayer = id => players.find(p => p.id == id);

export const playerToPool = player => players.push(player);
