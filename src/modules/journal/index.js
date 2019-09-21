const logs = [];

export default (event, item) => {
    console.log('Log:', event);
    console.log(item);

    logs.push(item);
};
