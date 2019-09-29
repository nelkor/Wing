const users = [
    {
        id: 1,
        name: 'Bran',
        password: '1234',
    },
    {
        id: 2,
        name: 'Jon',
        password: '2345',
    },
    {
        id: 3,
        name: 'Rob',
        password: '3456',
    },
    {
        id: 4,
        name: 'Arya',
        password: '4567',
    },
];

// TODO по таймеру обходить токены
// удалять слишком старые (например, суточной давности)
const tokens = {};

const strCmp = (str1, str2) => str1.toLowerCase() == str2.toLowerCase();

const createToken = id => {
    const secret = new Array(6)
        .fill(null)
        .map(() => Math.random().toString(36).substring(2))
        .join('');

    tokens[id] = `${id}.${Date.now()}.${secret}`;

    return tokens[id];
};

export const logIn = async (name, password) => {
    // await Запрос к БД пользователей
    const user = users.find(u => strCmp(u.name, name));

    if ( ! user) return { reason: 'name' };
    if (user.password != password) return { reason: 'password' };

    const token = createToken(user.id);

    return {
        ok: true,
        token,
        userId: user.id,
        userName: user.name,
    };
};

/**
 * @param token
 * @returns {Promise<*>}
 */
export const checkToken = async token => {
    const userId = token.split('.').shift();
    const knownToken = tokens[userId];

    if ( ! userId || knownToken != token) return { reason: 'token' };

    // await Запрос к БД пользователей
    const user = users.find(u => u.id == userId);

    if ( ! user) return { reason: 'token' };

    const newToken = createToken(userId);

    return {
        ok: true,
        token: newToken,
        userId,
        userName: user.name,
    };
};
