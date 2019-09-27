// Пул плееров - шоб находить тех, кто ищет игру
// Шоб плеер оставался в системе при отвале конекшена
// Если плеер остался без конекшена - удалить его через 5 минут

// Пять минут
const hangingTime = 3e4;

const players = [];

const playerExplorer = (player, index) => {
    console.log('Explore player', player.userId);

    // Отвалившиеся игроки не могут искать игру!
    if ( ! player.connection) {
        if (Date.now() > player.dcTime + hangingTime) {
            players.splice(index, 1);

            console.log('Удалил его!');
        }

        return;
    }

    // TODO логика поиска игры
};

const playersTick = () => {
    console.log('Players tick');

    players.forEach(playerExplorer);

    // Если при исследовании игроков ищущие будут добавляться в массив,
    // то тут надо что-то сделать с этим массивом
};

setInterval(playersTick, 1e4);

export const findPlayer = id => players.find(p => p.id == id);

export const playerToPool = player => players.push(player);
