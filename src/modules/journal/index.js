const logs = [];

export const prepare = () => {
    // Подготовить файловую систему для логирования
};

export const log = (event, item) => {
    console.log('Log', event);
    console.log(item);

    logs.push(item);
};
