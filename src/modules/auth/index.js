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

const strCmp = (str1, str2) => str1.toLowerCase() == str2.toLowerCase();

export const logIn = async (name, password) => {
    const user = users.find(u => strCmp(u.name, name));

    if ( ! user) return { reason: 'name' };
    if (user.password != password) return { reason: 'password' };

    return {
        ok: true,
        id: user.id,
        name: user.name,
    };
};
