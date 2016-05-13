var config = {
    appName: "mmoServer",
    port: 3000,
    useDB: true,
    db: {
        host: 'localhost',
        user: 'root',
        password: 'hobbes03',
        database: 'chat'
    }
};

process.title = config.appName;
process.stdout.write('\033c');

module.exports = config;